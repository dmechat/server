import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { FirebaseService } from "src/app.service";
import { AUTHENTICATION_FAILURE, Failure } from "src/models/app.models";

@Injectable()
export class AuthService {
    constructor(private logger: Logger) {

    }

    async verifyToken(token: string): Promise<DecodedIdToken> {
        try{
            return await FirebaseService.instance.auth().verifyIdToken(token)
        }
        catch(error){
            this.logger.error("verifyToken.error", error);
            throw new Failure(error.message, AUTHENTICATION_FAILURE);
        }
    }
}