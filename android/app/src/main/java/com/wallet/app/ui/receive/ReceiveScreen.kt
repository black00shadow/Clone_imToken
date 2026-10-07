package com.wallet.app.ui.receive

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.data.model.Token
import androidx.compose.material3.Icon
import com.wallet.app.ui.components.AppIcons
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.util.QrCodeGenerator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReceiveScreen(
    symbol: String,
    chainName: String,
    address: String,
    tokens: List<Token> = emptyList(),
    onBack: () -> Unit,
    onBackup: () -> Unit = {},
) {
    val context = LocalContext.current
    var backedUp by remember { mutableStateOf(false) }
    var showAssets by remember { mutableStateOf(true) }
    var picked by remember { mutableStateOf(symbol.ifBlank { "TRX" }) }
    val qr = remember(address) { QrCodeGenerator.generate(address, 480) }

    Column(Modifier.fillMaxSize().background(Background)) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(AppIcons.Back, contentDescription = "Back", tint = TextPrimary, modifier = Modifier.size(22.dp).clickable(onClick = onBack))
            Text(
                "Receive",
                color = TextPrimary,
                fontFamily = Manrope,
                fontWeight = FontWeight.SemiBold,
                fontSize = 17.sp,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
            )
            Icon(AppIcons.Help, contentDescription = null, tint = TextPrimary, modifier = Modifier.size(22.dp))
        }

        if (!backedUp) {
            Column(Modifier.fillMaxSize().padding(16.dp)) {
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(CardColor).padding(20.dp),
                ) {
                    Text("Security reminders", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Spacer(Modifier.height(10.dp))
                    Text(
                        "Back up your mnemonic phrase before receiving assets. Anyone with the phrase can move your funds.",
                        color = TextSecondary,
                        fontFamily = Manrope,
                        fontSize = 14.sp,
                    )
                    Spacer(Modifier.height(18.dp))
                    Box(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Primary)
                            .clickable {
                                backedUp = true
                                showAssets = false
                                onBackup()
                            }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("Backup now", color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.SemiBold)
                    }
                }
                Spacer(Modifier.weight(1f))
                Text(
                    "Want to make the most of your wallet?",
                    color = TextSecondary,
                    fontFamily = Manrope,
                    fontSize = 13.sp,
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                )
                Text(
                    "Get tokens",
                    color = Primary,
                    fontFamily = Manrope,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 6.dp, bottom = 24.dp).clickable { showAssets = true },
                )
            }
        } else {
            Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { showAssets = true }) {
                    Text(picked, color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Icon(AppIcons.Down, contentDescription = null, tint = TextPrimary, modifier = Modifier.size(18.dp))
                }
                Text(chainName, color = TextSecondary, fontFamily = Manrope, fontSize = 13.sp)
                Spacer(Modifier.height(20.dp))
                qr?.let { Image(bitmap = it.asImageBitmap(), contentDescription = "QR", modifier = Modifier.size(220.dp)) }
                Spacer(Modifier.height(16.dp))
                Text(address, color = TextPrimary, fontFamily = Manrope, textAlign = TextAlign.Center, fontSize = 13.sp)
                Spacer(Modifier.height(20.dp))
                Box(
                    Modifier.clip(RoundedCornerShape(24.dp)).background(Primary).clickable {
                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        cm.setPrimaryClip(ClipData.newPlainText("address", address))
                    }.padding(horizontal = 28.dp, vertical = 12.dp),
                ) { Text("Copy Address", color = Color.White, fontFamily = Manrope) }
            }
        }
    }

    if (showAssets) {
        ModalBottomSheet(
            onDismissRequest = { showAssets = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = Color(0xFF141414),
        ) {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Select Asset", color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.weight(1f))
                    Text(chainName.ifBlank { "Tron" }, color = TextSecondary, fontFamily = Manrope)
                }
                Spacer(Modifier.height(12.dp))
                Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(Color(0xFF2C2C2E)).padding(12.dp)) {
                    Text("Input Token Name", color = TextSecondary, fontFamily = Manrope)
                }
                Spacer(Modifier.height(8.dp))
                val rows = tokens.ifEmpty {
                    listOf(
                        Token(id = "trx", name = "TRON", symbol = "TRX", isNative = true),
                        Token(id = "usdt", name = "Tether USD", symbol = "USDT"),
                    )
                }
                rows.forEach { token ->
                    Row(
                        Modifier.fillMaxWidth().clickable {
                            picked = token.symbol
                            showAssets = false
                            backedUp = true
                        }.padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier.size(36.dp).clip(CircleShape).background(
                                if (token.symbol.equals("USDT", true)) Color(0xFF26A17B) else Color(0xFFEB0029),
                            ),
                            contentAlignment = Alignment.Center,
                        ) { Text(token.symbol.take(1), color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.Bold) }
                        Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                            Text(token.symbol, color = Color.White, fontFamily = Manrope, fontWeight = FontWeight.SemiBold)
                            Text(token.name, color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("0", color = Color.White, fontFamily = Manrope)
                            Text("$0", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}
