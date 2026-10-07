package com.wallet.app.data.local

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.wallet.app.data.model.TxRecord

class TxHistoryStore(context: Context) {
    private val prefs = context.getSharedPreferences("tx_history", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun save(tx: TxRecord) {
        val list = getAll().toMutableList()
        list.add(0, tx)
        prefs.edit().putString(KEY, gson.toJson(list.take(200))).apply()
    }

    fun getAll(): List<TxRecord> {
        val raw = prefs.getString(KEY, null) ?: return emptyList()
        return try {
            gson.fromJson(raw, object : TypeToken<List<TxRecord>>() {}.type)
        } catch (_: Exception) {
            emptyList()
        }
    }

    companion object {
        private const val KEY = "history"
    }
}
