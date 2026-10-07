package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.util.Slip10
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.sol4k.Connection
import org.sol4k.Keypair
import org.sol4k.PublicKey
import org.sol4k.Transaction
import org.sol4k.instruction.TransferInstruction
import java.math.BigDecimal

object SolChainWallet : ChainWallet {
    override val family = "sol"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 501, index = index)
        return Keypair.fromSecretKey(ed25519.privateKey).publicKey.toBase58()
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val connection = Connection(chain.rpcUrl.ifBlank { "https://api.mainnet-beta.solana.com" })
            val lamports = connection.getBalance(PublicKey(address))
            "%.9f".format(lamports.toDouble() / 1e9)
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
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 501, index = index)
        val payer = Keypair.fromSecretKey(ed25519.privateKey)
        val connection = Connection(chain.rpcUrl.ifBlank { "https://api.mainnet-beta.solana.com" })
        val lamports = (BigDecimal(amount) * BigDecimal(1_000_000_000)).toLong()
        val blockhash = connection.getLatestBlockhash()
        val instruction = TransferInstruction(payer.publicKey, PublicKey(to), lamports)
        val transaction = Transaction(blockhash, instruction, payer.publicKey)
        transaction.sign(payer)
        connection.sendTransaction(transaction)
    }
}
