package com.wallet.app.ui.browser

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.wallet.app.data.model.ChainFamily
import com.wallet.app.data.model.family
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel

private data class QuickTool(val name: String, val url: String, val tint: Color)

private val quickTools = listOf(
    QuickTool("Bridgers", "https://bridgers.xyz", Color(0xFF5B6CFF)),
    QuickTool("Jumper", "https://jumper.exchange", Color(0xFF7B61FF)),
    QuickTool("ChangeNOW", "https://changenow.io", Color(0xFF00D26A)),
    QuickTool("BuyTRX", "https://www.dappso.com", Color(0xFFEB0029)),
    QuickTool("USDT Lite Account", "https://www.dappso.com", Color(0xFF26A17B)),
    QuickTool("FixedFloat", "https://fixedfloat.com", Color(0xFF3DDC97)),
    QuickTool("TRONAgg", "https://www.dappso.com", Color(0xFFEB0029)),
    QuickTool("Tron Stake", "https://www.dappso.com", Color(0xFFE85D4C)),
)

@Composable
fun BrowserScreen(vm: WalletViewModel) {
    val state by vm.state.collectAsState()
    var selectedUrl by remember { mutableStateOf<String?>(null) }
    var filter by remember { mutableStateOf("All") }
    val account = state.account
    val chain = state.bootstrap?.chains?.find { it.id == state.selectedChainId }
    val address = when (chain?.family()) {
        ChainFamily.TRON -> account?.tronAddress
        ChainFamily.BTC, ChainFamily.UTXO -> account?.btcAddress
        else -> account?.evmAddress ?: account?.tronAddress
    }.orEmpty()
    val short = if (address.length > 12) address.take(4) + "..." + address.takeLast(4) else address

    if (selectedUrl != null) {
        DAppWebView(url = selectedUrl!!, onBack = { selectedUrl = null })
    } else {
        Column(Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState()).padding(bottom = 16.dp)) {
            Box(
                Modifier.padding(horizontal = 16.dp, vertical = 10.dp).fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp)).background(CardColor).padding(horizontal = 14.dp, vertical = 10.dp),
            ) { Text("www.dappso.com", color = TextSecondary, fontFamily = Manrope, fontSize = 14.sp) }

            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(22.dp).clip(CircleShape).background(Color(0xFFEB0029)), contentAlignment = Alignment.Center) {
                    Text("T", color = Color.White, fontFamily = Manrope, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.width(8.dp))
                Text(short, color = TextPrimary, fontFamily = Manrope, fontSize = 13.sp, modifier = Modifier.weight(1f))
                Text("Energy 0/0", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                Spacer(Modifier.width(8.dp))
                Text(
                    "Buy Energy",
                    color = Color.White,
                    fontFamily = Manrope,
                    fontSize = 12.sp,
                    modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(Primary).padding(horizontal = 8.dp, vertical = 4.dp),
                )
            }

            Text("Quick Tools", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 16.dp, top = 12.dp, bottom = 8.dp))
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                modifier = Modifier.height(190.dp).padding(horizontal = 8.dp),
                userScrollEnabled = false,
            ) {
                items(quickTools) { tool ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(vertical = 8.dp).clickable { selectedUrl = tool.url },
                    ) {
                        Box(Modifier.size(44.dp).clip(CircleShape).background(tool.tint), contentAlignment = Alignment.Center) {
                            Text(tool.name.take(1), color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.Bold)
                        }
                        Text(
                            tool.name,
                            color = TextPrimary,
                            fontFamily = Manrope,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 4.dp).width(72.dp),
                        )
                    }
                }
            }

            Text("Featured Perps", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 16.dp, top = 8.dp))
            Text("Hot Dapp", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 16.dp, top = 12.dp, bottom = 8.dp))
            Row(
                Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("All", "Latest", "TRON", "ETH", "BNB", "ARB").forEach { chip ->
                    val on = chip == filter
                    Text(
                        chip,
                        color = if (on) Color.White else TextSecondary,
                        fontFamily = Manrope,
                        fontSize = 13.sp,
                        modifier = Modifier.clip(RoundedCornerShape(14.dp))
                            .background(if (on) Primary else CardColor)
                            .clickable { filter = chip }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            state.bootstrap?.dapps.orEmpty()
                .filter { filter == "All" || filter == "Latest" || it.category.contains(filter, true) || it.name.contains(filter, true) }
                .forEach { dapp ->
                    Row(
                        Modifier.fillMaxWidth().clickable { selectedUrl = dapp.url }.padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(Modifier.size(36.dp).clip(CircleShape).background(Primary), contentAlignment = Alignment.Center) {
                            Text(dapp.name.take(1), color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.Bold)
                        }
                        Column(Modifier.padding(start = 12.dp)) {
                            Text(dapp.name, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Medium)
                            Text(dapp.category, color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                        }
                    }
                }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun DAppWebView(url: String, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(Background)) {
        Text("← $url", color = Primary, fontFamily = Manrope, maxLines = 1, modifier = Modifier.padding(16.dp).clickable(onClick = onBack))
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    webViewClient = WebViewClient()
                    loadUrl(url)
                }
            },
            modifier = Modifier.fillMaxSize(),
        )
    }
}
