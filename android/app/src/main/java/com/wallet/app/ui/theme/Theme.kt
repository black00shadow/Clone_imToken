package com.wallet.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.LocalTextStyle

private val DarkColors = darkColorScheme(
    primary = Primary,
    onPrimary = Color.White,
    secondary = Tokenlon,
    background = Background,
    surface = Card,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = Danger,
)

@Composable
fun WalletTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        typography = TpType,
    ) {
        CompositionLocalProvider(
            LocalTextStyle provides TpType.bodyMedium,
            content = content,
        )
    }
}
