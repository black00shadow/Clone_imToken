package com.wallet.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wallet.app.ui.components.AppIcons
import com.wallet.app.ui.theme.Background
import com.wallet.app.ui.theme.Manrope
import com.wallet.app.ui.theme.Primary
import com.wallet.app.ui.theme.TextSecondary
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.wallet.app.data.local.SecurePrefs
import com.wallet.app.data.local.TxHistoryStore
import com.wallet.app.ui.browser.BrowserScreen
import com.wallet.app.ui.history.HistoryScreen
import com.wallet.app.ui.market.MarketScreen
import com.wallet.app.ui.onboarding.CreateWalletScreen
import com.wallet.app.ui.onboarding.ImportWalletScreen
import com.wallet.app.ui.onboarding.PinSetupScreen
import com.wallet.app.ui.onboarding.WelcomeScreen
import com.wallet.app.ui.profile.ProfileScreen
import com.wallet.app.ui.receive.ReceiveScreen
import com.wallet.app.ui.send.SendScreen
import com.wallet.app.ui.tools.AddressBookScreen
import com.wallet.app.ui.tools.NetworksScreen
import com.wallet.app.ui.tools.NftScreen
import com.wallet.app.ui.tools.ScanScreen
import com.wallet.app.ui.tools.SettingsScreen
import com.wallet.app.ui.unlock.UnlockScreen
import com.wallet.app.ui.wallet.WalletScreen
import com.wallet.app.ui.walletconnect.WalletConnectScreen
import com.wallet.app.viewmodel.WalletViewModel
import com.wallet.app.viewmodel.WalletViewModelFactory

sealed class Route(val route: String) {
    data object Welcome : Route("welcome")
    data object Create : Route("create")
    data object Import : Route("import")
    data object PinSetup : Route("pin_setup")
    data object Unlock : Route("unlock")
    data object Main : Route("main")
}

private object SubRoute {
    const val SEND = "send/{chainId}/{tokenId}"
    const val RECEIVE = "receive/{chainId}"
    const val HISTORY = "history"
    const val WALLET_CONNECT = "walletconnect"
    const val NETWORKS = "networks"
    const val ADDRESS_BOOK = "address_book"
    const val NFT = "nft"
    const val SCAN = "scan"
    const val SETTINGS = "settings"

    fun send(chainId: String, tokenId: String) = "send/$chainId/$tokenId"
    fun receive(chainId: String) = "receive/$chainId"
}

private sealed class Tab(val route: String, val label: String, val icon: ImageVector) {
    data object Wallet : Tab("tab_wallet", "Wallet", AppIcons.Wallet)
    data object Market : Tab("tab_market", "Market", AppIcons.Market)
    data object Browser : Tab("tab_browser", "Browser", AppIcons.Browser)
    data object Profile : Tab("tab_profile", "Me", AppIcons.Me)
}

@Composable
fun WalletNavHost(securePrefs: SecurePrefs, txHistoryStore: TxHistoryStore) {
    val navController = rememberNavController()
    val factory = WalletViewModelFactory(securePrefs, txHistoryStore)
    val start = when {
        !securePrefs.hasWallet() -> Route.Welcome.route
        !securePrefs.hasPin() -> Route.PinSetup.route
        !securePrefs.isUnlocked -> Route.Unlock.route
        else -> Route.Main.route
    }

    NavHost(navController = navController, startDestination = start) {
        composable(Route.Welcome.route) {
            WelcomeScreen(
                onCreate = { navController.navigate(Route.Create.route) },
                onImport = { navController.navigate(Route.Import.route) },
            )
        }
        composable(Route.Create.route) {
            val vm: WalletViewModel = viewModel(factory = factory)
            CreateWalletScreen(
                onBack = { navController.popBackStack() },
                onCreated = { navController.navigate(Route.PinSetup.route) { popUpTo(Route.Welcome.route) { inclusive = true } } },
                onCreate = { vm.createWallet() },
            )
        }
        composable(Route.Import.route) {
            val vm: WalletViewModel = viewModel(factory = factory)
            ImportWalletScreen(
                onBack = { navController.popBackStack() },
                onImported = { navController.navigate(Route.PinSetup.route) { popUpTo(Route.Welcome.route) { inclusive = true } } },
                onImport = vm::importWallet,
            )
        }
        composable(Route.PinSetup.route) {
            val vm: WalletViewModel = viewModel(factory = factory)
            PinSetupScreen(
                onComplete = { pin ->
                    vm.setPin(pin)
                    vm.unlock()
                    navController.navigate(Route.Main.route) { popUpTo(0) { inclusive = true } }
                },
            )
        }
        composable(Route.Unlock.route) {
            val vm: WalletViewModel = viewModel(factory = factory)
            UnlockScreen(
                onUnlocked = {
                    vm.unlock()
                    navController.navigate(Route.Main.route) { popUpTo(0) { inclusive = true } }
                },
                verifyPin = vm::verifyPin,
            )
        }
        composable(Route.Main.route) {
            MainTabs(
                securePrefs = securePrefs,
                txHistoryStore = txHistoryStore,
                onLock = {
                    securePrefs.isUnlocked = false
                    navController.navigate(Route.Unlock.route) { popUpTo(0) { inclusive = true } }
                },
            )
        }
    }
}

