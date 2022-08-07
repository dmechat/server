import { Injectable, Logger, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { FirebaseService } from "src/app.service";
import { AUTHENTICATION_FAILURE, Failure } from "src/models/app.models";

@Injectable()
export class AuthService {
    constructor(private logger: Logger) {

    }

    verifyToken(token: string): Promise<DecodedIdToken> {
        return new Promise((resolve, reject) => {
            FirebaseService.instance.auth().verifyIdToken(token)
                .then(res => {
                    this.logger.debug(" Resolved");
                    resolve(res);
                })
                .catch(err => {
                    this.logger.error(err);
                    reject(new Failure(err.message, AUTHENTICATION_FAILURE))
                });
        });
    }
}