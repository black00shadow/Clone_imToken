package com.wallet.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.wallet.app.ui.theme.SplashBottom
import com.wallet.app.ui.theme.SplashTop

/** TokenPocket leaf: a thick white hook with a small dot at the tail. */
@Composable
fun LeafMark(modifier: Modifier = Modifier, color: Color = Color.White) {
    Canvas(modifier) {
        val w = size.minDimension
        val stroke = w * 0.16f
        val path = Path().apply {
            moveTo(w * 0.30f, w * 0.70f)
            cubicTo(w * 0.18f, w * 0.46f, w * 0.30f, w * 0.18f, w * 0.56f, w * 0.20f)
            cubicTo(w * 0.84f, w * 0.22f, w * 0.90f, w * 0.48f, w * 0.70f, w * 0.64f)
            cubicTo(w * 0.58f, w * 0.74f, w * 0.50f, w * 0.80f, w * 0.46f, w * 0.84f)
        }
        drawPath(
            path,
            color = color,
            style = Stroke(width = stroke, cap = StrokeCap.Round),
        )
        drawCircle(color, radius = stroke * 0.42f, center = Offset(w * 0.40f, w * 0.90f))
    }
}

@Composable
fun AppIconBadge(modifier: Modifier = Modifier, size: Dp = 72.dp) {
    Box(
        modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.23f))
            .background(Brush.linearGradient(listOf(SplashTop, SplashBottom))),
        contentAlignment = Alignment.Center,
    ) {
        LeafMark(Modifier.size(size * 0.66f))
    }
}

