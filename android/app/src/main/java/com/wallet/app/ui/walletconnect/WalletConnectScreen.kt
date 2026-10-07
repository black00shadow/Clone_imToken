package com.wallet.app.ui.walletconnect

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.reown.walletkit.client.Wallet
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel
import com.wallet.app.walletconnect.WalletConnectManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletConnectScreen(vm: WalletViewModel, onBack: () -> Unit) {
    var uri by remember { mutableStateOf("") }
    val sessions by WalletConnectManager.sessions.collectAsState()
    val proposal by WalletConnectManager.pendingProposal.collectAsState()
    val request by WalletConnectManager.pendingRequest.collectAsState()
    val wcError by WalletConnectManager.lastError.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("WalletConnect") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) }
                },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
            Text("Paste URI or scan QR from DApp", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
            OutlinedTextField(
                value = uri,
                onValueChange = { uri = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("wc:...") },
            )
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = { vm.pairWalletConnect(uri) },
                enabled = uri.startsWith("wc:"),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Connect") }

            wcError?.let {
                Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
            }

            Spacer(Modifier.height(16.dp))
            Text("Active Sessions", fontWeight = FontWeight.SemiBold)
            LazyColumn(Modifier.weight(1f)) {
                items(sessions) { session ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Row(Modifier.padding(12.dp)) {
                            Column(Modifier.weight(1f)) {
                                Text(session.name, fontWeight = FontWeight.Medium)
                                Text(session.url, color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                            }
                            OutlinedButton(onClick = { vm.disconnectWalletConnect(session.topic) }) {
                                Text("Disconnect")
                            }
                        }
                    }
                }
            }
        }
    }

    proposal?.let { p ->
        AlertDialog(
            onDismissRequest = { vm.rejectWalletConnectProposal(p) },
            title = { Text("Session Request") },
            text = { Text("${p.peerMetaData?.name ?: "DApp"} wants to connect\n${p.peerMetaData?.url ?: ""}") },
            confirmButton = {
                TextButton(onClick = { vm.approveWalletConnectProposal(p) }) {
                    Text("Approve", color = Primary)
                }
            },
            dismissButton = {
                TextButton(onClick = { vm.rejectWalletConnectProposal(p) }) { Text("Reject") }
            },
        )
    }

    request?.let { r ->
        AlertDialog(
            onDismissRequest = { vm.rejectWalletConnectRequest(r) },
            title = { Text("Sign Request") },
            text = {
                Text("${r.peerMetaData?.name ?: "DApp"}\n\nMethod: ${r.request.method}\n\n${r.request.params}")
            },
            confirmButton = {
                TextButton(onClick = { vm.approveWalletConnectRequest(r) }) {
                    Text("Approve", color = Primary)
                }
            },
            dismissButton = {
                TextButton(onClick = { vm.rejectWalletConnectRequest(r) }) { Text("Reject") }
            },
        )
    }
}
