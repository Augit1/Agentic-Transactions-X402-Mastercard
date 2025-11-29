const { PrivateKey } = require("@bsv/sdk");
const { readFile, writeFile, chmod } = require("fs/promises");
const crypto = require("crypto");

// polyfill required by @bsv/sdk in Node CJS
global.self = { crypto };

async function createKey() {
  try {
    const WIF = await readFile(".wif");
    const key = PrivateKey.fromWif(WIF.toString());
    console.error(
      "You already have a key file (.wif). Delete it manually if you want to regenerate."
    );
    console.log({ address: key.toAddress() });
  } catch (error) {
    const key = PrivateKey.fromRandom();
    const WIF = key.toWif();
    await writeFile(".wif", WIF);
    await chmod(".wif", 0o400);
    console.log({ address: key.toAddress() });
  }
}

createKey();
