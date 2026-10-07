package com.wallet.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.wallet.app.data.local.SecurePrefs
import com.wallet.app.data.local.TxHistoryStore

class WalletViewModelFactory(
    private val securePrefs: SecurePrefs,
    private val txHistoryStore: TxHistoryStore,
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(WalletViewModel::class.java)) {
            return WalletViewModel(securePrefs, txHistoryStore) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
