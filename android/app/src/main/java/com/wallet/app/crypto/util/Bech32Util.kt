package com.wallet.app.crypto.util

object Bech32Util {
    private const val CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

    fun encode(hrp: String, data: ByteArray): String {
        val converted = convertBits(data, 8, 5, true)
        val checksum = createChecksum(hrp, converted)
        val combined = converted + checksum
        return hrp + "1" + combined.map { CHARSET[it] }.joinToString("")
    }

    fun decodeAddress(address: String): Pair<String, ByteArray> {
        val pos = address.lastIndexOf('1')
        require(pos >= 1) { "Invalid bech32" }
        val hrp = address.substring(0, pos).lowercase()
        val data = address.substring(pos + 1).map { CHARSET.indexOf(it) }.toIntArray()
        val payload = data.copyOfRange(0, data.size - 6)
        val bytes = convertBits(payload, 5, 8, false)
        return hrp to bytes
    }

    private fun convertBits(data: ByteArray, fromBits: Int, toBits: Int, pad: Boolean): IntArray {
        var acc = 0
        var bits = 0
        val result = mutableListOf<Int>()
        val maxv = (1 shl toBits) - 1
        for (b in data) {
            acc = (acc shl fromBits) or (b.toInt() and 0xff)
            bits += fromBits
            while (bits >= toBits) {
                bits -= toBits
                result.add((acc shr bits) and maxv)
            }
        }
        if (pad && bits > 0) result.add((acc shl (toBits - bits)) and maxv)
        return result.toIntArray()
    }

    private fun convertBits(data: IntArray, fromBits: Int, toBits: Int, pad: Boolean): ByteArray {
        var acc = 0
        var bits = 0
        val result = mutableListOf<Int>()
        val maxv = (1 shl toBits) - 1
        for (value in data) {
            acc = (acc shl fromBits) or value
            bits += fromBits
            while (bits >= toBits) {
                bits -= toBits
                result.add((acc shr bits) and maxv)
            }
        }
        if (pad && bits > 0) result.add((acc shl (toBits - bits)) and maxv)
        return result.map { it.toByte() }.toByteArray()
    }

    private fun createChecksum(hrp: String, data: IntArray): IntArray {
        val values = hrpExpand(hrp) + data + intArrayOf(0, 0, 0, 0, 0, 0)
        val polymod = bech32Polymod(values) xor 1
        return IntArray(6) { i -> (polymod shr (5 * (5 - i))) and 31 }
    }

    private fun hrpExpand(hrp: String): IntArray =
        hrp.map { it.code shr 5 }.toIntArray() + intArrayOf(0) + hrp.map { it.code and 31 }.toIntArray()

    private fun bech32Polymod(values: IntArray): Int {
        val gen = intArrayOf(0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3)
        var chk = 1
        for (v in values) {
            val b = chk shr 25
            chk = ((chk and 0x1ffffff) shl 5) xor v
            for (i in 0..4) if ((b shr i) and 1 == 1) chk = chk xor gen[i]
        }
        return chk
    }
}
