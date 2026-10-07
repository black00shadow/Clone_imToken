package com.wallet.app.ui.wallet

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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDownward
import androidx.compose.material.icons.outlined.ArrowUpward
import androidx.compose.material.icons.outlined.Link
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.material.icons.outlined.History
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.PrimaryLight
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun WalletScreen(
    vm: WalletViewModel,
    onSend: (chainId: String, tokenId: String?) -> Unit,
    onReceive: (chainId: String) -> Unit,
    onHistory: () -> Unit,
    onWalletConnect: () -> Unit,
) {
    val state by vm.state.collectAsState()
    val account = state.account
    val chains = state.bootstrap?.chains.orEmpty()
    val selectedId = state.selectedChainId ?: chains.firstOrNull()?.id

    Column(Modifier.fillMaxSize().background(Background)) {
        Box(
            Modifier.fillMaxWidth().background(Primary).padding(top = 48.dp, bottom = 24.dp, start = 16.dp, end = 16.dp),
        ) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(account?.name ?: "Account", color = Color.White, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Text("Total Asset Value", color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.bodySmall)
                Text("≈ $0.00", color = Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(
                    account?.evmAddress?.let { "${it.take(6)}...${it.takeLast(4)}" } ?: "",
                    color = Color.White.copy(alpha = 0.6f),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).offset(y = (-20).dp),
            shape = RoundedCornerShape(12.dp),
            elevation = CardDefaults.cardElevation(4.dp),
            colors = CardDefaults.cardColors(containerColor = CardColor),
        ) {
            Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                QuickAction("Transfer", Icons.Outlined.ArrowUpward) {
                    selectedId?.let { onSend(it, null) }
                }
                QuickAction("Receive", Icons.Outlined.ArrowDownward) {
                    selectedId?.let { onReceive(it) }
                }
                QuickAction("Swap", Icons.Outlined.SwapHoriz) { }
                QuickAction("History", Icons.Outlined.History, onHistory)
            }
        }

        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            chains.forEach { chain ->
                FilterChip(
                    selected = chain.id == selectedId,
                    onClick = { vm.selectChain(chain.id) },
                    label = { Text(chain.symbol) },
                )
            }
        }

        if (state.loading) {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Primary)
            }
        }

        Column(Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
            chains.filter { selectedId == null || it.id == selectedId }.forEach { chain ->
                chain.tokens.forEach { token ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp).clickable {
                            onSend(chain.id, if (token.isNative) null else token.id)
                        },
                        colors = CardDefaults.cardColors(containerColor = CardColor),
                    ) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                Modifier.size(40.dp).clip(CircleShape).background(PrimaryLight),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(token.symbol.take(1), color = Primary, fontWeight = FontWeight.Bold)
                            }
                            Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                                Text(token.name, fontWeight = FontWeight.SemiBold)
                                Text(chain.name, color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                val bal = if (token.isNative) state.balances[chain.id] else state.tokenBalances[token.id]
                                Text(bal ?: "0", fontWeight = FontWeight.SemiBold)
                                Text(token.symbol, color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }

            Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ToolChip("WalletConnect", Icons.Outlined.Link, onWalletConnect)
            }

            state.error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(8.dp)) }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun QuickAction(label: String, icon: ImageVector, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick),
    ) {
        Box(
            Modifier.size(44.dp).clip(CircleShape).background(PrimaryLight),
            contentAlignment = Alignment.Center,
        ) { Icon(icon, contentDescription = label, tint = Primary) }
        Text(label, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 6.dp))
    }
}

@Composable
private fun ToolChip(label: String, icon: ImageVector, onClick: () -> Unit) {
    Card(
        modifier = Modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = CardColor),
    ) {
        Row(Modifier.padding(horizontal = 12.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = label, tint = Primary, modifier = Modifier.size(18.dp))
            Text(label, modifier = Modifier.padding(start = 6.dp), style = MaterialTheme.typography.labelMedium, color = Primary)
        }
    }
}
