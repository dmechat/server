import { Logger } from "@nestjs/common";
import { Contract } from "near-api-js";
import { LoginAccountRequest, LoginAccountResponse } from "src/app.models";
import { FirebaseService } from "src/app.service";
import { loadStoredAccountCredentials, getAccount, GuestContract, GAS } from "src/utils/near-connection";
import { verifySignedMessage } from "src/utils/verifySignedMessage";

export default async function loginGuest(payload: LoginAccountRequest, logger: Logger): Promise<LoginAccountResponse> {
    // verify incoming message
    const verifyResult = verifySignedMessage(payload.publicKey, payload.signedMessage, payload.signature);

    // get the account from smart contract 
    const guestAccountId = await getGuest(payload.publicKey);
    logger.debug("guestAccountId", { guestAccountId });

    if (guestAccountId != verifyResult.originalMessage.accountId) {
        throw new Error("Unauthorized");
    }

    // generate and send back sign-in token
    return {
        signInToken: await FirebaseService.instance.auth().createCustomToken(guestAccountId)
    };
}

async function getGuest(publicKey: string) {
    const credentials = loadStoredAccountCredentials();
    const account = await getAccount();
    const contract = new Contract(account, credentials.account_id, {
        changeMethods: [], viewMethods: ["get_guest"]
    }) as GuestContract;
    return await contract.get_guest({ public_key: publicKey } as any);
}