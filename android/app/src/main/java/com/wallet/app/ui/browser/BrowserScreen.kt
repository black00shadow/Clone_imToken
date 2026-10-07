package com.wallet.app.ui.browser

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Primary
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun BrowserScreen(vm: WalletViewModel) {
    val state by vm.state.collectAsState()
    var selectedUrl by remember { mutableStateOf<String?>(null) }
    val dapps = state.bootstrap?.dapps?.filter { it.isFeatured }.orEmpty().ifEmpty {
        state.bootstrap?.dapps.orEmpty()
    }

    if (selectedUrl != null) {
        DAppWebView(url = selectedUrl!!, onBack = { selectedUrl = null })
    } else {
        Column(Modifier.fillMaxSize().background(Background).padding(16.dp)) {
            Text("Recommend", fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
            LazyColumn {
                items(dapps) { dapp ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp).clickable { selectedUrl = dapp.url },
                        colors = CardDefaults.cardColors(containerColor = CardColor),
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Text(dapp.name, fontWeight = FontWeight.SemiBold)
                            Text(dapp.category, color = Primary, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun DAppWebView(url: String, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize()) {
        Text(
            "← Back",
            color = Primary,
            modifier = Modifier.padding(16.dp).clickable(onClick = onBack),
        )
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    webViewClient = WebViewClient()
                    loadUrl(url)
                }
            },
            modifier = Modifier.fillMaxSize(),
            update = { it.loadUrl(url) },
        )
    }
}
