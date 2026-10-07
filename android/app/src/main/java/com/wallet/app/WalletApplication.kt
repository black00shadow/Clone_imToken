package com.wallet.app

import android.app.Application
import com.wallet.app.data.local.SecurePrefs
import com.wallet.app.data.local.TxHistoryStore
import com.wallet.app.walletconnect.WalletConnectManager
import com.wallet.app.BuildConfig

class WalletApplication : Application() {
    lateinit var securePrefs: SecurePrefs
        private set
    lateinit var txHistoryStore: TxHistoryStore
        private set

    override fun onCreate() {
        super.onCreate()
        securePrefs = SecurePrefs(this)
        txHistoryStore = TxHistoryStore(this)
        WalletConnectManager.initialize(this, BuildConfig.WC_PROJECT_ID)
    }
}
