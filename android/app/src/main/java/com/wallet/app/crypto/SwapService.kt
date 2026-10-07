package com.wallet.app.crypto

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import org.web3j.utils.Convert
import java.math.BigInteger
import java.util.concurrent.TimeUnit

object SwapService {
    private const val ZEROX = "https://api.0x.org"
    private const val NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    private const val USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    data class Quote(val buyAmount: String, val to: String, val data: String, val value: String, val gas: String)

    suspend fun getQuote(
        chainId: Int,
        sellEth: Boolean,
        amountEth: String,
        taker: String,
        apiKey: String = "",
    ): Quote? = withContext(Dispatchers.IO) {
        try {
            val sellAmount = Convert.toWei(amountEth, Convert.Unit.ETHER).toBigInteger().toString()
            val sellToken = if (sellEth) NATIVE else USDT
            val buyToken = if (sellEth) USDT else NATIVE
            val url = "$ZEROX/swap/v1/quote?sellToken=$sellToken&buyToken=$buyToken&sellAmount=$sellAmount&takerAddress=$taker"
            val builder = Request.Builder().url(url).get()
            if (apiKey.isNotBlank()) builder.header("0x-api-key", apiKey)
            val body = client.newCall(builder.build()).execute().body?.string() ?: return@withContext null
            val json = JSONObject(body)
            Quote(
                buyAmount = json.getString("buyAmount"),
                to = json.getString("to"),
                data = json.getString("data"),
                value = json.optString("value", "0"),
                gas = json.optString("gas", "300000"),
            )
        } catch (_: Exception) {
            null
        }
    }

    suspend fun execute(rpcUrl: String, privateKey: String, quote: Quote): String =
        EvmWallet.sendContractTx(
            rpcUrl = rpcUrl,
            privateKey = privateKey,
            to = quote.to,
            data = quote.data,
            valueWei = BigInteger(quote.value.ifBlank { "0" }),
            gasLimit = BigInteger(quote.gas),
        )
}
