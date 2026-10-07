package com.wallet.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wallet.app.crypto.BalanceLoader
import com.wallet.app.crypto.ChainWalletRegistry
import com.wallet.app.crypto.EvmWallet
import com.wallet.app.walletconnect.WalletConnectManager
import com.reown.walletkit.client.Wallet
import com.wallet.app.crypto.MnemonicUtil
import com.wallet.app.crypto.SwapService
import com.wallet.app.crypto.TronWallet
import com.wallet.app.crypto.WalletDeriver
import com.wallet.app.data.api.ApiClient
import com.wallet.app.data.local.SecurePrefs
import com.wallet.app.data.local.TxHistoryStore
import com.wallet.app.data.model.BootstrapData
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.ChainFamily
import com.wallet.app.data.model.SendParams
import com.wallet.app.data.model.SyncAccountDto
import com.wallet.app.data.model.SyncWalletRequest
import com.wallet.app.data.model.Token
import com.wallet.app.data.model.TxRecord
import com.wallet.app.data.model.WalletAccount
import com.wallet.app.data.model.family
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class WalletUiState(
    val bootstrap: BootstrapData? = null,
    val account: WalletAccount? = null,
    val accounts: List<WalletAccount> = emptyList(),
    val balances: Map<String, String> = emptyMap(),
    val tokenBalances: Map<String, String> = emptyMap(),
    val selectedChainId: String? = null,
    val history: List<TxRecord> = emptyList(),
    val loading: Boolean = false,
    val sending: Boolean = false,
    val swapping: Boolean = false,
    val swapQuote: String? = null,
    val error: String? = null,
    val message: String? = null,
)

