package com.wallet.app.crypto

import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount

interface ChainWallet {
    val family: String
    fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String
    suspend fun getBalance(chain: Chain, address: String): String
    suspend fun send(mnemonic: String, index: Int, chain: Chain, to: String, amount: String, account: WalletAccount): String
    fun supportsSend(chain: Chain): Boolean = true
}
