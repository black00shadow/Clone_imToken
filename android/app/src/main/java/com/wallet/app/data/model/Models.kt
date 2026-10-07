package com.wallet.app.data.model

data class Chain(
    val id: String,
    val name: String,
    val symbol: String,
    val chainId: Int?,
    val rpcUrl: String,
    val explorerUrl: String? = null,
    val family: String = "evm",
    val coinType: Int? = null,
    val bech32Prefix: String? = null,
    val isEvm: Boolean = true,
    val tokens: List<Token> = emptyList(),
)

data class Token(
    val id: String,
    val name: String,
    val symbol: String,
    val contractAddress: String? = null,
    val decimals: Int = 18,
    val isNative: Boolean = false,
)

data class Dapp(
    val id: String,
    val name: String,
    val url: String,
    val category: String,
    val isFeatured: Boolean = false,
)

data class Announcement(
    val id: String,
    val title: String,
    val content: String,
)

data class Banner(
    val id: String,
    val title: String,
    val imageUrl: String,
    val linkUrl: String? = null,
)

data class BootstrapData(
    val chains: List<Chain>,
    val dapps: List<Dapp>,
    val announcements: List<Announcement>,
    val banners: List<Banner>,
    val config: Map<String, String>,
)

data class RiskAddress(
    val address: String,
    val chain: String?,
    val reason: String?,
    val severity: String?,
)

data class WalletAccount(
    val index: Int,
    val name: String,
    val evmAddress: String,
    val evmPrivateKey: String,
    val btcAddress: String,
    val tronAddress: String,
    val tronPrivateKey: String,
    val tonAddress: String,
    val cosmosAddress: String,
)

enum class ChainFamily {
    EVM, BTC, TRON, TON, COSMOS, UTXO, SOL, APT, SUI, NEAR, XLM, XRP, VIEW_ONLY,
}

fun Chain.family(): ChainFamily = when (family.lowercase()) {
    "evm" -> ChainFamily.EVM
    "btc" -> ChainFamily.BTC
    "tron" -> ChainFamily.TRON
    "ton" -> ChainFamily.TON
    "cosmos" -> ChainFamily.COSMOS
    "ltc", "doge", "bch" -> ChainFamily.UTXO
    "sol" -> ChainFamily.SOL
    "apt" -> ChainFamily.APT
    "sui" -> ChainFamily.SUI
    "near" -> ChainFamily.NEAR
    "xlm" -> ChainFamily.XLM
    "xrp" -> ChainFamily.XRP
    "dot", "ksm", "xtz", "ckb", "fil" -> ChainFamily.VIEW_ONLY
    else -> if (isEvm) ChainFamily.EVM else ChainFamily.VIEW_ONLY
}

data class TxRecord(
    val id: String,
    val hash: String,
    val chain: String,
    val symbol: String,
    val from: String,
    val to: String,
    val value: String,
    val timestamp: Long,
    val status: String,
    val direction: String,
)

data class SendParams(
    val chainId: String,
    val tokenId: String?,
    val symbol: String,
    val chainName: String,
    val rpcUrl: String,
    val contractAddress: String?,
    val decimals: Int,
    val family: ChainFamily,
)
