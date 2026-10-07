package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.EvmWallet
import com.wallet.app.crypto.util.Slip10
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
import org.web3j.crypto.Credentials

object EvmChainWallet : ChainWallet {
    override val family = "evm"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String =
        Credentials.create(Slip10.deriveSecp256k1(mnemonic, chain.coinType ?: 60, index)).address

    override suspend fun getBalance(chain: Chain, address: String): String =
        if (chain.rpcUrl.isBlank()) "0" else EvmWallet.getNativeBalance(chain.rpcUrl, address)

    override suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = EvmWallet.sendNative(chain.rpcUrl, account.evmPrivateKey, to, amount)
}