@Composable
private fun MainTabs(securePrefs: SecurePrefs, txHistoryStore: TxHistoryStore, onLock: () -> Unit) {
    val tabs = listOf(Tab.Wallet, Tab.Market, Tab.Browser, Tab.Profile)
    val navController = rememberNavController()
    val factory = WalletViewModelFactory(securePrefs, txHistoryStore)
    val vm: WalletViewModel = viewModel(factory = factory)
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route ?: Tab.Wallet.route
    val showBottomBar = current.startsWith("tab_")

    Scaffold(
        containerColor = Background,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(containerColor = Color.White) {
                    tabs.forEach { tab ->
                        val selected = current == tab.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    tab.icon,
                                    contentDescription = tab.label,
                                    modifier = Modifier.size(22.dp),
                                    tint = if (selected) Primary else TextSecondary,
                                )
                            },
                            label = {
                                Text(
                                    tab.label,
                                    fontFamily = Manrope,
                                    fontSize = 11.sp,
                                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Primary,
                                selectedTextColor = Primary,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary,
                                indicatorColor = Color(0xFFEBF5FF),
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Tab.Wallet.route,
            modifier = Modifier.padding(padding),
        ) {
            composable(Tab.Wallet.route) {
                WalletScreen(
                    onBrowser = {
                        navController.navigate(Tab.Browser.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    vm = vm,
                    onSend = { chainId, tokenId ->
                        navController.navigate(SubRoute.send(chainId, tokenId ?: "native"))
                    },
                    onReceive = { chainId -> navController.navigate(SubRoute.receive(chainId)) },
                    onHistory = { navController.navigate(SubRoute.HISTORY) },
                    onWalletConnect = { navController.navigate(SubRoute.WALLET_CONNECT) },
                    onMarket = {
                        navController.navigate(Tab.Market.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
            composable(Tab.Market.route) { MarketScreen(vm) }
            composable(Tab.Browser.route) { BrowserScreen(vm) }
            composable(Tab.Profile.route) {
                ProfileScreen(
                    vm = vm,
                    onLock = onLock,
                    onHistory = { navController.navigate(SubRoute.HISTORY) },
                    onWalletConnect = { navController.navigate(SubRoute.WALLET_CONNECT) },
                    onManage = { navController.navigate(SubRoute.ADDRESS_BOOK) },
                    onNetworks = { navController.navigate(SubRoute.NETWORKS) },
                    onNft = { navController.navigate(SubRoute.NFT) },
                    onScan = { navController.navigate(SubRoute.SCAN) },
                    onSettings = { navController.navigate(SubRoute.SETTINGS) },
                )
            }
            composable(SubRoute.SEND) { entry ->
                val chainId = entry.arguments?.getString("chainId") ?: return@composable
                val tokenId = entry.arguments?.getString("tokenId")?.takeIf { it != "native" }
                val chain = vm.state.value.bootstrap?.chains?.find { it.id == chainId }
                val token = chain?.tokens?.find { it.id == tokenId }
                val params = vm.buildSendParams(chainId, token) ?: return@composable
                SendScreen(params = params, vm = vm, onBack = { navController.popBackStack() })
            }
            composable(SubRoute.RECEIVE) { entry ->
                val chainId = entry.arguments?.getString("chainId") ?: return@composable
                val chain = vm.state.value.bootstrap?.chains?.find { it.id == chainId }
                val address = vm.receiveAddress(chainId) ?: return@composable
                ReceiveScreen(
                    symbol = chain?.symbol ?: "",
                    chainName = chain?.name ?: "",
                    address = address,
                    tokens = chain?.tokens.orEmpty(),
                    onBack = { navController.popBackStack() },
                )
            }
            composable(SubRoute.HISTORY) {
                HistoryScreen(vm = vm, onBack = { navController.popBackStack() })
            }
            composable(SubRoute.NETWORKS) { NetworksScreen(vm, onBack = { navController.popBackStack() }) }
            composable(SubRoute.ADDRESS_BOOK) { AddressBookScreen(onBack = { navController.popBackStack() }) }
            composable(SubRoute.NFT) { NftScreen(onBack = { navController.popBackStack() }) }
            composable(SubRoute.SCAN) {
                ScanScreen(onBack = { navController.popBackStack() }, onOpenWalletConnect = { navController.navigate(SubRoute.WALLET_CONNECT) })
            }
            composable(SubRoute.SETTINGS) {
                SettingsScreen(onBack = { navController.popBackStack() }, onLock = onLock)
            }
            composable(SubRoute.WALLET_CONNECT) {
                WalletConnectScreen(vm = vm, onBack = { navController.popBackStack() })
            }
        }
    }
}
