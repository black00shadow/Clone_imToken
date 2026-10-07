package com.wallet.app.crypto

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.bitcoinj.core.Address
import org.bitcoinj.core.Coin
import org.bitcoinj.core.NetworkParameters
import org.bitcoinj.core.SegwitAddress
import org.bitcoinj.core.Sha256Hash
import org.bitcoinj.core.Transaction
import org.bitcoinj.core.Utils
import org.bitcoinj.crypto.HDPath
import org.bitcoinj.script.ScriptBuilder
import org.bitcoinj.wallet.DeterministicKeyChain
import org.bitcoinj.wallet.DeterministicSeed
import org.json.JSONArray
import java.math.BigDecimal
import java.net.HttpURLConnection
import java.net.URL

object BtcWallet {
    private val params: NetworkParameters = org.bitcoinj.params.MainNetParams.get()

    fun deriveAddress(mnemonic: String, index: Int): String {
        val key = deriveKey(mnemonic, index)
        return SegwitAddress.fromKey(params, key).toString()
    }

    private fun deriveKey(mnemonic: String, index: Int): org.bitcoinj.crypto.DeterministicKey {
        val seed = DeterministicSeed(mnemonic.trim().lowercase(), null, "", 0L)
        val chain = DeterministicKeyChain.builder().seed(seed).build()
        return chain.getKeyByPath(HDPath.parsePath("M/84H/0H/0H/0/$index"), true)
    }

    suspend fun getBalance(address: String, apiBase: String = "https://blockstream.info/api"): String {
        return try {
            val base = apiBase.removeSuffix("/")
            val url = URL("$base/address/$address")
            val json = url.readText()
            val funded = Regex(""""funded_txo_sum"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            val spent = Regex(""""spent_txo_sum"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.8f".format((funded - spent) / 1e8)
        } catch (_: Exception) {
            "0"
        }
    }

    suspend fun send(
        mnemonic: String,
        index: Int,
        toAddress: String,
        amountBtc: String,
        apiBase: String = "https://blockstream.info/api",
    ): String = withContext(Dispatchers.IO) {
            val base = apiBase.removeSuffix("/")
            val key = deriveKey(mnemonic, index)
            val fromAddress = SegwitAddress.fromKey(params, key).toString()
            val utxoJson = URL("$base/address/$fromAddress/utxo").readText()
            val utxos = JSONArray(utxoJson)
            if (utxos.length() == 0) throw IllegalStateException("No UTXOs")

            val amountSats = (BigDecimal(amountBtc) * BigDecimal(100_000_000)).longValueExact()
            val fee = 1000L
            var total = 0L

            val tx = Transaction(params)
            val redeemScript = ScriptBuilder.createP2WPKHOutputScript(key)

            for (i in 0 until utxos.length()) {
                val utxo = utxos.getJSONObject(i)
                val txHash = Sha256Hash.wrap(utxo.getString("txid"))
                val vout = utxo.getInt("vout")
                val value = utxo.getLong("value")
                tx.addInput(txHash, vout.toLong(), redeemScript)
                total += value
                if (total >= amountSats + fee) break
            }

            if (total < amountSats + fee) throw IllegalStateException("Insufficient balance")

            tx.addOutput(Coin.valueOf(amountSats), Address.fromString(params, toAddress))
            val change = total - amountSats - fee
            if (change > 0) {
                tx.addOutput(Coin.valueOf(change), SegwitAddress.fromKey(params, key))
            }

            tx.inputs.forEachIndexed { inputIndex, _ ->
                val sig = tx.calculateSignature(
                    inputIndex,
                    key,
                    redeemScript,
                    org.bitcoinj.core.Transaction.SigHash.ALL,
                    false,
                )
                val witness = org.bitcoinj.core.TransactionWitness(2)
                witness.setPush(0, sig.encodeToBitcoin())
                witness.setPush(1, key.pubKey)
                tx.getInput(inputIndex.toLong()).witness = witness
            }

            val txHex = Utils.HEX.encode(tx.bitcoinSerialize())
            val conn = URL("$base/tx").openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "text/plain")
            conn.outputStream.use { it.write(txHex.toByteArray()) }
            if (conn.responseCode >= 400) {
                val err = conn.errorStream?.bufferedReader()?.readText()
                throw IllegalStateException(err ?: "Broadcast failed")
            }
            tx.txId.toString()
        }
}
