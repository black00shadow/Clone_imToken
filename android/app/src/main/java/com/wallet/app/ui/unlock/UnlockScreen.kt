package com.wallet.app.ui.unlock

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.onboarding.PinPad
import com.wallet.app.ui.theme.Danger
import com.wallet.app.ui.theme.TextSecondary

@Composable
fun UnlockScreen(onUnlocked: () -> Unit, verifyPin: (String) -> Boolean) {
    var pin by remember { mutableStateOf("") }
    var error by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Enter PIN", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Text("Unlock your wallet", color = TextSecondary, modifier = Modifier.padding(top = 8.dp, bottom = 32.dp))
        if (error) Text("Wrong PIN", color = Danger, modifier = Modifier.padding(bottom = 16.dp))
        PinPad(
            onDigit = { d ->
                if (pin.length < 6) {
                    pin += d
                    if (pin.length == 6) {
                        if (verifyPin(pin)) onUnlocked() else {
                            error = true
                            pin = ""
                        }
                    }
                }
            },
            onDelete = { if (pin.isNotEmpty()) pin = pin.dropLast(1); error = false },
        )
    }
}
