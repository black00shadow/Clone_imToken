package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
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
import org.bitcoinj.params.MainNetParams
import org.bitcoinj.script.ScriptBuilder
import org.bitcoinj.wallet.DeterministicKeyChain
import org.bitcoinj.wallet.DeterministicSeed
import org.json.JSONArray
import java.math.BigDecimal
import java.net.HttpURLConnection
import java.net.URL

object UtxoChainWallet : ChainWallet {
    override val family = "utxo"

    private data class UtxoConfig(
        val coinType: Int,
        val pathTemplate: String,
        val apiBase: String,
        val network: NetworkParameters,
        val useSegwit: Boolean,
    )

    private val configs = mapOf(
        "ltc" to UtxoConfig(2, "M/84H/2H/0H/0/{index}", "https://litecoinspace.org/api", litecoinParams(), true),
        "doge" to UtxoConfig(3, "M/44H/3H/0H/0/{index}", "https://api.blockcypher.com/v1/doge/main", MainNetParams.get(), false),
        "bch" to UtxoConfig(145, "M/44H/145H/0H/0/{index}", "https://api.fullstack.cash/v5/electrumx", MainNetParams.get(), false),
    )

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val cfg = config(chain)
        val key = deriveKey(mnemonic, index, cfg)
        return if (cfg.useSegwit) {
            SegwitAddress.fromKey(cfg.network, key).toString()
        } else {
            Address.fromKey(cfg.network, key, org.bitcoinj.script.Script.ScriptType.P2PKH).toString()
        }
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        val cfg = config(chain)
        try {
            when (chain.family.lowercase()) {
                "doge" -> {
                    val json = URL("${cfg.apiBase}/addrs/$address/balance").readText()
                    val balance = Regex(""""balance"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
                    "%.8f".format(balance / 1e8)
                }
                else -> {
                    val base = chain.rpcUrl.ifBlank { cfg.apiBase }.removeSuffix("/")
                    val json = URL("$base/address/$address").readText()
                    val funded = Regex(""""funded_txo_sum"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
                    val spent = Regex(""""spent_txo_sum"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
                    "%.8f".format((funded - spent) / 1e8)
                }
            }
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
        val cfg = config(chain)
        val key = deriveKey(mnemonic, index, cfg)
        val from = deriveAddress(mnemonic, index, chain)
        val base = chain.rpcUrl.ifBlank { cfg.apiBase }.removeSuffix("/")
        val utxoJson = URL("$base/address/$from/utxo").readText()
        val utxos = JSONArray(utxoJson)
        if (utxos.length() == 0) throw IllegalStateException("No UTXOs")

        val amountSats = (BigDecimal(amount) * BigDecimal(100_000_000)).longValueExact()
        val fee = 1000L
        var total = 0L
        val tx = Transaction(cfg.network)
        val redeemScript = if (cfg.useSegwit) ScriptBuilder.createP2WPKHOutputScript(key) else null

        for (i in 0 until utxos.length()) {
            val utxo = utxos.getJSONObject(i)
            val txHash = Sha256Hash.wrap(utxo.getString("txid"))
            val vout = utxo.getInt("vout")
            val value = utxo.getLong("value")
            if (cfg.useSegwit) {
                tx.addInput(txHash, vout.toLong(), redeemScript)
            } else {
                tx.addInput(txHash, vout.toLong(), ScriptBuilder.createP2PKHOutputScript(key))
            }
            total += value
            if (total >= amountSats + fee) break
        }
        if (total < amountSats + fee) throw IllegalStateException("Insufficient balance")

        tx.addOutput(Coin.valueOf(amountSats), Address.fromString(cfg.network, to))
        val change = total - amountSats - fee
        if (change > 0) {
            val changeAddr = if (cfg.useSegwit) {
                SegwitAddress.fromKey(cfg.network, key)
            } else {
                Address.fromKey(cfg.network, key, org.bitcoinj.script.Script.ScriptType.P2PKH)
            }
            tx.addOutput(Coin.valueOf(change), changeAddr)
        }

        tx.inputs.forEachIndexed { inputIndex, _ ->
            if (cfg.useSegwit) {
                val sig = tx.calculateSignature(
                    inputIndex, key, redeemScript, org.bitcoinj.core.Transaction.SigHash.ALL, false,
                )
                val witness = org.bitcoinj.core.TransactionWitness(2)
                witness.setPush(0, sig.encodeToBitcoin())
                witness.setPush(1, key.pubKey)
                tx.getInput(inputIndex.toLong()).witness = witness
            } else {
                val script = org.bitcoinj.script.ScriptBuilder.createP2PKHOutputScript(key)
                val sig = tx.calculateSignature(
                    inputIndex, key, script, org.bitcoinj.core.Transaction.SigHash.ALL, false,
                )
                tx.getInput(inputIndex.toLong()).scriptSig = org.bitcoinj.script.ScriptBuilder.createInputScript(sig, key)
            }
        }

        val txHex = Utils.HEX.encode(tx.bitcoinSerialize())
        val conn = URL("$base/tx").openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "text/plain")
        conn.outputStream.use { it.write(txHex.toByteArray()) }
        if (conn.responseCode >= 400) {
            throw IllegalStateException(conn.errorStream?.bufferedReader()?.readText() ?: "Broadcast failed")
        }
        tx.txId.toString()
    }

    override fun supportsSend(chain: Chain): Boolean = configs.containsKey(chain.family.lowercase()) ||
        chain.symbol.uppercase() in setOf("LTC", "DOGE", "BCH")

    private fun config(chain: Chain): UtxoConfig {
        val key = chain.family.lowercase()
        configs[key]?.let { return it }
        return when (chain.symbol.uppercase()) {
            "LTC" -> configs["ltc"]!!
            "DOGE" -> configs["doge"]!!
            "BCH" -> configs["bch"]!!
            else -> throw IllegalArgumentException("Unsupported UTXO chain: ${chain.symbol}")
        }
    }

    private fun deriveKey(mnemonic: String, index: Int, cfg: UtxoConfig): org.bitcoinj.crypto.DeterministicKey {
        val seed = DeterministicSeed(mnemonic.trim().lowercase(), null, "", 0L)
        val chainObj = DeterministicKeyChain.builder().seed(seed).build()
        return chainObj.getKeyByPath(HDPath.parsePath(cfg.pathTemplate.replace("{index}", index.toString())), true)
    }

    private fun litecoinParams(): NetworkParameters = object : MainNetParams() {
        init {
            id = "org.litecoin.main"
            addressHeader = 48
            p2shHeader = 50
            segwitAddressHrp = "ltc"
        }
    }
}
