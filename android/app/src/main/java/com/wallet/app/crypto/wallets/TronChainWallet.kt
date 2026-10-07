package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.TronWallet
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount

object TronChainWallet : ChainWallet {
    override val family = "tron"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String =
        TronWallet.derive(mnemonic, index).address

    override suspend fun getBalance(chain: Chain, address: String): String =
        TronWallet.getBalance(address, chain.rpcUrl.ifBlank { "https://api.trongrid.io" })

    override suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = TronWallet.send(
        account.tronPrivateKey,
        to,
        amount,
        chain.rpcUrl.ifBlank { "https://api.trongrid.io" },
    )
}
