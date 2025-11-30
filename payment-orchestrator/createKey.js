const { PrivateKey } = require("@bsv/sdk");
const { readFile, writeFile, chmod } = require("fs/promises");
const crypto = require("crypto");
const path = require("path");

// polyfill required by @bsv/sdk in Node CJS
global.self = { crypto };

// Use __dirname to ensure files are in the same folder as this script
const WIF_PATH = path.join(__dirname, ".wif");
const WIF2_PATH = path.join(__dirname, ".wif2");

async function createKey() {
  try {
    const WIF = await readFile(WIF_PATH);
    const key = PrivateKey.fromWif(WIF.toString().trim());
    console.error(
      "You already have a key file (.wif). Delete it manually if you want to regenerate."
    );
    console.log({ address: key.toAddress(), public_key: key.toPublicKey().toString() });
  } catch (error) {
    const key = PrivateKey.fromRandom();
    const WIF = key.toWif();
    await writeFile(WIF_PATH, WIF);
    // Skip chmod on Windows - it doesn't work the same way
    if (process.platform !== 'win32') {
      await chmod(WIF_PATH, 0o400);
    }
    console.log({ address: key.toAddress(), public_key: key.toPublicKey().toString() });
  }
}

createKey();

async function createKey2() {
  try {
    const WIF = await readFile(WIF2_PATH);
    const key = PrivateKey.fromWif(WIF.toString().trim());
    console.error(
      "You already have a key file (.wif2). Delete it manually if you want to regenerate."
    );
    console.log({ address: key.toAddress(), public_key: key.toPublicKey().toString() });
  } catch (error) {
    const key = PrivateKey.fromRandom();
    const WIF = key.toWif();
    await writeFile(WIF2_PATH, WIF);
    // Skip chmod on Windows
    if (process.platform !== 'win32') {
      await chmod(WIF2_PATH, 0o400);
    }
    console.log({ address: key.toAddress(), public_key: key.toPublicKey().toString() });
  }
}

module.exports = {
  createKey2
};