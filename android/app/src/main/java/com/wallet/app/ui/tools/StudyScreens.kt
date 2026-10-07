package com.wallet.app.ui.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.data.model.family
import androidx.compose.material3.Icon
import com.wallet.app.ui.components.AppIcons
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun NetworksScreen(vm: WalletViewModel, onBack: () -> Unit) {
    val state by vm.state.collectAsState()
    StudyPage("Networks", onBack) {
        state.bootstrap?.chains.orEmpty().forEach { chain ->
            val selected = chain.id == state.selectedChainId
            Column(
                Modifier.fillMaxWidth().padding(bottom = 8.dp).clip(RoundedCornerShape(12.dp)).background(CardColor)
                    .clickable { vm.selectChain(chain.id) }.padding(14.dp),
            ) {
                Text(chain.name + if (selected) "  ✓" else "", color = if (selected) Primary else TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold)
                Text("${chain.symbol} · ${chain.family().name}", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                if (chain.rpcUrl.isNotBlank()) Text(chain.rpcUrl, color = TextSecondary, fontFamily = Manrope, fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun AddressBookScreen(onBack: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    val book = remember { mutableStateListOf<Pair<String, String>>() }
    StudyPage("Address Book", onBack) {
        OutlinedTextField(name, { name = it }, Modifier.fillMaxWidth(), label = { Text("Name") })
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(address, { address = it }, Modifier.fillMaxWidth(), label = { Text("Address") })
        Spacer(Modifier.height(8.dp))
        Button(
            onClick = {
                if (name.isNotBlank() && address.isNotBlank()) {
                    book.add(name.trim() to address.trim())
                    name = ""
                    address = ""
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Primary),
        ) { Text("Save", fontFamily = Manrope) }
        Spacer(Modifier.height(12.dp))
        if (book.isEmpty()) Text("No saved addresses yet.", color = TextSecondary, fontFamily = Manrope)
        book.forEach { (n, a) ->
            Column(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                Text(n, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Medium)
                Text(a, color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun NftScreen(onBack: () -> Unit) {
    StudyPage("NFT", onBack) {
        Text("Collectibles for the active account show here.", color = TextSecondary, fontFamily = Manrope)
        Spacer(Modifier.height(12.dp))
        Text("No NFTs yet. This screen is the gallery slot a multi-chain wallet uses for ERC-721 and TRC-721 items.", color = TextPrimary, fontFamily = Manrope)
    }
}

@Composable
fun ScanScreen(onBack: () -> Unit, onOpenWalletConnect: () -> Unit) {
    var uri by remember { mutableStateOf("") }
    StudyPage("Scan", onBack) {
        Text("Paste a WalletConnect URI. A camera scanner uses the same field.", color = TextSecondary, fontFamily = Manrope)
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(uri, { uri = it }, Modifier.fillMaxWidth(), label = { Text("wc:") })
        Spacer(Modifier.height(8.dp))
        Button(onClick = onOpenWalletConnect, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
            Text("Open WalletConnect", fontFamily = Manrope)
        }
    }
}

@Composable
fun SettingsScreen(onBack: () -> Unit, onLock: () -> Unit) {
    StudyPage("Settings", onBack) {
        SettingRow("Language", "English")
        SettingRow("Currency", "USD")
        SettingRow("Security", "PIN + pattern") { onLock() }
        SettingRow("Notifications", "On")
        Text("Changing language or currency is stored with the wallet profile. Lock returns to the PIN screen.", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
private fun SettingRow(title: String, value: String, onClick: () -> Unit = {}) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 14.dp)) {
        Text(title, color = TextPrimary, fontFamily = Manrope, modifier = Modifier.weight(1f))
        Text(value, color = TextSecondary, fontFamily = Manrope)
    }
}

@Composable
private fun StudyPage(title: String, onBack: () -> Unit, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().background(Background)) {
        Row(Modifier.fillMaxWidth().background(CardColor).padding(horizontal = 12.dp, vertical = 14.dp)) {
            Icon(AppIcons.Back, contentDescription = "Back", tint = TextPrimary, modifier = Modifier.size(22.dp).clickable(onClick = onBack))
            Text(title, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
        }
        Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp)) { content() }
    }
}
