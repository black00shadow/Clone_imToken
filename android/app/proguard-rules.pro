-keep class com.reown.** { *; }
-keep class com.walletconnect.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
