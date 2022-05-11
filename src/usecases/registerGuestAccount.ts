import { RegisterGuestAccountRequest } from "src/app.models";
import { Account, Connection, Contract } from "near-api-js";
import { GAS, getAccount, GuestContract, loadStoredAccountCredentials } from "src/utils/near-connection";
import { Logger } from "@nestjs/common";
import { verifySignedMessage } from "src/utils/verifySignedMessage";

export default async function registerGuestAccount(payload: RegisterGuestAccountRequest, logger: Logger) {
    // verify message
    const verifyResult = verifySignedMessage(payload.publicKey, payload.signedMessage, payload.signature);
    logger.debug({
        verifyResult,
    });
    // call add_guest on guests.$CONTRACT_NAME
    const addGuestResult = await addGuestToContract(verifyResult.originalMessage.accountId, payload.publicKey);
    logger.debug({
        addGuestResult
    });
    // const addGuestToFirebaseResult = await addGuestToFirebase(verifyResult.originalMessage.accountId, payload.publicKey, fa);
    return { verifyResult, addGuestResult };
}


async function addGuestToContract(accountId: string, publicKey: string) {
    const credentials = loadStoredAccountCredentials();
    const account = await getAccount();
    const contract = new Contract(account, credentials.account_id, {
        changeMethods: ["add_guest"], viewMethods: []
    }) as GuestContract;
    return await contract.add_guest({ gas: GAS, args: { account_id: accountId, public_key: publicKey } });
}

// async function addGuestToFirebase(accountId: string, publicKey: string, fa: FirebaseService){
//     return await FirebaseService.instance.database().ref("users").child(publicKey).push({
//         accountId
//     });
// }