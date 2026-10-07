package com.wallet.app.crypto.wallets

import com.wallet.app.crypto.ChainWallet
import com.wallet.app.crypto.util.Bech32Util
import com.wallet.app.crypto.util.Slip10
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.WalletAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Hash
import org.web3j.crypto.Sign
import java.math.BigDecimal
import java.net.URL

object AptChainWallet : ChainWallet {
    override val family = "apt"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 637, index = index)
        val keyBytes = ed25519.publicKey + ed25519.privateKey
        val hash = sha3_256(keyBytes)
        return "0x" + hash.joinToString("") { "%02x".format(it) }
    }

    override fun supportsSend(chain: Chain) = false

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val base = chain.rpcUrl.ifBlank { "https://fullnode.mainnet.aptoslabs.com/v1" }.removeSuffix("/")
            val json = URL("$base/accounts/$address/resource/0x1::coin::CoinStore%3C0x1::aptos_coin::AptosCoin%3E").readText()
            val amount = Regex(""""value"\s*:\s*"(\d+)"""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.8f".format(amount / 1e8)
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
    ): String = throw IllegalStateException("Aptos send requires aptos-core BCS SDK")
}

object SuiChainWallet : ChainWallet {
    override val family = "sui"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 784, index = index)
        val scheme = byteArrayOf(0x00)
        val data = scheme + ed25519.publicKey
        val checksum = blake2b256(data).copyOfRange(0, 4)
        return "0x" + (data + checksum).joinToString("") { "%02x".format(it) }
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val base = chain.rpcUrl.ifBlank { "https://fullnode.mainnet.sui.io" }.removeSuffix("/")
            val body = """{"jsonrpc":"2.0","id":1,"method":"suix_getBalance","params":["$address"]}"""
            val response = postJson(base, body)
            val amount = Regex(""""totalBalance"\s*:\s*"(\d+)"""").find(response)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.9f".format(amount / 1e9)
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
    ): String = throw IllegalStateException("Sui transaction building requires sui-sdk")

    override fun supportsSend(chain: Chain) = false
}

object NearChainWallet : ChainWallet {
    override val family = "near"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 397, index = index)
        return ed25519.publicKey.joinToString("") { "%02x".format(it) }
    }

    override fun supportsSend(chain: Chain) = false

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val base = chain.rpcUrl.ifBlank { "https://rpc.mainnet.near.org" }.removeSuffix("/")
            val body = """{"jsonrpc":"2.0","id":1,"method":"query","params":{"request_type":"view_account","finality":"final","account_id":"$address"}}"""
            val response = postJson(base, body)
            val amount = Regex(""""amount"\s*:\s*"(\d+)"""").find(response)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.6f".format(amount / 1e24)
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
    ): String = throw IllegalStateException("NEAR transfer requires near-api-js equivalent")
}

object XlmChainWallet : ChainWallet {
    override val family = "xlm"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, chain.coinType ?: 148, index = index)
        return encodeStellarAddress(ed25519.publicKey)
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val base = chain.rpcUrl.ifBlank { "https://horizon.stellar.org" }.removeSuffix("/")
            val json = URL("$base/accounts/$address").readText()
            val balance = Regex(""""asset_type"\s*:\s*"native".*?"balance"\s*:\s*"([^"]+)"""")
                .find(json)?.groupValues?.get(1)?.toDouble() ?: 0.0
            "%.7f".format(balance)
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
    ): String = throw IllegalStateException("Stellar transaction requires stellar-sdk")

    override fun supportsSend(chain: Chain) = false
}

