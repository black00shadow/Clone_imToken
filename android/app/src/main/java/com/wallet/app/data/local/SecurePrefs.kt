package com.wallet.app.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.UUID

class SecurePrefs(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "wallet_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    var mnemonic: String?
        get() = prefs.getString(KEY_MNEMONIC, null)
        set(value) = prefs.edit().putString(KEY_MNEMONIC, value).apply()

    var pin: String?
        get() = prefs.getString(KEY_PIN, null)
        set(value) = prefs.edit().putString(KEY_PIN, value).apply()

    var activeAccountIndex: Int
        get() = prefs.getInt(KEY_ACTIVE_ACCOUNT, 0)
        set(value) = prefs.edit().putInt(KEY_ACTIVE_ACCOUNT, value).apply()

    var accountsCount: Int
        get() = prefs.getInt(KEY_ACCOUNTS_COUNT, 1)
        set(value) = prefs.edit().putInt(KEY_ACCOUNTS_COUNT, value).apply()

    var biometricEnabled: Boolean
        get() = prefs.getBoolean(KEY_BIOMETRIC, false)
        set(value) = prefs.edit().putBoolean(KEY_BIOMETRIC, value).apply()

    var isUnlocked: Boolean
        get() = prefs.getBoolean(KEY_UNLOCKED, false)
        set(value) = prefs.edit().putBoolean(KEY_UNLOCKED, value).apply()

    var deviceId: String
        get() {
            val existing = prefs.getString(KEY_DEVICE_ID, null)
            if (!existing.isNullOrBlank()) return existing
            val created = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_DEVICE_ID, created).apply()
            return created
        }
        set(value) = prefs.edit().putString(KEY_DEVICE_ID, value).apply()

    fun hasWallet(): Boolean = !mnemonic.isNullOrBlank()

    fun hasPin(): Boolean = !pin.isNullOrBlank()

    fun clearWallet() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_MNEMONIC = "wallet_mnemonic"
        private const val KEY_PIN = "wallet_pin"
        private const val KEY_ACTIVE_ACCOUNT = "wallet_active_account"
        private const val KEY_ACCOUNTS_COUNT = "wallet_accounts_count"
        private const val KEY_BIOMETRIC = "wallet_biometric"
        private const val KEY_UNLOCKED = "wallet_unlocked"
        private const val KEY_DEVICE_ID = "wallet_device_id"
    }
}
