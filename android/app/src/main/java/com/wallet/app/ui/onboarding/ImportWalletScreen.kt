package com.wallet.app.ui.onboarding

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.theme.Danger

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImportWalletScreen(onBack: () -> Unit, onImported: () -> Unit, onImport: (String) -> Boolean) {
    var mnemonic by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Import Wallet") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) }
                },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(20.dp)) {
            OutlinedTextField(
                value = mnemonic,
                onValueChange = { mnemonic = it; error = null },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Mnemonic (12/24 words)") },
                minLines = 3,
            )
            error?.let { Text(it, color = Danger, modifier = Modifier.padding(top = 8.dp)) }
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = {
                    if (onImport(mnemonic)) onImported() else error = "Invalid mnemonic"
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Import") }
        }
    }
}
