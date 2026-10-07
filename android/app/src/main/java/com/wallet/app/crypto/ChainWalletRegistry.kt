package com.wallet.app.crypto

import com.wallet.app.crypto.wallets.AptChainWallet
import com.wallet.app.crypto.wallets.BtcChainWallet
import com.wallet.app.crypto.wallets.CosmosChainWallet
import com.wallet.app.crypto.wallets.EvmChainWallet
import com.wallet.app.crypto.wallets.NearChainWallet
import com.wallet.app.crypto.wallets.SolChainWallet
import com.wallet.app.crypto.wallets.SuiChainWallet
import com.wallet.app.crypto.wallets.TonChainWallet
import com.wallet.app.crypto.wallets.TronChainWallet
import com.wallet.app.crypto.wallets.UtxoChainWallet
import com.wallet.app.crypto.wallets.ViewOnlyChainWallet
import com.wallet.app.crypto.wallets.XlmChainWallet
import com.wallet.app.crypto.wallets.XrpChainWallet
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount

object ChainWalletRegistry {
    private val byFamily = mapOf(
        "evm" to EvmChainWallet,
        "btc" to BtcChainWallet,
        "tron" to TronChainWallet,
        "ton" to TonChainWallet,
        "cosmos" to CosmosChainWallet,
        "ltc" to UtxoChainWallet,
        "doge" to UtxoChainWallet,
        "bch" to UtxoChainWallet,
        "sol" to SolChainWallet,
        "apt" to AptChainWallet,
        "sui" to SuiChainWallet,
        "near" to NearChainWallet,
        "xlm" to XlmChainWallet,
        "xrp" to XrpChainWallet,
        "dot" to ViewOnlyChainWallet,
        "ksm" to ViewOnlyChainWallet,
        "xtz" to ViewOnlyChainWallet,
        "ckb" to ViewOnlyChainWallet,
        "fil" to ViewOnlyChainWallet,
    )

    fun walletFor(chain: Chain): ChainWallet {
        val family = resolveFamily(chain)
        return byFamily[family] ?: if (chain.isEvm) EvmChainWallet else ViewOnlyChainWallet
    }

    fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String =
        walletFor(chain).deriveAddress(mnemonic, index, chain)

    suspend fun getBalance(chain: Chain, address: String): String =
        walletFor(chain).getBalance(chain, address)

    suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = walletFor(chain).send(mnemonic, index, chain, to, amount, account)

    fun receiveAddress(mnemonic: String, index: Int, chain: Chain): String =
        deriveAddress(mnemonic, index, chain)

    fun supportsSend(chain: Chain): Boolean = walletFor(chain).supportsSend(chain)

    private fun resolveFamily(chain: Chain): String {
        if (chain.family.isNotBlank()) return chain.family.lowercase()
        return when (chain.symbol.uppercase()) {
            "BTC" -> "btc"
            "TRX" -> "tron"
            "TON" -> "ton"
            "ATOM", "OSMO" -> "cosmos"
            "LTC" -> "ltc"
            "DOGE" -> "doge"
            "BCH" -> "bch"
            "SOL" -> "sol"
            "APT" -> "apt"
            "SUI" -> "sui"
            "NEAR" -> "near"
            "XLM" -> "xlm"
            "XRP" -> "xrp"
            "DOT" -> "dot"
            "KSM" -> "ksm"
            "XTZ" -> "xtz"
            "CKB" -> "ckb"
            "FIL" -> "fil"
            else -> if (chain.isEvm) "evm" else "unknown"
        }
    }
}
