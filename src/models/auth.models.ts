import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export class AuthSession {
    token: string;
    decodedToken: DecodedIdToken;
}