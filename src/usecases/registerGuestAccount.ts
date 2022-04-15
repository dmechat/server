import { RegisterGuestAccountRequest } from "src/app.models";
import { Account, Connection, Contract } from "near-api-js";
import { GAS, getAccount, GuestContract, loadStoredAccountCredentials } from "src/utils/near-connection";
import { Logger } from "@nestjs/common";
const bs58 = require("bs58");
const nacl = require("tweetnacl");

export default async function registerGuestAccount(payload: RegisterGuestAccountRequest, logger: Logger) {
    // verify message
    const verifyResult = verify(payload.publicKey, payload.signedMessage, payload.signature);
    logger.debug({
        verifyResult,
    });
    // call add_guest on guests.$CONTRACT_NAME
    const addGuestResult = await addGuest(verifyResult.originalMessage.accountId, payload.publicKey);
    logger.debug({
        addGuestResult
    });
    return { verifyResult, addGuestResult };
}

function verify(publicKey: string, _signedMessage: string, _signature: string) {
    const pk = bs58.decode(publicKey.replace("ed25519:", ""));
    const signedMessage = Buffer.from(_signedMessage, "base64");
    const signature = Buffer.from(_signature, "base64");

    const _originalMessage = nacl.sign.open(signedMessage, pk);
    const verifyResult = nacl.sign.detached.verify(_originalMessage, signature, pk);
    
    const originalMessage = JSON.parse(Buffer.from(_originalMessage).toString("utf-8"));
    return { verifyResult, originalMessage };
}

async function addGuest(accountId: string, publicKey: string) {
    const credentials = loadStoredAccountCredentials();
    const account = await getAccount();
    const contract = new Contract(account, credentials.account_id, {
        changeMethods: ["add_guest"], viewMethods: []
    }) as GuestContract;
    return await contract.add_guest({ gas: GAS, args: { account_id: accountId, public_key: publicKey } });
}