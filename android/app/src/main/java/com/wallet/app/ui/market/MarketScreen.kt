package com.wallet.app.ui.market

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.ui.theme.Tokenlon
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun MarketScreen(vm: WalletViewModel) {
    val state by vm.state.collectAsState()
    var amount by remember { mutableStateOf("") }
    val swapEnabled = state.bootstrap?.config?.get("swap_enabled") != "false"

    Column(Modifier.fillMaxSize().background(Background).padding(16.dp)) {
        Text("Tokenlon", color = Tokenlon, fontFamily = Manrope, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Instant token swap", color = TextSecondary, fontFamily = Manrope, fontSize = 13.sp)
        Spacer(Modifier.height(16.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(CardColor).padding(16.dp)) {
            Text("From ETH", color = TextSecondary, fontFamily = Manrope)
            OutlinedTextField(
                value = amount,
                onValueChange = {
                    amount = it
                    if (it.isNotBlank()) vm.fetchSwapQuote(it)
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("0.0") },
            )
            Spacer(Modifier.height(12.dp))
            Text("To USDT", color = TextSecondary, fontFamily = Manrope)
            Text(state.swapQuote ?: "0.0", color = TextPrimary, fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 20.sp, modifier = Modifier.padding(vertical = 8.dp))
            Button(
                onClick = { vm.executeSwap(amount) },
                enabled = swapEnabled && amount.isNotBlank() && !state.swapping,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Tokenlon),
            ) {
                if (state.swapping) CircularProgressIndicator(color = Color.White) else Text("Swap", fontFamily = Manrope)
            }
            state.error?.let { Text(it, color = Color(0xFFFA5151), fontFamily = Manrope, modifier = Modifier.padding(top = 8.dp)) }
            state.message?.let { Text(it, color = Tokenlon, fontFamily = Manrope, modifier = Modifier.padding(top = 8.dp)) }
        }
    }
}