@Composable
fun TpGlyph(kind: TpIcon, modifier: Modifier = Modifier, tint: Color = Color.White) {
    Canvas(modifier) {
        val w = size.minDimension
        val s = Stroke(width = w * 0.075f, cap = StrokeCap.Round)
        fun line(x1: Float, y1: Float, x2: Float, y2: Float) {
            drawLine(tint, Offset(w * x1, w * y1), Offset(w * x2, w * y2), strokeWidth = s.width, cap = StrokeCap.Round)
        }
        when (kind) {
            TpIcon.Transfer -> {
                line(0.22f, 0.38f, 0.78f, 0.38f)
                line(0.58f, 0.22f, 0.80f, 0.38f)
                line(0.58f, 0.54f, 0.80f, 0.38f)
                line(0.22f, 0.68f, 0.78f, 0.68f)
                line(0.22f, 0.68f, 0.42f, 0.52f)
                line(0.22f, 0.68f, 0.42f, 0.84f)
            }
            TpIcon.Receive -> {
                drawCircle(tint, radius = w * 0.34f, style = Stroke(w * 0.07f))
                line(0.50f, 0.28f, 0.50f, 0.70f)
                line(0.34f, 0.54f, 0.50f, 0.72f)
                line(0.66f, 0.54f, 0.50f, 0.72f)
            }
            TpIcon.Activity -> {
                val path = Path().apply {
                    moveTo(w * 0.12f, w * 0.62f)
                    lineTo(w * 0.32f, w * 0.62f)
                    lineTo(w * 0.42f, w * 0.28f)
                    lineTo(w * 0.56f, w * 0.78f)
                    lineTo(w * 0.68f, w * 0.46f)
                    lineTo(w * 0.88f, w * 0.46f)
                }
                drawPath(path, tint, style = s)
            }
            TpIcon.Trx -> {
                val tri = Path().apply {
                    moveTo(w * 0.50f, w * 0.12f)
                    lineTo(w * 0.90f, w * 0.78f)
                    lineTo(w * 0.10f, w * 0.78f)
                    close()
                }
                drawPath(tri, tint, style = Stroke(w * 0.07f))
                line(0.50f, 0.34f, 0.50f, 0.66f)
            }
            TpIcon.Resources -> {
                drawRoundRect(tint, topLeft = Offset(w * 0.22f, w * 0.18f), size = androidx.compose.ui.geometry.Size(w * 0.56f, w * 0.64f), cornerRadius = androidx.compose.ui.geometry.CornerRadius(w * 0.08f), style = Stroke(w * 0.07f))
                line(0.36f, 0.40f, 0.64f, 0.40f)
                line(0.36f, 0.54f, 0.64f, 0.54f)
                line(0.36f, 0.68f, 0.52f, 0.68f)
            }
            TpIcon.Rent -> {
                drawCircle(tint, w * 0.30f, style = Stroke(w * 0.07f))
                line(0.50f, 0.28f, 0.50f, 0.50f)
                line(0.50f, 0.50f, 0.66f, 0.60f)
            }
            TpIcon.Trade -> {
                line(0.18f, 0.36f, 0.82f, 0.36f)
                line(0.64f, 0.20f, 0.82f, 0.36f)
                line(0.64f, 0.52f, 0.82f, 0.36f)
                line(0.18f, 0.68f, 0.82f, 0.68f)
                line(0.18f, 0.68f, 0.36f, 0.52f)
                line(0.18f, 0.68f, 0.36f, 0.84f)
            }
            TpIcon.Bridge -> {
                drawArc(tint, 200f, 140f, false, topLeft = Offset(w * 0.16f, w * 0.28f), size = androidx.compose.ui.geometry.Size(w * 0.68f, w * 0.50f), style = Stroke(w * 0.07f, cap = StrokeCap.Round))
                line(0.22f, 0.62f, 0.78f, 0.62f)
            }
            TpIcon.DApp -> {
                drawCircle(tint, w * 0.32f, style = Stroke(w * 0.07f))
                line(0.18f, 0.50f, 0.82f, 0.50f)
                drawArc(tint, 0f, 360f, false, topLeft = Offset(w * 0.38f, w * 0.18f), size = androidx.compose.ui.geometry.Size(w * 0.24f, w * 0.64f), style = Stroke(w * 0.06f))
            }
            TpIcon.Revoke -> {
                drawArc(tint, 40f, 280f, false, topLeft = Offset(w * 0.18f, w * 0.18f), size = androidx.compose.ui.geometry.Size(w * 0.64f, w * 0.64f), style = Stroke(w * 0.08f, cap = StrokeCap.Round))
                line(0.72f, 0.22f, 0.86f, 0.22f)
                line(0.72f, 0.22f, 0.72f, 0.36f)
            }
            TpIcon.Buy -> {
                val bag = Path().apply {
                    addRoundRect(androidx.compose.ui.geometry.RoundRect(Rect(w * 0.22f, w * 0.36f, w * 0.78f, w * 0.86f), w * 0.08f, w * 0.08f))
                }
                drawPath(bag, tint, style = Stroke(w * 0.07f))
                drawArc(tint, 200f, 140f, false, topLeft = Offset(w * 0.32f, w * 0.16f), size = androidx.compose.ui.geometry.Size(w * 0.36f, w * 0.32f), style = Stroke(w * 0.07f, cap = StrokeCap.Round))
            }
            TpIcon.Scan -> {
                val arm = w * 0.22f
                line(0.18f, 0.18f, 0.18f + arm, 0.18f)
                line(0.18f, 0.18f, 0.18f, 0.18f + arm)
                line(0.82f, 0.18f, 0.82f - arm, 0.18f)
                line(0.82f, 0.18f, 0.82f, 0.18f + arm)
                line(0.18f, 0.82f, 0.18f + arm, 0.82f)
                line(0.18f, 0.82f, 0.18f, 0.82f - arm)
                line(0.82f, 0.82f, 0.82f - arm, 0.82f)
                line(0.82f, 0.82f, 0.82f, 0.82f - arm)
                line(0.30f, 0.50f, 0.70f, 0.50f)
            }
            TpIcon.Copy -> {
                drawRoundRect(tint, Offset(w * 0.30f, w * 0.18f), androidx.compose.ui.geometry.Size(w * 0.46f, w * 0.52f), androidx.compose.ui.geometry.CornerRadius(w * 0.06f), style = Stroke(w * 0.07f))
                drawRoundRect(tint, Offset(w * 0.18f, w * 0.34f), androidx.compose.ui.geometry.Size(w * 0.46f, w * 0.48f), androidx.compose.ui.geometry.CornerRadius(w * 0.06f), style = Stroke(w * 0.07f))
            }
            TpIcon.Bell -> {
                val bell = Path().apply {
                    moveTo(w * 0.50f, w * 0.14f)
                    lineTo(w * 0.72f, w * 0.32f)
                    lineTo(w * 0.72f, w * 0.58f)
                    lineTo(w * 0.82f, w * 0.70f)
                    lineTo(w * 0.18f, w * 0.70f)
                    lineTo(w * 0.28f, w * 0.58f)
                    lineTo(w * 0.28f, w * 0.32f)
                    close()
                }
                drawPath(bell, tint, style = Stroke(w * 0.07f))
                drawArc(tint, 0f, 180f, false, topLeft = Offset(w * 0.40f, w * 0.68f), size = androidx.compose.ui.geometry.Size(w * 0.20f, w * 0.16f), style = Stroke(w * 0.07f))
            }
            TpIcon.WalletCard -> {
                drawRoundRect(tint, Offset(w * 0.14f, w * 0.28f), androidx.compose.ui.geometry.Size(w * 0.72f, w * 0.48f), androidx.compose.ui.geometry.CornerRadius(w * 0.08f), style = Stroke(w * 0.07f))
                line(0.14f, 0.44f, 0.86f, 0.44f)
            }
            TpIcon.Book -> {
                line(0.28f, 0.18f, 0.28f, 0.82f)
                drawArc(tint, 270f, 180f, false, topLeft = Offset(w * 0.28f, w * 0.18f), size = androidx.compose.ui.geometry.Size(w * 0.40f, w * 0.28f), style = Stroke(w * 0.07f))
                drawArc(tint, 270f, 180f, false, topLeft = Offset(w * 0.28f, w * 0.46f), size = androidx.compose.ui.geometry.Size(w * 0.40f, w * 0.28f), style = Stroke(w * 0.07f))
            }
            TpIcon.Globe -> {
                drawCircle(tint, w * 0.32f, style = Stroke(w * 0.07f))
                line(0.18f, 0.50f, 0.82f, 0.50f)
                drawArc(tint, 0f, 360f, false, topLeft = Offset(w * 0.40f, w * 0.18f), size = androidx.compose.ui.geometry.Size(w * 0.20f, w * 0.64f), style = Stroke(w * 0.06f))
            }
            TpIcon.Gear -> {
                drawCircle(tint, w * 0.14f, style = Stroke(w * 0.07f))
                drawCircle(tint, w * 0.32f, style = Stroke(w * 0.07f))
            }
            TpIcon.Chat -> {
                drawRoundRect(tint, Offset(w * 0.16f, w * 0.18f), androidx.compose.ui.geometry.Size(w * 0.68f, w * 0.48f), androidx.compose.ui.geometry.CornerRadius(w * 0.1f), style = Stroke(w * 0.07f))
                line(0.30f, 0.66f, 0.24f, 0.84f)
                line(0.24f, 0.84f, 0.46f, 0.66f)
            }
            TpIcon.Doc -> {
                drawRoundRect(tint, Offset(w * 0.24f, w * 0.14f), androidx.compose.ui.geometry.Size(w * 0.52f, w * 0.72f), androidx.compose.ui.geometry.CornerRadius(w * 0.06f), style = Stroke(w * 0.07f))
                line(0.36f, 0.38f, 0.64f, 0.38f)
                line(0.36f, 0.52f, 0.64f, 0.52f)
                line(0.36f, 0.66f, 0.54f, 0.66f)
            }
            TpIcon.Info -> {
                drawCircle(tint, w * 0.34f, style = Stroke(w * 0.07f))
                line(0.50f, 0.42f, 0.50f, 0.70f)
                drawCircle(tint, w * 0.045f, Offset(w * 0.50f, w * 0.30f))
            }
            TpIcon.Chevron -> line(0.38f, 0.22f, 0.62f, 0.50f).also { line(0.62f, 0.50f, 0.38f, 0.78f) }
            TpIcon.Add -> {
                line(0.50f, 0.22f, 0.50f, 0.78f)
                line(0.22f, 0.50f, 0.78f, 0.50f)
            }
            TpIcon.Back -> {
                line(0.62f, 0.18f, 0.32f, 0.50f)
                line(0.32f, 0.50f, 0.62f, 0.82f)
            }
            TpIcon.Help -> {
                drawCircle(tint, w * 0.34f, style = Stroke(w * 0.07f))
                val q = Path().apply {
                    moveTo(w * 0.38f, w * 0.40f)
                    cubicTo(w * 0.38f, w * 0.28f, w * 0.64f, w * 0.26f, w * 0.62f, w * 0.42f)
                    cubicTo(w * 0.60f, w * 0.52f, w * 0.50f, w * 0.52f, w * 0.50f, w * 0.62f)
                }
                drawPath(q, tint, style = Stroke(w * 0.07f, cap = StrokeCap.Round))
                drawCircle(tint, w * 0.04f, Offset(w * 0.50f, w * 0.74f))
            }
        }
    }
}

enum class TpIcon {
    Transfer, Receive, Activity, Trx, Resources, Rent, Trade, Bridge, DApp, Revoke, Buy,
    Scan, Copy, Bell, WalletCard, Book, Globe, Gear, Chat, Doc, Info, Chevron, Add, Back, Help,
}
