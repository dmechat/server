import { ApiProperty } from "@nestjs/swagger";

export class SignedRequest{
    @ApiProperty()
    signature: string;

    @ApiProperty()
    // Signed message must include the accountId and it must be a record on guests.dmechat
    signedMessage: string;

    @ApiProperty()
    // PublicKey must match the key on record in guests.dmechat
    publicKey: string;
}


export class RegisterGuestAccountRequest extends SignedRequest {
    // decoded signedMessage must be { "accountId": "account.guests.dmechat.testnet" }
}

export class LoginAccountRequest extends SignedRequest {
    // decoded signedMessage must be { "accountId": "account.guests.dmechat.testnet" }
}

export class RegisterGuestAccountResponse {
    @ApiProperty()
    accountId: string
};

export class LoginAccountResponse {
    @ApiProperty()
    refreshToken: string;
    @ApiProperty()
    displayName: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    emailVerified: boolean;
    @ApiProperty()
    uid: string;
    @ApiProperty()
    idToken: string;
}