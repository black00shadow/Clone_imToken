package com.wallet.app.crypto

import com.wallet.app.crypto.ChainWalletRegistry
import org.web3j.crypto.Bip32ECKeyPair
import org.web3j.crypto.Credentials
import org.web3j.crypto.MnemonicUtils
import org.web3j.utils.Numeric

object WalletDeriver {
    fun deriveAccount(mnemonic: String, index: Int): com.wallet.app.data.model.WalletAccount {
        val normalized = mnemonic.trim().lowercase()
        val evmCredentials = deriveEvmCredentials(normalized, index)
        val evmPrivateKey = Numeric.toHexStringNoPrefix(evmCredentials.ecKeyPair.privateKey)
        val tron = TronWallet.derive(normalized, index)
        return com.wallet.app.data.model.WalletAccount(
            index = index,
            name = "Account ${index + 1}",
            evmAddress = evmCredentials.address,
            evmPrivateKey = evmPrivateKey,
            btcAddress = BtcWallet.deriveAddress(normalized, index),
            tronAddress = tron.address,
            tronPrivateKey = tron.privateKey,
            tonAddress = ChainWalletRegistry.deriveAddress(normalized, index, tonChain()),
            cosmosAddress = ChainWalletRegistry.deriveAddress(normalized, index, cosmosChain()),
        )
    }

    private fun deriveEvmCredentials(mnemonic: String, index: Int): Credentials {
        val seed = MnemonicUtils.generateSeed(mnemonic, "")
        val master = Bip32ECKeyPair.generateKeyPair(seed)
        val path = intArrayOf(
            hardened(44),
            hardened(60),
            hardened(0),
            0,
            index,
        )
        val child = Bip32ECKeyPair.deriveKeyPair(master, path)
        return Credentials.create(child)
    }

    private fun deriveCredentialsAtCoin(mnemonic: String, coinType: Int, index: Int): Credentials {
        val seed = MnemonicUtils.generateSeed(mnemonic, "")
        val master = Bip32ECKeyPair.generateKeyPair(seed)
        val path = intArrayOf(hardened(44), hardened(coinType), hardened(0), 0, index)
        return Credentials.create(Bip32ECKeyPair.deriveKeyPair(master, path))
    }

    fun deriveCredentialsForCoin(mnemonic: String, coinType: Int, index: Int): Credentials =
        deriveCredentialsAtCoin(mnemonic, coinType, index)

    private fun hardened(value: Int): Int = value or Bip32ECKeyPair.HARDENED_BIT

    private fun tonChain() = com.wallet.app.data.model.Chain(
        id = "ton", name = "TON", symbol = "TON", chainId = null,
        rpcUrl = "https://toncenter.com/api/v2/jsonRPC", family = "ton", coinType = 607, isEvm = false,
    )

    private fun cosmosChain() = com.wallet.app.data.model.Chain(
        id = "atom", name = "Cosmos Hub", symbol = "ATOM", chainId = null,
        rpcUrl = "https://cosmos-rest.publicnode.com", family = "cosmos", coinType = 118,
        bech32Prefix = "cosmos", isEvm = false,
    )
}
