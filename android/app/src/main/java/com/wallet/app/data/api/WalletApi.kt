package com.wallet.app.data.api

import com.wallet.app.data.model.BootstrapData
import com.wallet.app.data.model.RiskAddress
import com.wallet.app.data.model.SyncWalletRequest
import com.wallet.app.data.model.SyncWalletResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface WalletApi {
    @GET("public/bootstrap")
    suspend fun bootstrap(
        @Query("locale") locale: String = "ko",
        @Query("platform") platform: String = "android",
    ): BootstrapData

    @GET("public/risk-check")
    suspend fun riskCheck(
        @Query("address") address: String,
        @Query("chain") chain: String? = null,
    ): RiskAddress?

    @POST("public/wallet/sync")
    suspend fun syncWallet(@Body body: SyncWalletRequest): SyncWalletResponse
}
