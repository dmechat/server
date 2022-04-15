const bs58 = require("bs58");
const nacl = require("tweetnacl");

export function verifySignedMessage(publicKey: string, _signedMessage: string, _signature: string) {
    const pk = bs58.decode(publicKey.replace("ed25519:", ""));
    const signedMessage = Buffer.from(_signedMessage, "base64");
    const signature = Buffer.from(_signature, "base64");

    const _originalMessage = nacl.sign.open(signedMessage, pk);
    const verifyResult = nacl.sign.detached.verify(_originalMessage, signature, pk);
    
    const originalMessage = JSON.parse(Buffer.from(_originalMessage).toString("utf-8"));
    console.warn("***** originalMessage must be include a nonce. The nonce must follow a spec****");
    return { verifyResult, originalMessage };
}
