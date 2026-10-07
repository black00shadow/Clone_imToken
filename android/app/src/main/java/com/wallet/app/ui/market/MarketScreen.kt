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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Card as CardColor
import com.wallet.app.ui.theme.TextSecondary
import com.wallet.app.ui.theme.Tokenlon
import com.wallet.app.viewmodel.WalletViewModel

@Composable
fun MarketScreen(vm: WalletViewModel) {
    val state by vm.state.collectAsState()
    var amount by remember { mutableStateOf("") }
    val swapEnabled = state.bootstrap?.config?.get("swap_enabled") != "false"

    Column(Modifier.fillMaxSize().background(Background).padding(16.dp)) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardColor),
            shape = RoundedCornerShape(12.dp),
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Tokenlon", color = Tokenlon, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                Text("Instant token swap", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
            }
        }
        Spacer(Modifier.height(12.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardColor),
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("From ETH", color = TextSecondary)
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
                Text("To USDT", color = TextSecondary)
                Text(state.swapQuote ?: "0.0", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 8.dp))
                Text("Powered by Tokenlon · 0x API", color = TextSecondary, style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = { vm.executeSwap(amount) },
                    enabled = swapEnabled && amount.isNotBlank() && !state.swapping,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Tokenlon),
                ) {
                    if (state.swapping) CircularProgressIndicator() else Text("Swap")
                }
                state.error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp)) }
                state.message?.let { Text(it, color = Tokenlon, modifier = Modifier.padding(top = 8.dp)) }
            }
        }
    }
}
