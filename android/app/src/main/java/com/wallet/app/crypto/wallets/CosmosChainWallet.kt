package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.util.Bech32Util
import com.wallet.app.crypto.util.Slip10
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.ECKeyPair
import org.web3j.crypto.Hash
import org.web3j.crypto.Sign
import org.web3j.utils.Numeric
import java.math.BigDecimal
import java.net.HttpURLConnection
import java.net.URL
import java.util.Base64

object CosmosChainWallet : ChainWallet {
    override val family = "cosmos"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val pair = Slip10.deriveSecp256k1(mnemonic, chain.coinType ?: 118, index)
        val pubKey = Sign.publicKeyFromPrivate(pair.privateKey)
        val sha = Hash.sha256(pubKey)
        val addrBytes = Numeric.hexStringToByteArray(sha.replace("0x", "")).copyOfRange(0, 20)
        val prefix = chain.bech32Prefix ?: defaultPrefix(chain.symbol)
        return Bech32Util.encode(prefix, addrBytes)
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val rest = restBase(chain)
            val denom = defaultDenom(chain.symbol)
            val url = URL("$rest/cosmos/bank/v1beta1/balances/$address")
            val json = url.readText()
            val amount = Regex(""""denom"\s*:\s*"$denom".*?"amount"\s*:\s*"(\d+)"""")
                .find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            val decimals = if (denom == "uatom" || denom == "uosmo") 6 else 6
            "%.${decimals}f".format(amount / Math.pow(10.0, decimals.toDouble()))
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
        val pair = Slip10.deriveSecp256k1(mnemonic, chain.coinType ?: 118, index)
        val from = deriveAddress(mnemonic, index, chain)
        val rest = restBase(chain)
        val denom = defaultDenom(chain.symbol)
        val decimals = 6
        val micro = (BigDecimal(amount) * BigDecimal.TEN.pow(decimals)).toLong()
        val accountInfo = fetchAccount(rest, from)
        val chainId = fetchChainId(rest, chain)
        val txBytes = CosmosTxSigner.signAndEncode(
            from = from,
            to = to,
            amount = micro,
            denom = denom,
            chainId = chainId,
            accountNumber = accountInfo.first,
            sequence = accountInfo.second,
            privateKey = pair.privateKey,
        )
        broadcast(rest, txBytes)
    }

    private fun defaultPrefix(symbol: String): String = when (symbol.uppercase()) {
        "OSMO" -> "osmo"
        else -> "cosmos"
    }

    private fun defaultDenom(symbol: String): String = when (symbol.uppercase()) {
        "OSMO" -> "uosmo"
        else -> "uatom"
    }

    private fun restBase(chain: Chain): String {
        val rpc = chain.rpcUrl.ifBlank { return defaultRest(chain.symbol) }
        return when {
            rpc.contains("publicnode.com") && !rpc.contains("-rest") ->
                rpc.replace("-rpc.publicnode.com", "-rest.publicnode.com")
            rpc.endsWith("/") -> rpc.dropLast(1)
            else -> rpc
        }
    }

    private fun defaultRest(symbol: String): String = when (symbol.uppercase()) {
        "OSMO" -> "https://osmosis-rest.publicnode.com"
        else -> "https://cosmos-rest.publicnode.com"
    }

