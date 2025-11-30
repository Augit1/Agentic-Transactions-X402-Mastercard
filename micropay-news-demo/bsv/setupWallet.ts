import crypto from "crypto";
(globalThis as any).crypto = crypto;
import { writeFileSync, existsSync } from 'fs'
import { PrivateKey, WalletClient, WalletProtocol, PublicKey, P2PKH, KeyDeriver, Utils } from '@bsv/sdk'
import { Wallet, WalletStorageManager, WalletSigner, Services, StorageClient } from '@bsv/wallet-toolbox'
import * as dotenv from 'dotenv'

const AMOUNT = 1000
const NETWORK = 'main'
const STORAGE_URL = 'https://storage.babbage.systems'
const brc29ProtocolID: WalletProtocol = [2, '3241645161d8']

async function getOrCreateBackendWallet(): Promise<{ wallet: Wallet, publicKey: PublicKey, address: string, isNew: boolean }> {
  let privateKey: PrivateKey
  let isNew = false

  // Check if .env file exists and has a private key
  if (existsSync('.env')) {
    dotenv.config()
    const existingKey = process.env.PRIVATE_KEY
    if (existingKey) {
      console.log('Found existing wallet in .env')
      privateKey = PrivateKey.fromHex(existingKey)
    } else {
      console.log('No private key in .env, creating new wallet')
      privateKey = PrivateKey.fromRandom()
      writeFileSync('.env', `PRIVATE_KEY=${privateKey.toHex()}\nSTORAGE_URL=${STORAGE_URL}\nNETWORK=${NETWORK}\n`)
      isNew = true
    }
  } else {
    console.log('No .env file found, creating new wallet')
    privateKey = PrivateKey.fromRandom()
    writeFileSync('.env', `PRIVATE_KEY=${privateKey.toHex()}\nSTORAGE_URL=${STORAGE_URL}\nNETWORK=${NETWORK}\n`)
    isNew = true
  }

  const publicKey = privateKey.toPublicKey()
  const address = publicKey.toAddress()
  const keyDeriver = new KeyDeriver(privateKey)
  const storageManager = new WalletStorageManager(keyDeriver.identityKey)
  const signer = new WalletSigner(NETWORK, keyDeriver, storageManager)
  const services = new Services(NETWORK)
  const wallet = new Wallet(signer, services)
  const client = new StorageClient(wallet, STORAGE_URL)
  await client.makeAvailable()
  await storageManager.addWalletStorageProvider(client)

  return { wallet, publicKey, address, isNew }
}

async function fundWallet() {
  const { wallet, publicKey, address, isNew } = await getOrCreateBackendWallet()

  if (isNew) {
    console.log(`Created new backend wallet with address: ${address}`)
  } else {
    console.log(`Using existing backend wallet with address: ${address}`)
  }

  const localWallet = new WalletClient('json-api', 'localhost')
  await localWallet.connectToSubstrate()
  const derivationPrefix = Utils.toBase64(Utils.toArray('keyID', 'utf8'))
  const derivationSuffix = Utils.toBase64(Utils.toArray('somethingIwontforget', 'utf8'))
  const { publicKey: payer } = await localWallet.getPublicKey({ identityKey: true })
  console.log('Payer identity:', payer)

  const payee = publicKey.toString()
  console.log('Payee identity:', payee)

  const { publicKey: derivedPublicKey } = await localWallet.getPublicKey({
    counterparty: payee,
    protocolID: brc29ProtocolID,
    keyID: `${derivationPrefix} ${derivationSuffix}`
  })

  const lockingScript = new P2PKH().lock(PublicKey.fromString(derivedPublicKey).toAddress()).toHex()

  console.log(`Funding backend wallet with ${AMOUNT} satoshis...`)

  const transaction = await localWallet.createAction({
    outputs: [{
      lockingScript,
      satoshis: AMOUNT,
      outputDescription: 'Fund backend wallet'
    }],
    description: 'Funding backend wallet with 10000 sats',
    options: {
      randomizeOutputs: false
    }
  })

  console.log('Transaction created:', transaction.txid)

  if (!transaction.tx) throw new Error('No transaction created')

  const atomicBEEF = transaction.tx
  await wallet.internalizeAction({
    tx: atomicBEEF,
    outputs: [{
      outputIndex: 0,
      protocol: 'wallet payment',
      paymentRemittance: {
        derivationPrefix,
        derivationSuffix,
        senderIdentityKey: payer
      }
    }],
    description: 'Incoming wallet funding'
  })
  console.log(`\nSuccess! Backend wallet funded with ${AMOUNT} satoshis`)
  console.log(`Address: ${address}`)
  console.log(`TXID: ${transaction.txid}`)
  console.log(`https://whatsonchain.com/tx/${transaction.txid}`)
}

fundWallet().catch(console.error)
