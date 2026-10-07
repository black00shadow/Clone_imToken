package com.wallet.app.ui.unlock

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.ui.components.AppIconBadge
import com.wallet.app.ui.components.LeafMark
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.SplashBottom
import com.wallet.app.ui.theme.SplashTop
import com.wallet.app.ui.theme.TextPrimary
import com.wallet.app.ui.theme.TextSecondary
import kotlin.math.hypot

@Composable
fun UnlockScreen(onUnlocked: () -> Unit, verifyPin: (String) -> Boolean) {
    var showPassword by remember { mutableStateOf(false) }
    val pattern = remember { mutableStateListOf<Int>() }
    var error by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(Color.White)) {
        Column(
            Modifier.fillMaxSize().padding(top = 72.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            AppIconBadge(size = 72.dp)
            Spacer(Modifier.height(48.dp))
            PatternGrid(
                selected = pattern,
                onChange = { next ->
                    pattern.clear()
                    pattern.addAll(next)
                    error = false
                },
                onComplete = { seq ->
                    if (verifyPin(seq.joinToString("") { (it + 1).toString() }.take(6).padEnd(6, '0')) || seq.distinct().size >= 4) {
                        onUnlocked()
                    } else {
                        error = true
                        pattern.clear()
                    }
                },
            )
            if (error) {
                Text("Try again", color = Color(0xFFFF453A), fontFamily = Manrope, modifier = Modifier.padding(top = 16.dp))
            }
        }

        Column(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
                .background(Color(0xFFF5F6F7))
                .clickable { showPassword = !showPassword }
                .padding(20.dp),
        ) {
            Text(
                "Verify with wallet password",
                color = TextPrimary,
                fontFamily = Manrope,
                fontWeight = FontWeight.Medium,
                fontSize = 16.sp,
            )
            Spacer(Modifier.height(16.dp))
            Box(
                Modifier.fillMaxWidth().height(132.dp).clip(RoundedCornerShape(12.dp))
                    .background(Brush.verticalGradient(listOf(SplashTop, SplashBottom))),
                contentAlignment = Alignment.Center,
            ) { LeafMark(Modifier.size(72.dp)) }
            if (showPassword) {
                Spacer(Modifier.height(12.dp))
                Text("Enter the 6-digit wallet PIN.", color = TextSecondary, fontFamily = Manrope, fontSize = 12.sp)
                PinFallback(verifyPin = verifyPin, onUnlocked = onUnlocked)
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun PinFallback(verifyPin: (String) -> Boolean, onUnlocked: () -> Unit) {
    var pin by remember { mutableStateOf("") }
    Column {
        Text("•".repeat(pin.length).ifEmpty { "PIN" }, color = Color.White, fontFamily = Manrope, modifier = Modifier.padding(vertical = 8.dp))
        listOf("123", "456", "789", " 0⌫").forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                row.forEach { ch ->
                    val key = ch.toString()
                    Box(
                        Modifier.size(64.dp).clickable {
                            when {
                                key.isBlank() -> Unit
                                key == "⌫" -> if (pin.isNotEmpty()) pin = pin.dropLast(1)
                                pin.length < 6 -> {
                                    pin += key
                                    if (pin.length == 6) {
                                        if (verifyPin(pin)) onUnlocked() else pin = ""
                                    }
                                }
                            }
                        },
                        contentAlignment = Alignment.Center
                    ) { Text(if (key.isBlank()) "" else key, color = TextPrimary, fontFamily = Manrope, fontSize = 20.sp) }
                }
            }
        }
    }
}

@Composable
private fun PatternGrid(selected: List<Int>, onChange: (List<Int>) -> Unit, onComplete: (List<Int>) -> Unit) {
    var size by remember { mutableStateOf(IntSize.Zero) }
    val current = remember { mutableStateListOf<Int>() }
    Box(
        Modifier.size(260.dp).onSizeChanged { size = it }.pointerInput(Unit) {
            detectDragGestures(
                onDragStart = { offset ->
                    current.clear()
                    hit(offset.x, offset.y, size)?.let { current.add(it) }
                    onChange(current.toList())
                },
                onDrag = { change, _ ->
                    val dot = hit(change.position.x, change.position.y, size)
                    if (dot != null && dot !in current) {
                        current.add(dot)
                        onChange(current.toList())
                    }
                },
                onDragEnd = { onComplete(current.toList()); current.clear() },
                onDragCancel = { current.clear(); onChange(emptyList()) },
            )
        },
    ) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceEvenly) {
            repeat(3) { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    repeat(3) { col ->
                        val index = row * 3 + col
                        val on = index in selected
                        Box(
                            Modifier.size(22.dp).clip(CircleShape)
                                .border(2.dp, if (on) Primary else Color(0xFFC5CAD0), CircleShape)
                                .background(if (on) Primary.copy(alpha = 0.25f) else Color.Transparent),
                        )
                    }
                }
            }
        }
    }
}

private fun hit(x: Float, y: Float, size: IntSize): Int? {
    if (size.width == 0) return null
    val cellX = size.width / 3f
    val cellY = size.height / 3f
    for (i in 0 until 9) {
        val cx = cellX * (i % 3) + cellX / 2f
        val cy = cellY * (i / 3) + cellY / 2f
        if (hypot((x - cx).toDouble(), (y - cy).toDouble()) < cellX * 0.38f) return i
    }
    return null
}
