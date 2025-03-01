'use strict'

const secp256k1 = require('secp256k1')
const multihashing = require('multihashing-async')

const HASH_ALGORITHM = 'sha2-256'

module.exports = (randomBytes) => {
  const privateKeyLength = 32

  function generateKey () {
    let privateKey
    do {
      privateKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privateKey))
    return privateKey
  }

  async function hashAndSign (key, msg) {
    const digest = await multihashing.digest(msg, HASH_ALGORITHM)
    const sig = secp256k1.sign(digest, key)
    return secp256k1.signatureExport(sig.signature)
  }

  async function hashAndVerify (key, sig, msg) {
    const digest = await multihashing.digest(msg, HASH_ALGORITHM)
    sig = secp256k1.signatureImport(sig)
    return secp256k1.verify(digest, sig, key)
  }

  function compressPublicKey (key) {
    if (!secp256k1.publicKeyVerify(key)) {
      throw new Error('Invalid public key')
    }
    return secp256k1.publicKeyConvert(key, true)
  }

  function decompressPublicKey (key) {
    return secp256k1.publicKeyConvert(key, false)
  }

  function validatePrivateKey (key) {
    if (!secp256k1.privateKeyVerify(key)) {
      throw new Error('Invalid private key')
    }
  }

  function validatePublicKey (key) {
    if (!secp256k1.publicKeyVerify(key)) {
      throw new Error('Invalid public key')
    }
  }

  function computePublicKey (privateKey) {
    validatePrivateKey(privateKey)
    return secp256k1.publicKeyCreate(privateKey)
  }

  return {
    generateKey,
    privateKeyLength,
    hashAndSign,
    hashAndVerify,
    compressPublicKey,
    decompressPublicKey,
    validatePrivateKey,
    validatePublicKey,
    computePublicKey
  }
}
