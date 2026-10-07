package com.wallet.app.crypto

import com.wallet.app.crypto.ChainWalletRegistry
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.TxRecord
import com.wallet.app.data.model.WalletAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.abi.FunctionEncoder
import org.web3j.abi.FunctionReturnDecoder
import org.web3j.abi.TypeReference
import org.web3j.abi.datatypes.Address
import org.web3j.abi.datatypes.Function
import org.web3j.abi.datatypes.generated.Uint256
import org.web3j.crypto.Credentials
import org.web3j.crypto.RawTransaction
import org.web3j.crypto.TransactionEncoder
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.DefaultBlockParameterName
import org.web3j.protocol.core.methods.request.Transaction
import org.web3j.protocol.http.HttpService
import org.web3j.utils.Convert
import org.web3j.utils.Numeric
import java.math.BigDecimal
import java.math.BigInteger

object EvmWallet {
    suspend fun getNativeBalance(rpcUrl: String, address: String): String = withContext(Dispatchers.IO) {
        try {
            val web3 = web3(rpcUrl)
            val wei = web3.ethGetBalance(address, DefaultBlockParameterName.LATEST).send().balance
            Convert.fromWei(wei.toBigDecimal(), Convert.Unit.ETHER).toPlainString()
        } catch (_: Exception) {
            "0"
        }
    }

    suspend fun getTokenBalance(
        rpcUrl: String,
        contractAddress: String,
        address: String,
        decimals: Int,
    ): String = withContext(Dispatchers.IO) {
        try {
            val web3 = web3(rpcUrl)
            val data = FunctionEncoder.encode(
                Function(
                    "balanceOf",
                    listOf(Address(address)),
                    listOf(TypeReference.create(Uint256::class.java)),
                ),
            )
            val response = web3.ethCall(
                Transaction.createEthCallTransaction(address, contractAddress, data),
                DefaultBlockParameterName.LATEST,
            ).send()
            val decoded = FunctionReturnDecoder.decode(
                response.value,
                listOf(TypeReference.create(Uint256::class.java)),
            )
            val raw = (decoded.firstOrNull()?.value as? BigInteger) ?: BigInteger.ZERO
            raw.toBigDecimal().movePointLeft(decimals).toPlainString()
        } catch (_: Exception) {
            "0"
        }
    }

    suspend fun sendNative(rpcUrl: String, privateKey: String, to: String, amountEth: String): String =
        withContext(Dispatchers.IO) {
            val web3 = web3(rpcUrl)
            val credentials = credentials(privateKey)
            val gasPrice = web3.ethGasPrice().send().gasPrice
            val value = Convert.toWei(amountEth, Convert.Unit.ETHER).toBigInteger()
            val nonce = web3.ethGetTransactionCount(credentials.address, DefaultBlockParameterName.PENDING)
                .send().transactionCount
            val raw = RawTransaction.createEtherTransaction(nonce, gasPrice, BigInteger.valueOf(21000), to, value)
            val signed = TransactionEncoder.signMessage(raw, credentials)
            web3.ethSendRawTransaction(Numeric.toHexString(signed)).send().transactionHash
        }

    suspend fun sendToken(
        rpcUrl: String,
        privateKey: String,
        contractAddress: String,
        to: String,
        amount: String,
        decimals: Int,
    ): String = withContext(Dispatchers.IO) {
        val value = BigDecimal(amount).movePointRight(decimals).toBigInteger()
        val data = FunctionEncoder.encode(
            Function(
                "transfer",
                listOf(Address(to), Uint256(value)),
                emptyList(),
            ),
        )
        sendContractTx(rpcUrl, privateKey, contractAddress, data, BigInteger.ZERO, BigInteger.valueOf(120000))
    }

    suspend fun sendContractTx(
        rpcUrl: String,
        privateKey: String,
        to: String,
        data: String,
        valueWei: BigInteger,
        gasLimit: BigInteger,
    ): String = withContext(Dispatchers.IO) {
        val web3 = web3(rpcUrl)
        val credentials = credentials(privateKey)
        val gasPrice = web3.ethGasPrice().send().gasPrice
        val nonce = web3.ethGetTransactionCount(credentials.address, DefaultBlockParameterName.PENDING)
            .send().transactionCount
        val raw = RawTransaction.createTransaction(nonce, gasPrice, gasLimit, to, valueWei, data)
        val signed = TransactionEncoder.signMessage(raw, credentials)
        web3.ethSendRawTransaction(Numeric.toHexString(signed)).send().transactionHash
    }

    suspend fun signPersonalMessage(privateKey: String, message: String): String = withContext(Dispatchers.IO) {
        val credentials = credentials(privateKey)
        val messageBytes = if (message.startsWith("0x")) {
            Numeric.hexStringToByteArray(message)
        } else {
            message.toByteArray()
        }
        val sig = org.web3j.crypto.Sign.signPrefixedMessage(messageBytes, credentials.ecKeyPair)
        val rsv = sig.r.toString(16).padStart(64, '0') +
            sig.s.toString(16).padStart(64, '0') +
            sig.v.toString(16).padStart(2, '0')
        "0x$rsv"
    }

    suspend fun fetchHistory(rpcUrl: String, address: String, chainName: String, symbol: String, limit: Int = 15): List<TxRecord> =
        withContext(Dispatchers.IO) {
            try {
                val web3 = web3(rpcUrl)
                val current = web3.ethBlockNumber().send().blockNumber.toLong()
                val result = mutableListOf<TxRecord>()
                val addr = address.lowercase()
                var block = current
                while (block > 0 && result.size < limit && current - block < 500) {
                    val blockResp = web3.ethGetBlockByNumber(
                        org.web3j.protocol.core.DefaultBlockParameterNumber(BigInteger.valueOf(block)),
                        true,
                    ).send()
                    blockResp.block?.transactions?.forEach { tx ->
                        val transaction = tx.get() as? org.web3j.protocol.core.methods.response.Transaction ?: return@forEach
                        val from = transaction.from?.lowercase()
                        val to = transaction.to?.lowercase()
                        if (from == addr || to == addr) {
                            result.add(
                                TxRecord(
                                    id = transaction.hash,
                                    hash = transaction.hash,
                                    chain = chainName,
                                    symbol = symbol,
                                    from = transaction.from ?: "",
                                    to = transaction.to ?: "",
                                    value = Convert.fromWei(transaction.value.toBigDecimal(), Convert.Unit.ETHER).toPlainString(),
                                    timestamp = System.currentTimeMillis(),
                                    status = "confirmed",
                                    direction = if (from == addr) "out" else "in",
                                ),
                            )
                        }
                    }
                    block--
                }
                result
            } catch (_: Exception) {
                emptyList()
            }
        }

    private fun web3(rpcUrl: String) = Web3j.build(HttpService(rpcUrl))

    private fun credentials(privateKey: String): Credentials {
        val key = if (privateKey.startsWith("0x")) privateKey else "0x$privateKey"
        return Credentials.create(key)
    }
}

object BalanceLoader {
    suspend fun loadNativeBalance(mnemonic: String, chain: Chain, account: WalletAccount): String {
        val address = receiveAddress(mnemonic, chain, account)
        return ChainWalletRegistry.getBalance(chain, address)
    }

    fun receiveAddress(mnemonic: String, chain: Chain, account: WalletAccount): String {
        if (chain.isEvm) return account.evmAddress
        return ChainWalletRegistry.receiveAddress(mnemonic, account.index, chain)
    }
}
