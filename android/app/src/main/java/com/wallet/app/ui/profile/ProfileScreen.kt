package com.wallet.app.ui.profile

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.Link
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Danger
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun ProfileScreen(
    vm: WalletViewModel,
    onLock: () -> Unit,
    onHistory: () -> Unit,
    onWalletConnect: () -> Unit,
) {
    val state by vm.state.collectAsState()
    val account = state.account
    var showMnemonic by remember { mutableStateOf(false) }
    val context = LocalContext.current

    Column(Modifier.fillMaxSize().background(Background)) {
        Column(
            Modifier.fillMaxWidth().background(CardColor).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(account?.name ?: "Account", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
            Text(
                account?.evmAddress ?: "",
                color = TextSecondary,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 4.dp),
            )
        }

        MenuSection {
            MenuItem("Lock Wallet", Icons.Outlined.Lock) { onLock() }
            MenuItem("Backup Mnemonic", Icons.Outlined.Key) { showMnemonic = true }
            MenuItem("Transaction History", Icons.Outlined.History, onHistory)
            MenuItem("WalletConnect", Icons.Outlined.Link, onWalletConnect)
        }

        MenuSection {
            MenuItem("Reset Wallet", Icons.AutoMirrored.Outlined.Logout, danger = true) { vm.resetWallet() }
        }

        Text("Wallet v1.0.0 · Kotlin Native", color = TextSecondary, modifier = Modifier.padding(24.dp))
    }

    if (showMnemonic) {
        AlertDialog(
            onDismissRequest = { showMnemonic = false },
            title = { Text("Mnemonic") },
            text = { Text(vm.getMnemonic() ?: "") },
            confirmButton = {
                TextButton(onClick = {
                    Toast.makeText(context, "Keep this secret", Toast.LENGTH_SHORT).show()
                    showMnemonic = false
                }) { Text("OK") }
            },
        )
    }
}

@Composable
private fun MenuSection(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = CardColor),
    ) { Column { content() } }
}

@Composable
private fun MenuItem(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    danger: Boolean = false,
    onClick: () -> Unit,
) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = label, tint = if (danger) Danger else TextSecondary)
        Text(
            label,
            modifier = Modifier.padding(start = 12.dp).weight(1f),
            color = if (danger) Danger else MaterialTheme.colorScheme.onSurface,
        )
    }
}
