#!/usr/bin/env node

const assert = require("assert")

const {
    Wallet,
    Contract,
    utils: { formatEther },
    providers: { JsonRpcProvider },
} = require("ethers")

function error(e) {
    console.error("streamr-ganache not started succesfully!")
    console.error(e.stack)
    process.exit(1)
}

const tokenAddress = "0xbAA81A0179015bE47Ad439566374F2Bae098686F"
const TokenJson = require("./TestToken.json")

const testKeys = [
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
    "0x1000000000000000000000000000000000000000000000000000000000000000",
    "0x1000000000000000000000000000000000000000000000000000000000000009",
    "0x1000000000000000000000000000000000000000000000000000000000000099",
    "0x1000000000000000000000000000000000000000000000000000000000000999",
    "0x1000000000000000000000000000000000000000000000000000000000009999",
]

const provider = new JsonRpcProvider("http://localhost:8545")
const wallets = testKeys.map(key => new Wallet(key, provider))

async function runTests() {
    for (const wallet of wallets.slice(1, 10)) {
        const ethBalance = await wallet.getBalance()
        assert.strictEqual(ethBalance.toString(), "100000000000000000000")

        const token = new Contract(tokenAddress, TokenJson.abi, wallet)
        const tokenBalance = await token.balanceOf(wallet.address)
        assert.strictEqual(tokenBalance.toString(), "1000000000000000000000000")
    }

    /* the following snippet is from index.js, TODO: make it work here
    const pid = '0x3c4a76bccee345e9bed6ae4182c7926d5e158ab016f74032ae0894adf9cc75bd'
    log("make test product")
    await market.createProduct(pid, "test", wallet.address, parseEther(".0001"), 0, 1)
    log("buy test product mkt")
    await token.approve(market.address, parseEther("1"))
    await market.buy(pid, 11, {gasLimit: 6000000} )

    log("test UA")
    let convrate = await uniswapAdaptor.getConversionRate(token.address, token2.address, parseEther("1") )
    log(`convrate ${convrate}`)
    log("test uniswapex")
    await datatokenExchange.ethToTokenTransferInput(parseEther("1"), futureTime, wallet.address, {gasLimit: 6000000, value: parseEther("1")})

    log("buyWithETH")
    await uniswapAdaptor.buyWithETH(pid, 11, 86400, {gasLimit: 6000000, value: parseEther("1")} )
    */

    // TODO: test that some E&E test-products are in the marketplace

}

runTests().catch(error)

