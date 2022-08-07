import { ApiProperty } from "@nestjs/swagger";

export class SignedRequest {
    @ApiProperty()
    signature: string;

    @ApiProperty()
    // Signed message must include the accountId and it must be a record on guests.dmechat
    signedMessage: string;

    @ApiProperty()
    // PublicKey must match the key on record in guests.dmechat
    publicKey: string;
}

console.warn("***** signedMessage must be include a nonce. The nonce must follow a spec****");
export class RegisterGuestAccountRequest extends SignedRequest {
    // decoded signedMessage must be { "accountId": "account.guests.dmechat.testnet", "nonce": number }
}

export class LoginAccountRequest extends SignedRequest {
    // decoded signedMessage must be { "accountId": "account.guests.dmechat.testnet", "nonce": number }
}

export class RegisterGuestAccountResponse {
    @ApiProperty()
    accountId: string
};

export class LoginAccountResponse {
    @ApiProperty()
    signInToken: string;
}

export class User {
    @ApiProperty()
    accountName: string;
    @ApiProperty()
    publicKey: string;
}

export const FAILURE = "Failure";
export const NETWORK_FAILURE = "NetworkFailure";
export const AUTHENTICATION_FAILURE = "AuthenticationFailure";
export const NOT_FOUND_FAILURE = "NotFoundFailure";
export const NOT_AUTHORIZED_FAILURE = "NotAuthorizedFailure";
export const MISSING_ARGUMENT_FAILURE = "MissingArgumentFailure";
export const BAD_REQUEST_FAILURE = "BadRequestFailure";
export const VALIDATION_FAILURE = "ValidationFailure";
export const SERVER_FAILURE = "ServerFailure";
export const SERVICE_UNAVAILABLE_FAILURE = "ServiceUnavailableFailure";

export class Failure extends Error {
    constructor(public message: string, public type: string = FAILURE) {
        super(message);
    }
    static parse(error: any): Failure {
        if (error.type) {
            return error as Failure;
        }
        else if (error.message && error.message.includes("NotFound")) {
            return new Failure(error.message, NOT_FOUND_FAILURE);
        }
        else if (error.message && error.message.includes(VALIDATION_FAILURE)) {
            return new Failure(error.message, BAD_REQUEST_FAILURE);
        }
        else if (error.message && error.message.includes("verifyIdToken")) {
            return new Failure("IdToken is missing in the headers", NOT_AUTHORIZED_FAILURE);
        }
        return new Failure(error.message);
    }
}
export const API_UNAUTHORIZED_RESPONSE = {
    schema: {
        example: {
            "statusCode": 401,
            "timestamp": "2021-03-27T15:09:35.731Z",
            "path": "end-point-path",
            "name": "string",
            "message": "string",
            "type": NOT_AUTHORIZED_FAILURE
        }
    }
};
export const API_BAD_REQUEST_RESPONSE = {
    schema: {
        example: {
            "statusCode": 400,
            "timestamp": "2021-03-27T15:09:35.731Z",
            "path": "end-point-path",
            "name": "string",
            "message": "string",
            "type": BAD_REQUEST_FAILURE
        }
    }
};
export const API_INTERNAL_SERVER_ERROR_RESPONSE = {
    schema: {
        example: {
            "statusCode": 500,
            "timestamp": "2021-03-27T15:09:35.731Z",
            "path": "end-point-path",
            "name": "string",
            "message": "string",
            "type": SERVER_FAILURE
        }
    }
};
export const API_SERVICE_UNAVAILABLE_RESPONSE = {
    schema: {
        example: {
            "statusCode": 503,
            "timestamp": "2021-03-27T15:09:35.731Z",
            "path": "end-point-path",
            "name": "string",
            "message": "string",
            "type": SERVICE_UNAVAILABLE_FAILURE
        }
    }
};

export const API_NOT_FOUND_RESPONSE = {
    schema: {
        example: {
            "statusCode": 503,
            "timestamp": "2021-03-27T15:09:35.731Z",
            "path": "end-point-path",
            "name": "string",
            "message": "string",
            "type": NOT_FOUND_FAILURE
        }
    }
};