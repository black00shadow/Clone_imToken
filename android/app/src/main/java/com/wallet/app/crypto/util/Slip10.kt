package com.wallet.app.crypto.util

import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
import org.web3j.crypto.Bip32ECKeyPair
import org.web3j.crypto.MnemonicUtils
import org.web3j.utils.Numeric

data class Ed25519KeyPair(val privateKey: ByteArray, val publicKey: ByteArray)

object Slip10 {
    private const val HARDENED_BIT = 0x80000000.toInt()

    fun deriveSecp256k1(mnemonic: String, coinType: Int, index: Int): Bip32ECKeyPair {
        val seed = MnemonicUtils.generateSeed(mnemonic.trim().lowercase(), "")
        val master = Bip32ECKeyPair.generateKeyPair(seed)
        val path = intArrayOf(hardened(44), hardened(coinType), hardened(0), 0, index)
        return Bip32ECKeyPair.deriveKeyPair(master, path)
    }

    fun deriveEd25519(mnemonic: String, coinType: Int, account: Int = 0, change: Int = 0, index: Int = 0): Ed25519KeyPair {
        val seed = MnemonicUtils.generateSeed(mnemonic.trim().lowercase(), "")
        var key = hmacSha512("ed25519 seed".toByteArray(), seed).copyOfRange(0, 32)
        var chain = hmacSha512("ed25519 seed".toByteArray(), seed).copyOfRange(32, 64)
        // SLIP-0010 Ed25519 only supports hardened derivation.
        val segments = intArrayOf(hardened(44), hardened(coinType), hardened(account), hardened(change), hardened(index))
        for (segment in segments) {
            val data = byteArrayOf(0) + key + intToBytes(segment)
            val derived = hmacSha512(chain, data)
            key = derived.copyOfRange(0, 32)
            chain = derived.copyOfRange(32, 64)
        }
        val publicKey = Ed25519PrivateKeyParameters(key, 0).generatePublicKey().encoded
        return Ed25519KeyPair(key, publicKey)
    }

    fun secp256k1PrivateKeyHex(pair: Bip32ECKeyPair): String =
        Numeric.toHexStringNoPrefix(pair.privateKey)

    private fun hardened(value: Int): Int = value or HARDENED_BIT

    private fun intToBytes(value: Int): ByteArray = byteArrayOf(
        (value ushr 24).toByte(),
        (value ushr 16).toByte(),
        (value ushr 8).toByte(),
        value.toByte(),
    )

    private fun hmacSha512(key: ByteArray, data: ByteArray): ByteArray {
        val mac = org.bouncycastle.crypto.macs.HMac(org.bouncycastle.crypto.digests.SHA512Digest())
        mac.init(org.bouncycastle.crypto.params.KeyParameter(key))
        mac.update(data, 0, data.size)
        return ByteArray(mac.macSize).also { mac.doFinal(it, 0) }
    }
}
