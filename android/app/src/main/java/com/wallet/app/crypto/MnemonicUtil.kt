package com.wallet.app.crypto

import org.web3j.crypto.MnemonicUtils
import java.security.SecureRandom

object MnemonicUtil {
    fun generate(): String {
        val entropy = ByteArray(16)
        SecureRandom().nextBytes(entropy)
        return MnemonicUtils.generateMnemonic(entropy)
    }

    fun validate(mnemonic: String): Boolean = try {
        MnemonicUtils.validateMnemonic(mnemonic.trim().lowercase())
        true
    } catch (_: Exception) {
        false
    }
}
