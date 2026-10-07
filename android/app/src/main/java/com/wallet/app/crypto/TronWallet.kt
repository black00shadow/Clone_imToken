package com.wallet.app.crypto

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.bitcoinj.core.Base58
import org.json.JSONObject
import org.web3j.crypto.Hash
import org.web3j.crypto.Sign
import org.web3j.utils.Numeric
import java.util.concurrent.TimeUnit

data class TronAccount(val address: String, val privateKey: String)

object TronWallet {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    fun derive(mnemonic: String, index: Int): TronAccount {
        val credentials = WalletDeriver.deriveCredentialsForCoin(mnemonic, 195, index)
        val privateKey = Numeric.toHexStringNoPrefix(credentials.ecKeyPair.privateKey)
        return TronAccount(privateKeyToAddress(privateKey), privateKey)
    }

    private fun privateKeyToAddress(privateKeyHex: String): String {
        val key = Numeric.toBigInt(privateKeyHex)
        val pubKey = Sign.publicKeyFromPrivate(key)
        val hash = Hash.sha3(pubKey)
        val addressBytes = ByteArray(21)
        addressBytes[0] = 0x41
        System.arraycopy(hash, 12, addressBytes, 1, 20)
        return Base58.encodeChecked(addressBytes)
    }

    suspend fun getBalance(address: String, apiBase: String = "https://api.trongrid.io"): String = withContext(Dispatchers.IO) {
        try {
            val base = apiBase.removeSuffix("/")
            val json = client.newCall(
                Request.Builder().url("$base/v1/accounts/$address").get().build(),
            ).execute().body?.string() ?: return@withContext "0"
            val balance = Regex(""""balance"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.6f".format(balance / 1_000_000.0)
        } catch (_: Exception) {
            "0"
        }
    }

    suspend fun send(
        privateKey: String,
        to: String,
        amountTrx: String,
        apiBase: String = "https://api.trongrid.io",
    ): String = withContext(Dispatchers.IO) {
        val base = apiBase.removeSuffix("/")
        val key = if (privateKey.startsWith("0x")) privateKey.slice(2..) else privateKey
        val from = privateKeyToAddress(key)
        val amountSun = (amountTrx.toBigDecimal() * BigDecimal(1_000_000)).toLong()
        val createBody = JSONObject().apply {
            put("owner_address", from)
            put("to_address", to)
            put("amount", amountSun)
            put("visible", true)
        }.toString()
        val createResp = client.newCall(
            Request.Builder()
                .url("$base/wallet/createtransaction")
                .post(createBody.toRequestBody("application/json".toMediaType()))
                .build(),
        ).execute().body?.string() ?: throw IllegalStateException("Create transaction failed")
        val txJson = JSONObject(createResp)
        if (txJson.has("Error")) throw IllegalStateException(txJson.optString("Error"))
        val signed = signTransaction(txJson, key)
        val broadcastBody = signed.toString()
        val broadcastResp = client.newCall(
            Request.Builder()
                .url("$base/wallet/broadcasttransaction")
                .post(broadcastBody.toRequestBody("application/json".toMediaType()))
                .build(),
        ).execute().body?.string() ?: throw IllegalStateException("Broadcast failed")
        val result = JSONObject(broadcastResp)
        if (!result.optBoolean("result", false)) {
            throw IllegalStateException(result.optString("message", "TRON broadcast failed"))
        }
        txJson.optString("txID").ifBlank { result.optString("txid") }
    }

    private fun signTransaction(tx: JSONObject, privateKeyHex: String): JSONObject {
        val rawHex = tx.optString("raw_data_hex").ifBlank { throw IllegalStateException("Missing raw_data_hex") }
        val rawBytes = Numeric.hexStringToByteArray(rawHex)
        val hash = org.web3j.crypto.Hash.sha256(rawBytes)
        val keyPair = org.web3j.crypto.ECKeyPair.create(Numeric.toBigInt(privateKeyHex))
        val signature = Sign.signMessage(hash, keyPair, false)
        val sigBytes = ByteArray(65)
        System.arraycopy(signature.r, 0, sigBytes, 0, 32)
        System.arraycopy(signature.s, 0, sigBytes, 32, 32)
        sigBytes[64] = signature.v[0]
        tx.put("signature", org.json.JSONArray().put(Numeric.toHexString(sigBytes)))
        return tx
    }

    suspend fun fetchHistory(address: String, limit: Int = 15): List<com.wallet.app.data.model.TxRecord> =
        withContext(Dispatchers.IO) {
            try {
                val json = client.newCall(
                    Request.Builder()
                        .url("https://api.trongrid.io/v1/accounts/$address/transactions?limit=$limit&only_confirmed=true")
                        .get().build(),
                ).execute().body?.string() ?: return@withContext emptyList()
                val data = JSONObject(json).optJSONArray("data") ?: return@withContext emptyList()
                buildList {
                    for (i in 0 until data.length()) {
                        val tx = data.getJSONObject(i)
                        val contract = tx.optJSONObject("raw_data")
                            ?.optJSONArray("contract")?.optJSONObject(0)
                            ?.optJSONObject("parameter")?.optJSONObject("value")
                        add(
                            com.wallet.app.data.model.TxRecord(
                                id = tx.optString("txID"),
                                hash = tx.optString("txID"),
                                chain = "TRON",
                                symbol = "TRX",
                                from = contract?.optString("owner_address") ?: "",
                                to = contract?.optString("to_address") ?: "",
                                value = ((contract?.optLong("amount") ?: 0L) / 1_000_000.0).toString(),
                                timestamp = tx.optJSONObject("raw_data")?.optLong("timestamp") ?: System.currentTimeMillis(),
                                status = "confirmed",
                                direction = "out",
                            ),
                        )
                    }
                }
            } catch (_: Exception) {
                emptyList()
            }
        }
}

private typealias BigDecimal = java.math.BigDecimal
