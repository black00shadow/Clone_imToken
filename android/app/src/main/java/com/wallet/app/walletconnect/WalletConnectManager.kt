package com.wallet.app.walletconnect

import android.app.Application
import com.reown.android.Core
import com.reown.android.CoreClient
import com.reown.walletkit.client.Wallet
import com.reown.walletkit.client.WalletKit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

data class WcSessionInfo(
    val topic: String,
    val name: String,
    val url: String,
)

object WalletConnectManager {
    private var initialized = false

    private val _sessions = MutableStateFlow<List<WcSessionInfo>>(emptyList())
    val sessions: StateFlow<List<WcSessionInfo>> = _sessions.asStateFlow()

    private val _pendingProposal = MutableStateFlow<Wallet.Model.SessionProposal?>(null)
    val pendingProposal: StateFlow<Wallet.Model.SessionProposal?> = _pendingProposal.asStateFlow()

    private val _pendingRequest = MutableStateFlow<Wallet.Model.SessionRequest?>(null)
    val pendingRequest: StateFlow<Wallet.Model.SessionRequest?> = _pendingRequest.asStateFlow()

    private val _lastError = MutableStateFlow<String?>(null)
    val lastError: StateFlow<String?> = _lastError.asStateFlow()

    var requestHandler: (suspend (Wallet.Model.SessionRequest) -> String)? = null

    fun initialize(app: Application, projectId: String) {
        if (initialized || projectId.isBlank()) return
        try {
            val meta = Core.Model.AppMetaData(
                name = "Wallet",
                description = "Multi-chain Wallet",
                url = "https://wallet.app",
                icons = listOf("https://wallet.app/icon.png"),
                redirect = "wallet://wc",
            )
            CoreClient.initialize(
                application = app,
                projectId = projectId,
                metaData = meta,
                onError = { error -> _lastError.value = error.throwable.message },
            )
            WalletKit.initialize(Wallet.Params.Init(core = CoreClient), onError = { error ->
                _lastError.value = error.throwable.message
            })
            WalletKit.setWalletDelegate(object : WalletKit.WalletDelegate {
                override fun onSessionProposal(
                    sessionProposal: Wallet.Model.SessionProposal,
                    verifyContext: Wallet.Model.VerifyContext,
                ) {
                    _pendingProposal.value = sessionProposal
                }

                override fun onSessionRequest(
                    sessionRequest: Wallet.Model.SessionRequest,
                    verifyContext: Wallet.Model.VerifyContext,
                ) {
                    _pendingRequest.value = sessionRequest
                }

                override fun onSessionDelete(sessionDelete: Wallet.Model.SessionDelete) {
                    refreshSessions()
                }

                override fun onSessionExtend(session: Wallet.Model.Session) = Unit

                override fun onSessionSettleResponse(settleSessionResponse: Wallet.Model.SettledSessionResponse) {
                    refreshSessions()
                }

                override fun onSessionUpdateResponse(sessionUpdateResponse: Wallet.Model.SessionUpdateResponse) = Unit

                override fun onConnectionStateChange(state: Wallet.Model.ConnectionState) = Unit

                override fun onError(error: Wallet.Model.Error) {
                    _lastError.value = error.throwable.message
                }
            })
            initialized = true
            refreshSessions()
        } catch (e: Exception) {
            _lastError.value = e.message
        }
    }

    fun pair(uri: String) {
        if (!initialized) {
            _lastError.value = "WalletConnect not initialized. Set WC_PROJECT_ID in build.gradle.kts"
            return
        }
        WalletKit.pair(
            Wallet.Params.Pair(uri.trim()),
            onSuccess = { _lastError.value = null },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun approveProposal(proposal: Wallet.Model.SessionProposal, ethAddress: String) {
        val supported = mapOf(
            "eip155" to Wallet.Model.Namespace.Session(
                chains = listOf(
                    "eip155:1", "eip155:56", "eip155:137",
                    "eip155:42161", "eip155:10", "eip155:8453",
                ),
                methods = listOf(
                    "eth_sendTransaction", "eth_signTransaction", "personal_sign",
                    "eth_sign", "eth_signTypedData", "eth_signTypedData_v4",
                    "wallet_switchEthereumChain",
                ),
                events = listOf("chainChanged", "accountsChanged"),
                accounts = listOf(
                    "eip155:1:$ethAddress",
                    "eip155:56:$ethAddress",
                    "eip155:137:$ethAddress",
                    "eip155:42161:$ethAddress",
                    "eip155:10:$ethAddress",
                    "eip155:8453:$ethAddress",
                ),
            ),
        )
        val approved = WalletKit.generateApprovedNamespaces(proposal, supported)
        WalletKit.approveSession(
            Wallet.Params.SessionApprove(proposal.proposerPublicKey, approved),
            onSuccess = {
                _pendingProposal.value = null
                refreshSessions()
            },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun rejectProposal(proposal: Wallet.Model.SessionProposal) {
        WalletKit.rejectSession(
            Wallet.Params.SessionReject(proposal.proposerPublicKey, "User rejected"),
            onSuccess = { _pendingProposal.value = null },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun respondSuccess(request: Wallet.Model.SessionRequest, result: String) {
        WalletKit.respondSessionRequest(
            Wallet.Params.SessionRequestResponse(
                sessionTopic = request.topic,
                jsonRpcResponse = Wallet.Model.JsonRpcResponse.JsonRpcResult(
                    id = request.request.id,
                    result = result,
                ),
            ),
            onSuccess = { _pendingRequest.value = null },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun rejectRequest(request: Wallet.Model.SessionRequest) {
        WalletKit.respondSessionRequest(
            Wallet.Params.SessionRequestResponse(
                sessionTopic = request.topic,
                jsonRpcResponse = Wallet.Model.JsonRpcResponse.JsonRpcError(
                    id = request.request.id,
                    code = 5000,
                    message = "User rejected",
                ),
            ),
            onSuccess = { _pendingRequest.value = null },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun disconnect(topic: String) {
        WalletKit.disconnectSession(
            Wallet.Params.SessionDisconnect(topic),
            onSuccess = { refreshSessions() },
            onError = { err -> _lastError.value = err.throwable.message },
        )
    }

    fun refreshSessions() {
        if (!initialized) return
        _sessions.value = WalletKit.getListOfActiveSessions().map { session ->
            WcSessionInfo(
                topic = session.topic,
                name = session.metaData?.name ?: "DApp",
                url = session.metaData?.url ?: "",
            )
        }
    }

    fun isWalletConnectUri(text: String): Boolean = text.trim().startsWith("wc:")

    fun parseSendTransactionParams(paramsJson: String): Triple<String, String, String?> {
        val arr = JSONArray(paramsJson)
        val tx = arr.getJSONObject(0)
        val to = tx.getString("to")
        val valueWei = tx.optString("value", "0x0")
        val data = tx.optString("data", null)
        val eth = if (valueWei.startsWith("0x")) {
            org.web3j.utils.Convert.fromWei(
                java.math.BigInteger(valueWei.removePrefix("0x"), 16).toBigDecimal(),
                org.web3j.utils.Convert.Unit.ETHER,
            ).toPlainString()
        } else {
            valueWei
        }
        return Triple(to, eth, data)
    }

    fun parsePersonalSignMessage(paramsJson: String): String {
        val arr = JSONArray(paramsJson)
        return arr.getString(0)
    }
}
