package com.wallet.app.ui.wallet

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.data.model.Chain
import com.wallet.app.data.model.ChainFamily
import com.wallet.app.data.model.WalletAccount
import com.wallet.app.data.model.family
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

private data class ActionItem(val label: String, val icon: ImageVector, val onClick: () -> Unit)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    vm: WalletViewModel,
    onSend: (chainId: String, tokenId: String?) -> Unit,
    onReceive: (chainId: String) -> Unit,
    onHistory: () -> Unit,
    onWalletConnect: () -> Unit,
    onBrowser: () -> Unit = {},
    onMarket: () -> Unit = {},
) {
    val state by vm.state.collectAsState()
    val account = state.account
    val chains = state.bootstrap?.chains.orEmpty()
    val selected = chains.find { it.id == state.selectedChainId } ?: chains.firstOrNull()
    var showAccounts by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val address = chainAddress(selected, account)

    val actions = listOf(
        ActionItem("Transfer", AppIcons.Transfer) { selected?.let { onSend(it.id, null) } },
        ActionItem("Receive", AppIcons.Receive) { selected?.let { onReceive(it.id) } },
        ActionItem("Swap", AppIcons.Market, onMarket),
        ActionItem("History", AppIcons.History, onHistory),
    )

    Column(Modifier.fillMaxSize().background(Background).verticalScroll(rememberScrollState())) {
        Column(Modifier.fillMaxWidth().background(CardColor).padding(horizontal = 16.dp, vertical = 14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(36.dp).clip(CircleShape).background(IconWell), contentAlignment = Alignment.Center) {
                    Text(accountLabel(account).takeLast(1), color = Primary, fontFamily = Manrope, fontWeight = FontWeight.Bold)
                }
                Column(Modifier.weight(1f).padding(start = 10.dp).clickable { showAccounts = true }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(accountLabel(account), color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                        Icon(AppIcons.Down, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(18.dp))
                    }
                    Text(selected?.name ?: "Wallet", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                }
                Icon(
                    AppIcons.Scan,
                    contentDescription = "Scan",
                    tint = TextPrimary,
                    modifier = Modifier.size(24.dp).clickable(onClick = onWalletConnect),
                )
            }
            Spacer(Modifier.height(22.dp))
            Text("Total assets", color = TextSecondary, fontFamily = Manrope, fontSize = 13.sp)
            Text("$0.00", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 32.sp)
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 6.dp)) {
                Text(
                    shortAddress(address),
                    color = TextSecondary,
                    fontFamily = Manrope,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.width(6.dp))
                Icon(
                    AppIcons.Copy,
                    contentDescription = "Copy",
                    tint = TextSecondary,
                    modifier = Modifier.size(16.dp).clickable {
                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        cm.setPrimaryClip(ClipData.newPlainText("address", address))
                    },
                )
            }
        }

        Row(
            Modifier.fillMaxWidth().background(CardColor).padding(vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            actions.forEach { action ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable(onClick = action.onClick),
                ) {
                    Box(Modifier.size(48.dp).clip(CircleShape).background(IconWell), contentAlignment = Alignment.Center) {
                        Icon(action.icon, contentDescription = action.label, tint = Primary, modifier = Modifier.size(22.dp))
                    }
                    Text(action.label, color = TextPrimary, fontFamily = Manrope, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        Row(
            Modifier.fillMaxWidth().background(CardColor).horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            chains.forEach { chain ->
                val on = chain.id == selected?.id
                Text(
                    chain.symbol,
                    color = if (on) Primary else TextSecondary,
                    fontFamily = Manrope,
                    fontWeight = if (on) FontWeight.SemiBold else FontWeight.Normal,
                    fontSize = 13.sp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (on) IconWell else Color.Transparent)
                        .clickable { vm.selectChain(chain.id) }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                )
            }
        }

        Column(Modifier.fillMaxWidth().padding(top = 8.dp).background(CardColor)) {
            Text(
                "Assets",
                color = TextPrimary,
                fontFamily = Manrope,
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            )
            HorizontalDivider(color = Border, thickness = 0.5.dp)
            val tokens = selected?.tokens.orEmpty()
            if (tokens.isEmpty()) {
                TokenRow(selected?.symbol ?: "TRX", selected?.name ?: "Native", "0")
            }
            tokens.forEachIndexed { index, token ->
                val bal = if (token.isNative) state.balances[selected?.id] else state.tokenBalances[token.id]
                TokenRow(token.symbol, token.name, bal ?: "0")
                if (index != tokens.lastIndex) HorizontalDivider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(start = 68.dp))
            }
        }
        state.error?.let {
            Text(it, color = Color(0xFFFA5151), fontFamily = Manrope, fontSize = 12.sp, modifier = Modifier.padding(16.dp))
        }
        Spacer(Modifier.height(16.dp))
    }

    if (showAccounts) {
        ModalBottomSheet(
            onDismissRequest = { showAccounts = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = Color.White,
        ) {
            Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Accounts", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.weight(1f))
                    Text("Add", color = Primary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, modifier = Modifier.clickable { vm.addAccount() })
                }
                state.accounts.forEach { acc ->
                    val on = acc.index == account?.index
                    Row(
                        Modifier.fillMaxWidth().clickable { vm.switchAccount(acc.index); showAccounts = false }.padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(Modifier.size(36.dp).clip(CircleShape).background(IconWell), contentAlignment = Alignment.Center) {
                            Text("${acc.index + 1}", color = Primary, fontFamily = Manrope, fontWeight = FontWeight.Bold)
                        }
                        Column(Modifier.weight(1f).padding(start = 12.dp)) {
                            Text("Account ${acc.index + 1}", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Medium)
                            Text(shortAddress(chainAddress(selected, acc)), color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                        }
                        if (on) Text("Current", color = Primary, fontFamily = Manrope, fontSize = 12.sp)
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun TokenRow(symbol: String, name: String, balance: String) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(40.dp).clip(CircleShape).background(IconWell), contentAlignment = Alignment.Center) {
            Text(symbol.take(1), color = Primary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
        Column(Modifier.weight(1f).padding(start = 12.dp)) {
            Text(symbol, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Text(name, color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(balance, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Medium, fontSize = 15.sp)
            Text("$0.00", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
        }
    }
}

private fun accountLabel(account: WalletAccount?): String = "Account ${(account?.index ?: 0) + 1}"

private fun chainAddress(chain: Chain?, account: WalletAccount?): String {
    if (account == null) return ""
    if (chain == null) return account.evmAddress
    return when (chain.family()) {
        ChainFamily.TRON -> account.tronAddress
        ChainFamily.BTC, ChainFamily.UTXO -> account.btcAddress
        ChainFamily.TON -> account.tonAddress
        ChainFamily.COSMOS -> account.cosmosAddress
        else -> account.evmAddress
    }
}

private fun shortAddress(address: String): String =
    if (address.length < 12) address else address.take(6) + "..." + address.takeLast(4)
