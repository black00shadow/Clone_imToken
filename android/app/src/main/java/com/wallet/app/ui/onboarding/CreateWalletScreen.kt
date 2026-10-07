package com.wallet.app.ui.onboarding

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.theme.Primary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateWalletScreen(onBack: () -> Unit, onCreated: () -> Unit, onCreate: () -> String) {
    var mnemonic by remember { mutableStateOf("") }
    var confirmed by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Wallet") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(20.dp).verticalScroll(rememberScrollState()),
        ) {
            Text("Backup your 12-word mnemonic", fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            if (mnemonic.isEmpty()) {
                Button(onClick = { mnemonic = onCreate() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Generate Mnemonic")
                }
            } else {
                Text(mnemonic, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(16.dp))
                Button(
                    onClick = { confirmed = true; onCreated() },
                    enabled = !confirmed,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(if (confirmed) "Saved" else "I have backed it up")
                }
            }
        }
    }
}
