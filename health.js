const {
    Wallet,
    Contract,
    utils: { formatEther, getAddress },
    providers: { JsonRpcProvider },
} = require("ethers")

const port = process.env.GANACHE_PORT || 8545
const network_id = process.env.NETWORK_ID || "1111" // production: "1". Underscore in name because ganache.server wants it
const tokenAddress = process.env.TOKEN_ADDRESS || "0xbAA81A0179015bE47Ad439566374F2Bae098686F"

/**
 * Validate addresses from user input
 * @returns {EthereumAddress} checksum-formatted by ethers.js
 **/
function throwIfBadAddress(address, variableDescription) {
    try {
        return getAddress(address)
    } catch (e) {
        throw new Error(`${variableDescription || "Error"}: Bad Ethereum address ${address}`)
    }
}

/**
 * Validate Ethereum contract addresses from user input
 * @returns {EthereumAddress} checksum-formatted by ethers.js
 **/
async function throwIfNotContract(eth, address, variableDescription) {
    const addr = throwIfBadAddress(address, variableDescription)
    if (await eth.getCode(address) === "0x") {
        throw new Error(`${variableDescription || "Error"}: No contract at ${address}`)
    }
    return addr
}

const provider = new JsonRpcProvider(`http://localhost:${port}`)

throwIfNotContract(provider, tokenAddress, "Token Address").then(() => {
    process.exitCode = 0
    console.log('OK')
}, (err) => {
    console.error(err)
    process.exitCode = 1
})
