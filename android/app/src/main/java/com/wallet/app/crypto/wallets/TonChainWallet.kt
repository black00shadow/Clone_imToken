package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.util.Slip10
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.iwebpp.crypto.TweetNaclFast
import org.ton.ton4j.address.Address
import org.ton.ton4j.smartcontract.types.WalletV4R2Config
import org.ton.ton4j.smartcontract.wallet.v4.WalletV4R2
import org.ton.ton4j.toncenter.TonCenter
import org.ton.ton4j.utils.Utils
import java.math.BigDecimal

object TonChainWallet : ChainWallet {
    override val family = "ton"
    private const val WALLET_ID_V4R2 = 698983191

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 607, index = index)
        val wallet = WalletV4R2.builder()
            .publicKey(ed25519.publicKey)
            .walletId(WALLET_ID_V4R2.toLong())
            .build()
        return wallet.address.toNonBounceable()
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val base = chain.rpcUrl.ifBlank { "https://toncenter.com/api/v2" }
                .removeSuffix("/jsonRPC")
                .removeSuffix("/")
            val url = java.net.URL("$base/getAddressBalance?address=${java.net.URLEncoder.encode(address, "UTF-8")}")
            val json = url.readText()
            val result = Regex(""""result"\s*:\s*"(\d+)"""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.4f".format(result / 1e9)
        } catch (_: Exception) {
            "0"
        }
    }

    override suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = withContext(Dispatchers.IO) {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 607, index = index)
        val keyPair = TweetNaclFast.Signature.keyPair_fromSeed(ed25519.privateKey)
        val tonCenter = TonCenter.builder()
            .endpoint(chain.rpcUrl.ifBlank { "https://toncenter.com/api/v2/jsonRPC" })
            .build()
        val wallet = WalletV4R2.builder()
            .keyPair(keyPair)
            .walletId(WALLET_ID_V4R2.toLong())
            .tonCenterClient(tonCenter)
            .build()
        val nano = Utils.toNano(amount.toDouble())
        val config = WalletV4R2Config.builder()
            .walletId(WALLET_ID_V4R2.toLong())
            .destination(Address.of(to))
            .amount(nano)
            .build()
        val response = wallet.send(config)
        if (response.code != 0L && response.code != 200L) {
            throw IllegalStateException(response.message ?: "TON broadcast failed")
        }
        response.message ?: "sent"
    }
}
