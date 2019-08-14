const fetch = require("node-fetch")

const {
    Contract,
    ContractFactory,
    utils,
    Wallet,
    providers: { Web3Provider }
} = require("ethers")
const ganache = require("ganache-core")

const TokenJson = require("./TestToken.json")
const MarketplaceJson = require("./Marketplace.json")

const port = process.env.GANACHE_PORT || 8545
const streamrUrl = process.env.EE_URL || "http://localhost:8081/streamr-core" // production: "https://www.streamr.com"
const log = process.env.QUIET ? (() => {}) : console.log

// private keys corresponding to "testrpc" mnemonic
const privateKeys = [
    "0x5e98cce00cff5dea6b454889f359a4ec06b9fa6b88e9d69b86de8e1c81887da0",
    "0xe5af7834455b7239881b85be89d905d6881dcb4751063897f12be1b0dd546bdb",
    "0x4059de411f15511a85ce332e7a428f36492ab4e87c7830099dadbf130f1896ae",
    "0x633a182fb8975f22aaad41e9008cb49a432e9fdfef37f151e9e7c54e96258ef9",
    "0x957a8212980a9a39bf7c03dcbeea3c722d66f2b359c669feceb0e3ba8209a297",
    "0xfe1d528b7e204a5bdfb7668a1ed3adfee45b4b96960a175c9ef0ad16dd58d728",
    "0xd7609ae3a29375768fac8bc0f8c2f6ac81c5f2ffca2b981e6cf15460f01efe14",
    "0xb1abdb742d3924a45b0a54f780f0f21b9d9283b231a0a0b35ce5e455fa5375e7",
    "0x2cd9855d17e01ce041953829398af7e48b24ece04ff9d0e183414de54dc52285",
    "0x2c326a4c139eced39709b235fffa1fde7c252f3f7b505103f7b251586c35d543",
]

log("Starting Ganache")
const server = ganache.server({
    mnemonic: "testrpc",
    logger: { log },
})
server.listen(port, start)

async function start(err, blockchain) {
    // wait until ganache is up and ethers.js ready
    const provider = new Web3Provider(server.provider)
    await provider.getNetwork()
    const wallet = new Wallet(privateKeys[0], provider)

    log(`Deploying test token from ${wallet.address}`)
    const tokenDeployer = new ContractFactory(TokenJson.abi, TokenJson.bytecode, wallet)
    const tokenDeployTx = await tokenDeployer.deploy("Test token", "\ud83e\udd84")
    const token = await tokenDeployTx.deployed()

    log(`Deploying Marketplace contract from ${wallet.address}`)
    const marketDeployer = new ContractFactory(MarketplaceJson.abi, MarketplaceJson.bytecode, wallet)
    const marketDeployTx = await marketDeployer.deploy(token.address, wallet.address)
    const market = await marketDeployTx.deployed()

    log("Getting products from E&E")
    const products = await (await fetch(`${streamrUrl}/api/v1/products?publicAccess=true`)).json()

    log(`Adding ${products.length} products to Marketplace`)
    for (p of products) {
        // free products not supported
        if (p.pricePerSecond == 0) { continue }

        const tx = await market.createProduct(`0x${p.id}`, p.name, wallet.address, p.pricePerSecond, p.priceCurrency == "DATA" ? 0 : 1, p.minimumSubscriptionInSeconds)
        await tx.wait(1)
        if (p.state == "NOT_DEPLOYED") {
            const tx2 = await market.deleteProduct(`0x${p.id}`)
            await tx2.wait(1)
        }
    }

    log("Setting blockTime to 1 for more realistic simulation (instead of instant mining)")
    blockchain.blockTime = 1
    blockchain.is_mining_on_interval = true
    blockchain.mineOnInterval()
}
