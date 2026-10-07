package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.BtcWallet
import com.wallet.app.crypto.ChainWallet
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount

object BtcChainWallet : ChainWallet {
    override val family = "btc"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String =
        BtcWallet.deriveAddress(mnemonic, index)

    override suspend fun getBalance(chain: Chain, address: String): String =
        BtcWallet.getBalance(address, chain.rpcUrl.ifBlank { "https://blockstream.info/api" })

    override suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = BtcWallet.send(mnemonic, index, to, amount, chain.rpcUrl.ifBlank { "https://blockstream.info/api" })
}