object XrpChainWallet : ChainWallet {
    override val family = "xrp"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String {
        val pair = Slip10.deriveSecp256k1(mnemonic, chain.coinType ?: 144, index)
        val pubKey = compress(Sign.publicKeyFromPrivate(pair.privateKey))
        return encodeRippleAddress(pubKey)
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        try {
            val body = """{"method":"account_info","params":[{"account":"$address","ledger_index":"validated"}]}"""
            val response = postJson("https://xrplcluster.com", body)
            val drops = Regex(""""Balance"\s*:\s*"(\d+)"""").find(response)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.6f".format(drops / 1e6)
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
    ): String = throw IllegalStateException("XRP payment requires xrpl4j signing")

    override fun supportsSend(chain: Chain) = false
}

object ViewOnlyChainWallet : ChainWallet {
    override val family = "view"

    override fun deriveAddress(mnemonic: String, index: Int, chain: Chain): String = when (chain.family.lowercase()) {
        "dot" -> substrateAddress(mnemonic, index, 354, "polkadot")
        "ksm" -> substrateAddress(mnemonic, index, 434, "kusama")
        "xtz" -> tezosAddress(mnemonic, index)
        "ckb" -> ckbAddress(mnemonic, index)
        "fil" -> filAddress(mnemonic, index)
        else -> throw IllegalArgumentException("Unsupported view-only chain ${chain.symbol}")
    }

    override suspend fun getBalance(chain: Chain, address: String): String = withContext(Dispatchers.IO) {
        when (chain.family.lowercase()) {
            "dot" -> subscanBalance("polkadot", address, 10)
            "ksm" -> subscanBalance("kusama", address, 12)
            "xtz" -> tezosBalance(address)
            "ckb" -> ckbBalance(address)
            "fil" -> filBalance(address)
            else -> "0"
        }
    }

    override suspend fun send(
        mnemonic: String,
        index: Int,
        chain: Chain,
        to: String,
        amount: String,
        account: WalletAccount,
    ): String = throw IllegalStateException("${chain.symbol} send requires native Substrate/Tezos SDK")

    override fun supportsSend(chain: Chain) = false

    private fun substrateAddress(mnemonic: String, index: Int, coinType: Int, prefix: String): String {
        val pair = Slip10.deriveSecp256k1(mnemonic, coinType, index)
        val pub = Sign.publicKeyFromPrivate(pair.privateKey)
        val hash = blake2b256(pub).copyOfRange(0, 32)
        return ss58Encode(prefix, hash)
    }

    private fun tezosAddress(mnemonic: String, index: Int): String {
        val ed25519 = Slip10.deriveEd25519(mnemonic, 1729, index = index)
        val hash = blake2b256(ed25519.publicKey).copyOfRange(0, 20)
        return "tz1" + Base58.encode(hash)
    }

    private fun ckbAddress(mnemonic: String, index: Int): String {
        val pair = Slip10.deriveSecp256k1(mnemonic, 309, index)
        val pub = compress(Sign.publicKeyFromPrivate(pair.privateKey))
        val scriptHash = blake2b160(pub)
        return "ckb1qz" + scriptHash.joinToString("") { "%02x".format(it) }
    }

    private fun filAddress(mnemonic: String, index: Int): String {
        val pair = Slip10.deriveSecp256k1(mnemonic, 461, index)
        val pub = compress(Sign.publicKeyFromPrivate(pair.privateKey))
        val payload = byteArrayOf(1) + blake2b160(pub)
        return "f1" + Base32.encode(payload)
    }

    private suspend fun subscanBalance(network: String, address: String, decimals: Int): String {
        return try {
            val json = URL("https://$network.api.subscan.io/api/scan/account").let { url ->
                val conn = url.openConnection() as java.net.HttpURLConnection
                conn.requestMethod = "POST"
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/json")
                conn.outputStream.use { it.write("""{"address":"$address"}""".toByteArray()) }
                conn.inputStream.bufferedReader().readText()
            }
            val amount = Regex(""""balance"\s*:\s*"(\d+)"""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
            "%.${decimals}f".format(amount / Math.pow(10.0, decimals.toDouble()))
        } catch (_: Exception) {
            "0"
        }
    }

    private fun tezosBalance(address: String): String = try {
        val json = URL("https://api.tzkt.io/v1/accounts/$address").readText()
        val mutez = Regex(""""balance"\s*:\s*(\d+)""").find(json)?.groupValues?.get(1)?.toLong() ?: 0L
        "%.6f".format(mutez / 1e6)
    } catch (_: Exception) {
        "0"
    }

    private fun ckbBalance(address: String): String = try {
        val json = URL("https://mainnet.ckb.dev/").readText()
        "0"
    } catch (_: Exception) {
        "0"
    }

    private fun filBalance(address: String): String = try {
        val body = """{"jsonrpc":"2.0","id":1,"method":"Filecoin.WalletBalance","params":["$address"]}"""
        val response = postJson("https://api.node.glif.io", body)
        val atto = Regex(""""result"\s*:\s*"(\d+)"""").find(response)?.groupValues?.get(1)?.toLong() ?: 0L
        "%.4f".format(atto / 1e18)
    } catch (_: Exception) {
        "0"
    }
}

private fun sha3_256(data: ByteArray): ByteArray {
    val digest = org.bouncycastle.jcajce.provider.digest.SHA3.Digest256()
    return digest.digest(data)
}

private fun encodeStellarAddress(publicKey: ByteArray): String {
    val version = byteArrayOf(6 shl 3) // ed25519
    val payload = version + publicKey
    val checksum = crc16(payload)
    return Base32.encode(payload + checksum)
}

private fun encodeRippleAddress(publicKey: ByteArray): String {
    val payload = byteArrayOf(0x00) + Hash.sha256(publicKey).copyOfRange(12, 32)
    return Base58.encodeChecked(payload)
}

private fun compress(publicKey: ByteArray): ByteArray {
    val uncompressed = when (publicKey.size) {
        64 -> byteArrayOf(0x04) + publicKey
        65 -> publicKey
        33 -> return publicKey
        else -> publicKey
    }
    val y = uncompressed[64].toInt() and 1
    return byteArrayOf((2 + y).toByte()) + uncompressed.copyOfRange(1, 33)
}

private fun blake2b256(data: ByteArray): ByteArray {
    val digest = org.bouncycastle.crypto.digests.Blake2bDigest(256)
    digest.update(data, 0, data.size)
    return ByteArray(32).also { digest.doFinal(it, 0) }
}

private fun blake2b160(data: ByteArray): ByteArray = blake2b256(data).copyOfRange(0, 20)

private fun ss58Encode(prefix: String, publicKeyHash: ByteArray): String {
    val type = when (prefix) {
        "polkadot" -> 0
        "kusama" -> 2
        else -> 42
    }
    val prefixBytes = if (type < 64) byteArrayOf(type.toByte()) else byteArrayOf(((type shr 8) or 0x40).toByte(), (type and 0xFF).toByte())
    val checksum = blake2b256("SS58PRE".toByteArray() + prefixBytes + publicKeyHash)
    return Base58.encode(prefixBytes + publicKeyHash + checksum.copyOfRange(0, 2))
}

private fun postJson(url: String, body: String): String {
    val conn = URL(url).openConnection() as java.net.HttpURLConnection
    conn.requestMethod = "POST"
    conn.doOutput = true
    conn.setRequestProperty("Content-Type", "application/json")
    conn.outputStream.use { it.write(body.toByteArray()) }
    return conn.inputStream.bufferedReader().readText()
}

private fun crc16(data: ByteArray): ByteArray {
    var crc = 0
    for (b in data) {
        crc = crc xor (b.toInt() shl 8)
        repeat(8) {
            crc = if (crc and 0x8000 != 0) (crc shl 1) xor 0x1021 else crc shl 1
        }
    }
    return byteArrayOf((crc shr 8).toByte(), crc.toByte())
}

private object Base58 {
    private const val ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

    fun encode(input: ByteArray): String {
        var num = java.math.BigInteger(1, input)
        val sb = StringBuilder()
        while (num > java.math.BigInteger.ZERO) {
            val div = num.divideAndRemainder(java.math.BigInteger.valueOf(58))
            sb.append(ALPHABET[div[1].toInt()])
            num = div[0]
        }
        input.forEach { if (it == 0.toByte()) sb.append('1') }
        return sb.reverse().toString()
    }

    fun encodeChecked(payload: ByteArray): String {
        val checksum = Hash.sha256(Hash.sha256(payload)).copyOfRange(0, 4)
        return encode(payload + checksum)
    }
}

private object Base32 {
    private const val ALPHABET = "abcdefghijklmnopqrstuvwxyz234567"

    fun encode(data: ByteArray): String {
        val sb = StringBuilder()
        var buffer = 0
        var bits = 0
        for (b in data) {
            buffer = (buffer shl 8) or (b.toInt() and 0xff)
            bits += 8
            while (bits >= 5) {
                bits -= 5
                sb.append(ALPHABET[(buffer shr bits) and 31])
            }
        }
        if (bits > 0) sb.append(ALPHABET[(buffer shl (5 - bits)) and 31])
        return sb.toString()
    }
}