    private fun fetchAccount(rest: String, address: String): Pair<Long, Long> {
        val json = URL("$rest/cosmos/auth/v1beta1/accounts/$address").readText()
        val accountNumber = Regex(""""account_number"\s*:\s*"(\d+)"""").find(json)?.groupValues?.get(1)?.toLong()
            ?: Regex(""""account_number"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong()
            ?: 0L
        val sequence = Regex(""""sequence"\s*:\s*"(\d+)"""").find(json)?.groupValues?.get(1)?.toLong()
            ?: Regex(""""sequence"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong()
            ?: 0L
        return accountNumber to sequence
    }

    private fun fetchChainId(rest: String, chain: Chain): String {
        return try {
            val json = URL("$rest/cosmos/base/tendermint/v1beta1/node_info").readText()
            Regex(""""network"\s*:\s*"([^"]+)"""").find(json)?.groupValues?.get(1)
                ?: defaultChainId(chain.symbol)
        } catch (_: Exception) {
            defaultChainId(chain.symbol)
        }
    }

    private fun defaultChainId(symbol: String): String = when (symbol.uppercase()) {
        "OSMO" -> "osmosis-1"
        else -> "cosmoshub-4"
    }

    private fun broadcast(rest: String, txBytes: ByteArray): String {
        val body = """{"tx_bytes":"${Base64.getEncoder().encodeToString(txBytes)}","mode":"BROADCAST_MODE_SYNC"}"""
        val conn = URL("$rest/cosmos/tx/v1beta1/txs").openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "application/json")
        conn.outputStream.use { it.write(body.toByteArray()) }
        val response = (if (conn.responseCode >= 400) conn.errorStream else conn.inputStream)
            ?.bufferedReader()?.readText().orEmpty()
        if (conn.responseCode >= 400) throw IllegalStateException(response)
        val hash = Regex(""""txhash"\s*:\s*"([^"]+)"""").find(response)?.groupValues?.get(1)
        return hash ?: throw IllegalStateException("Cosmos broadcast failed: $response")
    }
}

private object CosmosTxSigner {
    fun signAndEncode(
        from: String,
        to: String,
        amount: Long,
        denom: String,
        chainId: String,
        accountNumber: Long,
        sequence: Long,
        privateKey: java.math.BigInteger,
    ): ByteArray {
        val pubKey = compressPubKey(Sign.publicKeyFromPrivate(privateKey))
        val bodyBytes = buildBodyBytes(from, to, amount, denom)
        val authInfoBytes = buildAuthInfoBytes(pubKey, sequence)
        val signDocBytes = buildSignDocBytes(bodyBytes, authInfoBytes, chainId, accountNumber)
        val signature = signSecp256k1(signDocBytes, ECKeyPair.create(privateKey))
        return buildTxRaw(bodyBytes, authInfoBytes, signature)
    }

    private fun compressPubKey(publicKey: ByteArray): ByteArray {
        val uncompressed = when (publicKey.size) {
            64 -> byteArrayOf(0x04) + publicKey
            65 -> publicKey
            33 -> return publicKey
            else -> throw IllegalArgumentException("Invalid public key length")
        }
        val y = uncompressed[64].toInt() and 1
        return byteArrayOf((2 + y).toByte()) + uncompressed.copyOfRange(1, 33)
    }

    private fun signSecp256k1(message: ByteArray, keyPair: ECKeyPair): ByteArray {
        val hash = Hash.sha256(message)
        val sig = Sign.signMessage(hash, keyPair, false)
        return sig.r + sig.s
    }

    private fun buildBodyBytes(from: String, to: String, amount: Long, denom: String): ByteArray {
        val msgSend = protobufBytes(1, protobufString(1, from) + protobufString(2, to) +
            protobufBytes(3, protobufBytes(1, protobufString(1, denom) + protobufString(2, amount.toString()))))
        return protobufBytes(1, msgSend) + protobufBytes(2, protobufString(1, "200000")) +
            protobufVarint(3, 0)
    }

    private fun buildAuthInfoBytes(pubKey: ByteArray, sequence: Long): ByteArray {
        val pubKeyAny = protobufBytes(1, protobufString(1, "/cosmos.crypto.secp256k1.PubKey") +
            protobufBytes(2, protobufBytes(1, pubKey)))
        val signerInfo = protobufBytes(1, pubKeyAny) + protobufVarint(2, 1) + protobufVarint(3, sequence)
        return protobufBytes(1, signerInfo) + protobufVarint(2, 0)
    }

    private fun buildSignDocBytes(body: ByteArray, authInfo: ByteArray, chainId: String, accountNumber: Long): ByteArray =
        protobufBytes(1, body) + protobufBytes(2, authInfo) + protobufString(3, chainId) +
            protobufVarint(4, accountNumber)

    private fun buildTxRaw(body: ByteArray, authInfo: ByteArray, signature: ByteArray): ByteArray =
        protobufBytes(1, body) + protobufBytes(2, authInfo) + protobufBytes(3, signature)

    private fun protobufVarint(fieldNumber: Int, value: Long): ByteArray {
        val tag = (fieldNumber shl 3) or 0
        return encodeTag(tag) + encodeVarint(value)
    }

    private fun protobufString(fieldNumber: Int, value: String): ByteArray {
        val tag = (fieldNumber shl 3) or 2
        val bytes = value.toByteArray()
        return encodeTag(tag) + encodeVarint(bytes.size.toLong()) + bytes
    }

    private fun protobufBytes(fieldNumber: Int, value: ByteArray): ByteArray {
        val tag = (fieldNumber shl 3) or 2
        return encodeTag(tag) + encodeVarint(value.size.toLong()) + value
    }

    private fun encodeTag(tag: Int): ByteArray = encodeVarint(tag.toLong())

    private fun encodeVarint(value: Long): ByteArray {
        var v = value
        val out = mutableListOf<Byte>()
        while (v >= 0x80) {
            out.add(((v and 0x7F) or 0x80).toByte())
            v = v ushr 7
        }
        out.add(v.toByte())
        return out.toByteArray()
    }
}
