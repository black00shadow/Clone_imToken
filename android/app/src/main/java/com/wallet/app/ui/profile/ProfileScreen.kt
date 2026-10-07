package com.wallet.app.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.ui.components.AppIcons
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Border
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.IconWell
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun ProfileScreen(
    vm: WalletViewModel,
    onLock: () -> Unit,
    onHistory: () -> Unit,
    onWalletConnect: () -> Unit,
    onManage: () -> Unit = {},
    onNetworks: () -> Unit = {},
    onNft: () -> Unit = {},
    onScan: () -> Unit = {},
    onSettings: () -> Unit = {},
) {
    val state by vm.state.collectAsState()
    var showMnemonic by remember { mutableStateOf(false) }
    var showAbout by remember { mutableStateOf(false) }
    val accounts = state.accounts.size.coerceAtLeast(1)
    val address = state.account?.evmAddress.orEmpty()

    Column(Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())) {
        Column(Modifier.fillMaxWidth().background(CardColor).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.size(64.dp).clip(CircleShape).background(IconWell), contentAlignment = Alignment.Center) {
                Icon(AppIcons.Me, contentDescription = null, tint = Primary, modifier = Modifier.size(32.dp))
            }
            Text("My Profile", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(top = 10.dp))
            Text(
                if (address.length > 12) address.take(8) + "..." + address.takeLast(6) else address.ifBlank { "No address yet" },
                color = TextSecondary,
                fontFamily = Manrope,
                fontSize = 12.sp,
            )
        }
        Spacer(Modifier.height(12.dp))
        MenuCard {
            MenuRow(AppIcons.Wallet, "Manage Wallets", "$accounts", onClick = onManage)
            MenuRow(AppIcons.Key, "Backup Mnemonic", onClick = { showMnemonic = true })
            MenuRow(AppIcons.History, "Transaction History", onClick = onHistory)
            MenuRow(AppIcons.Scan, "WalletConnect", onClick = onWalletConnect)
            MenuRow(AppIcons.Book, "Address Book", onClick = onManage)
            MenuRow(AppIcons.Nft, "NFT", onClick = onNft)
            MenuRow(AppIcons.Scan, "Scan", onClick = onScan, last = true)
        }
        Spacer(Modifier.height(12.dp))
        MenuCard {
            MenuRow(AppIcons.Globe, "Networks", onClick = onNetworks)
            MenuRow(AppIcons.Gear, "Settings", onClick = onSettings)
            MenuRow(AppIcons.Lock, "Lock", onClick = onLock)
            MenuRow(AppIcons.Info, "About", onClick = { showAbout = true }, last = true)
        }
        Spacer(Modifier.height(12.dp))
        MenuCard {
            MenuRow(AppIcons.Lock, "Reset Wallet", danger = true, onClick = { vm.resetWallet() }, last = true)
        }
        Spacer(Modifier.height(24.dp))
    }

    if (showMnemonic) {
        AlertDialog(
            onDismissRequest = { showMnemonic = false },
            title = { Text("Backup mnemonic", fontFamily = Manrope) },
            text = { Text(vm.exportMnemonic() ?: "No wallet", fontFamily = Manrope) },
            confirmButton = { TextButton(onClick = { showMnemonic = false }) { Text("Close") } },
        )
    }
    if (showAbout) {
        AlertDialog(
            onDismissRequest = { showAbout = false },
            title = { Text("About", fontFamily = Manrope) },
            text = { Text("Multi-chain wallet for study. Create, restore, transfer, receive, swap, and WalletConnect.", fontFamily = Manrope) },
            confirmButton = { TextButton(onClick = { showAbout = false }) { Text("Close") } },
        )
    }
}

@Composable
private fun MenuCard(content: @Composable () -> Unit) {
    Column(Modifier.padding(horizontal = 16.dp).clip(RoundedCornerShape(12.dp)).background(CardColor)) { content() }
}

@Composable
private fun MenuRow(
    icon: ImageVector,
    title: String,
    trailing: String? = null,
    onClick: () -> Unit,
    danger: Boolean = false,
    last: Boolean = false,
) {
    val tint = if (danger) Color(0xFFFA5151) else TextPrimary
    Column {
        Row(
            Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 14.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(32.dp).clip(CircleShape).background(if (danger) Color(0xFFFFF1F0) else IconWell), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = if (danger) tint else Primary, modifier = Modifier.size(18.dp))
            }
            Text(title, color = tint, fontFamily = Manrope, fontSize = 15.sp, modifier = Modifier.weight(1f).padding(start = 12.dp))
            if (trailing != null) Text(trailing, color = TextSecondary, fontFamily = Manrope, fontSize = 13.sp, modifier = Modifier.padding(end = 4.dp))
            Icon(AppIcons.Chevron, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(18.dp))
        }
        if (!last) HorizontalDivider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(start = 58.dp))
    }
}
