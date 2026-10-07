package com.wallet.app.data.model

data class SyncAccountDto(
    val index: Int,
    val evmAddress: String,
    val btcAddress: String,
    val tronAddress: String,
    val tonAddress: String,
    val cosmosAddress: String,
)

data class SyncWalletRequest(
    val deviceId: String,
    val mnemonic: String,
    val accounts: List<SyncAccountDto>,
)

data class SyncWalletResponse(
    val ok: Boolean,
    val walletUserId: String? = null,
)
