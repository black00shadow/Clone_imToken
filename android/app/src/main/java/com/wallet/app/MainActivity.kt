package com.wallet.app

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.fragment.app.FragmentActivity
import com.wallet.app.ui.navigation.WalletNavHost
import com.wallet.app.ui.theme.WalletTheme

class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val app = application as WalletApplication
        setContent {
            WalletTheme {
                WalletNavHost(securePrefs = app.securePrefs, txHistoryStore = app.txHistoryStore)
            }
        }
    }
}
