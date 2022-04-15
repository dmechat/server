import { connect, ConnectConfig, Contract, KeyPair, keyStores } from "near-api-js";

type StoredAccountCredentials = {
    account_id: string;
    public_key: string;
    private_key: string;
}

type ChangeMethodArgs = {
    gas?: string,
    amount?: string,
    callbackUrl?: string,
    meta?: string
};

export type GuestContract = Contract & {
    add_guest: (args: ChangeMethodArgs & { args: { account_id, public_key } }) => Promise<string>;
}

export function loadStoredAccountCredentials(): StoredAccountCredentials {
    return JSON.parse(process.env.ACCOUNT_CREDENTIALS);
}

export async function getAccount() {
    const near = await nearConnection();
    const credentials: StoredAccountCredentials = loadStoredAccountCredentials();
    return await near.account(credentials.account_id);
}

export async function nearConnection() {
    const networkId = process.env.NETWORK_ID;
    const keyStore = new keyStores.InMemoryKeyStore();
    const credentials: StoredAccountCredentials = loadStoredAccountCredentials();
    const keyPair = KeyPair.fromString(credentials.private_key);
    await keyStore.setKey(networkId, credentials.account_id, keyPair);
    const config: ConnectConfig = {
        networkId,
        keyStore,
        nodeUrl: `https://rpc.${networkId}.near.org`,
        walletUrl: `https://wallet.${networkId}.near.org`,
        helperUrl: `https://helper.${networkId}.near.org`,
        headers: {}
    };
    return await connect(config);
}

export const GAS = "200000000000000";