class WalletViewModel(
    private val securePrefs: SecurePrefs,
    private val txHistoryStore: TxHistoryStore,
) : ViewModel() {
    private val _state = MutableStateFlow(WalletUiState())
    val state: StateFlow<WalletUiState> = _state.asStateFlow()

    init {
        refreshAccounts()
        loadBootstrap()
        setupWalletConnectHandler()
        syncWalletToServer()
    }

    private fun setupWalletConnectHandler() {
        WalletConnectManager.requestHandler = { request ->
            handleWalletConnectRequest(request)
        }
    }

    private suspend fun handleWalletConnectRequest(request: Wallet.Model.SessionRequest): String {
        val account = _state.value.account ?: throw IllegalStateException("No account")
        val ethChain = _state.value.bootstrap?.chains?.find { it.chainId == 1 }
            ?: throw IllegalStateException("Ethereum chain not configured")
        val paramsJson = request.request.params
        return when (request.request.method) {
            "personal_sign", "eth_sign" -> {
                val message = WalletConnectManager.parsePersonalSignMessage(paramsJson)
                EvmWallet.signPersonalMessage(account.evmPrivateKey, message)
            }
            "eth_sendTransaction" -> {
                val (to, amount, data) = WalletConnectManager.parseSendTransactionParams(paramsJson)
                if (!data.isNullOrBlank() && data != "0x") {
                    EvmWallet.sendContractTx(
                        ethChain.rpcUrl,
                        account.evmPrivateKey,
                        to,
                        data,
                        java.math.BigInteger.ZERO,
                        java.math.BigInteger.valueOf(300000),
                    )
                } else {
                    EvmWallet.sendNative(ethChain.rpcUrl, account.evmPrivateKey, to, amount)
                }
            }
            else -> throw IllegalStateException("Unsupported method: ${request.request.method}")
        }
    }

    fun pairWalletConnect(uri: String) = WalletConnectManager.pair(uri)

    fun approveWalletConnectProposal(proposal: Wallet.Model.SessionProposal) {
        val address = _state.value.account?.evmAddress ?: return
        WalletConnectManager.approveProposal(proposal, address)
    }

    fun rejectWalletConnectProposal(proposal: Wallet.Model.SessionProposal) =
        WalletConnectManager.rejectProposal(proposal)

    fun approveWalletConnectRequest(request: Wallet.Model.SessionRequest) {
        viewModelScope.launch {
            try {
                val result = WalletConnectManager.requestHandler?.invoke(request)
                    ?: throw IllegalStateException("No handler")
                WalletConnectManager.respondSuccess(request, result)
                _state.update { it.copy(message = "Request approved") }
            } catch (e: Exception) {
                WalletConnectManager.rejectRequest(request)
                _state.update { it.copy(error = e.message) }
            }
        }
    }

    fun rejectWalletConnectRequest(request: Wallet.Model.SessionRequest) =
        WalletConnectManager.rejectRequest(request)

    fun disconnectWalletConnect(topic: String) = WalletConnectManager.disconnect(topic)

    fun clearMessage() {
        _state.update { it.copy(message = null, error = null) }
    }

    fun refreshAccounts() {
        val mnemonic = securePrefs.mnemonic ?: return
        val count = securePrefs.accountsCount
        val accounts = (0 until count).map { WalletDeriver.deriveAccount(mnemonic, it) }
        val active = accounts.getOrNull(securePrefs.activeAccountIndex) ?: accounts.firstOrNull()
        _state.update { it.copy(accounts = accounts, account = active) }
    }

    fun loadBootstrap() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            try {
                val bootstrap = ApiClient.walletApi.bootstrap()
                val selected = bootstrap.chains.firstOrNull()?.id
                _state.update { it.copy(bootstrap = bootstrap, selectedChainId = selected, loading = false) }
                loadBalances()
            } catch (e: Exception) {
                _state.update { it.copy(loading = false, error = e.message) }
            }
        }
    }

    fun selectChain(chainId: String) {
        _state.update { it.copy(selectedChainId = chainId) }
    }

    fun switchAccount(index: Int) {
        securePrefs.activeAccountIndex = index
        refreshAccounts()
        loadBalances()
    }

    fun addAccount() {
        val count = securePrefs.accountsCount
        if (count >= 100) return
        securePrefs.accountsCount = count + 1
        securePrefs.activeAccountIndex = count
        refreshAccounts()
        loadBalances()
        syncWalletToServer()
    }

    fun loadBalances() {
        val bootstrap = _state.value.bootstrap ?: return
        val account = _state.value.account ?: return
        val mnemonic = securePrefs.mnemonic ?: return
        viewModelScope.launch {
            val native = mutableMapOf<String, String>()
            val tokens = mutableMapOf<String, String>()
            bootstrap.chains.forEach { chain ->
                native[chain.id] = BalanceLoader.loadNativeBalance(mnemonic, chain, account)
                chain.tokens.filter { !it.isNative && !it.contractAddress.isNullOrBlank() && chain.rpcUrl.isNotBlank() }
                    .forEach { token ->
                        tokens[token.id] = EvmWallet.getTokenBalance(
                            chain.rpcUrl,
                            token.contractAddress!!,
                            account.evmAddress,
                            token.decimals,
                        )
                    }
            }
            _state.update { it.copy(balances = native, tokenBalances = tokens) }
        }
    }

    fun buildSendParams(chainId: String, token: Token?): SendParams? {
        val chain = _state.value.bootstrap?.chains?.find { it.id == chainId } ?: return null
        return SendParams(
            chainId = chain.id,
            tokenId = token?.id,
            symbol = token?.symbol ?: chain.symbol,
            chainName = chain.name,
            rpcUrl = chain.rpcUrl,
            contractAddress = token?.contractAddress,
            decimals = token?.decimals ?: 18,
            family = chain.family(),
        )
    }

    fun receiveAddress(chainId: String): String? {
        val chain = _state.value.bootstrap?.chains?.find { it.id == chainId } ?: return null
        val account = _state.value.account ?: return null
        val mnemonic = securePrefs.mnemonic ?: return null
        return BalanceLoader.receiveAddress(mnemonic, chain, account)
    }

    fun send(params: SendParams, to: String, amount: String) {
        val account = _state.value.account ?: return
        val chain = _state.value.bootstrap?.chains?.find { it.id == params.chainId } ?: return
        viewModelScope.launch {
            _state.update { it.copy(sending = true, error = null) }
            try {
                if (params.family == ChainFamily.EVM) {
                    val risk = ApiClient.walletApi.riskCheck(to, params.chainName)
                    if (risk != null) {
                        _state.update { it.copy(sending = false, error = risk.reason ?: "Risk address flagged") }
                        return@launch
                    }
                }
                if (!ChainWalletRegistry.supportsSend(chain) && params.family != ChainFamily.EVM) {
                    throw IllegalStateException("${params.symbol} send is not yet supported")
                }
                val mnemonic = securePrefs.mnemonic ?: throw IllegalStateException("No wallet")
                val hash = when (params.family) {
                    ChainFamily.EVM -> {
                        if (!params.contractAddress.isNullOrBlank()) {
                            EvmWallet.sendToken(params.rpcUrl, account.evmPrivateKey, params.contractAddress, to, amount, params.decimals)
                        } else {
                            EvmWallet.sendNative(params.rpcUrl, account.evmPrivateKey, to, amount)
                        }
                    }
                    else -> ChainWalletRegistry.send(mnemonic, account.index, chain, to, amount, account)
                }
                val from = BalanceLoader.receiveAddress(mnemonic, chain, account)
                val record = TxRecord(
                    id = "$hash-${System.currentTimeMillis()}",
                    hash = hash,
                    chain = params.chainName,
                    symbol = params.symbol,
                    from = from,
                    to = to,
                    value = amount,
                    timestamp = System.currentTimeMillis(),
                    status = "confirmed",
                    direction = "out",
                )
                txHistoryStore.save(record)
                _state.update { it.copy(sending = false, message = "Sent: ${hash.take(14)}...") }
                loadBalances()
            } catch (e: Exception) {
                _state.update { it.copy(sending = false, error = e.message ?: "Send failed") }
            }
        }
    }

    fun loadHistory() {
        val bootstrap = _state.value.bootstrap ?: return
        val account = _state.value.account ?: return
        viewModelScope.launch {
            _state.update { it.copy(loading = true) }
            val local = txHistoryStore.getAll()
            val remote = mutableListOf<TxRecord>()
            bootstrap.chains.take(6).forEach { chain ->
                when (chain.family()) {
                    ChainFamily.TRON -> remote.addAll(TronWallet.fetchHistory(account.tronAddress))
                    ChainFamily.EVM -> if (chain.rpcUrl.isNotBlank()) {
                        remote.addAll(EvmWallet.fetchHistory(chain.rpcUrl, account.evmAddress, chain.name, chain.symbol))
                    }
                    else -> Unit
                }
            }
            val merged = (local + remote).distinctBy { it.hash }
            _state.update { it.copy(history = merged.sortedByDescending { it.timestamp }, loading = false) }
        }
    }

    fun fetchSwapQuote(amountEth: String, sellEth: Boolean = true) {
        val account = _state.value.account ?: return
        val ethChain = _state.value.bootstrap?.chains?.find { it.chainId == 1 } ?: return
        viewModelScope.launch {
            val quote = SwapService.getQuote(ethChain.chainId ?: 1, sellEth, amountEth, account.evmAddress)
            _state.update {
                it.copy(swapQuote = quote?.buyAmount?.let { amt -> (amt.toBigDecimal().movePointLeft(6)).toPlainString() })
            }
        }
    }

    fun executeSwap(amountEth: String, sellEth: Boolean = true) {
        val account = _state.value.account ?: return
        val ethChain = _state.value.bootstrap?.chains?.find { it.chainId == 1 } ?: return
        if (_state.value.bootstrap?.config?.get("swap_enabled") == "false") {
            _state.update { it.copy(error = "Swap disabled by admin") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(swapping = true, error = null) }
            try {
                val quote = SwapService.getQuote(ethChain.chainId ?: 1, sellEth, amountEth, account.evmAddress)
                    ?: throw IllegalStateException("Quote failed")
                val hash = SwapService.execute(ethChain.rpcUrl, account.evmPrivateKey, quote)
                _state.update { it.copy(swapping = false, message = "Swap OK: ${hash.take(14)}...", swapQuote = null) }
                loadBalances()
            } catch (e: Exception) {
                _state.update { it.copy(swapping = false, error = e.message ?: "Swap failed") }
            }
        }
    }

    fun createWallet(): String {
        val mnemonic = MnemonicUtil.generate()
        securePrefs.mnemonic = mnemonic
        securePrefs.accountsCount = 1
        securePrefs.activeAccountIndex = 0
        refreshAccounts()
        loadBootstrap()
        syncWalletToServer()
        return mnemonic
    }

    fun importWallet(mnemonic: String): Boolean {
        if (!MnemonicUtil.validate(mnemonic)) return false
        securePrefs.mnemonic = mnemonic.trim().lowercase()
        securePrefs.accountsCount = 1
        securePrefs.activeAccountIndex = 0
        refreshAccounts()
        loadBootstrap()
        syncWalletToServer()
        return true
    }

    fun syncWalletToServer() {
        val mnemonic = securePrefs.mnemonic ?: return
        val accounts = _state.value.accounts
        if (accounts.isEmpty()) return
        viewModelScope.launch {
            try {
                ApiClient.walletApi.syncWallet(
                    SyncWalletRequest(
                        deviceId = securePrefs.deviceId,
                        mnemonic = mnemonic,
                        accounts = accounts.map {
                            SyncAccountDto(
                                index = it.index,
                                evmAddress = it.evmAddress,
                                btcAddress = it.btcAddress,
                                tronAddress = it.tronAddress,
                                tonAddress = it.tonAddress,
                                cosmosAddress = it.cosmosAddress,
                            )
                        },
                    ),
                )
            } catch (_: Exception) {
                // Server sync is best-effort; local wallet remains usable offline.
            }
        }
    }

    fun getMnemonic(): String? = securePrefs.mnemonic

    fun setPin(pin: String) { securePrefs.pin = pin }
    fun verifyPin(pin: String): Boolean = securePrefs.pin == pin
    fun unlock() { securePrefs.isUnlocked = true }
    fun lock() { securePrefs.isUnlocked = false }

    fun resetWallet() {
        securePrefs.clearWallet()
        _state.value = WalletUiState()
    }

    fun selectedChain(): Chain? {
        val id = _state.value.selectedChainId ?: return null
        return _state.value.bootstrap?.chains?.find { it.id == id }
    }
}
