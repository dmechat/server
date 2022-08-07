import { Injectable, CanActivate, ExecutionContext, Logger, LoggerService } from "@nestjs/common";
import { Request } from "express"
import { has } from "lodash";
import { verifySignedMessage } from "src/utils/verifySignedMessage";
import { AuthService } from "./auth.service";

type AuthScheme = "apikey" | "firebase";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private logger: Logger) {

    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        this.logger.debug("request.headers", { headers: request.headers })
        const token = request.headers.authorization || request.headers.idtoken as string;
        this.logger.debug("token", { token })
        const decodedToken = await this.authService.verifyToken(token);
        this.logger.debug("decodedToken", { decodedToken });
        (request as any).session = {
            ...(request as any).session,
            decodedToken, token
        };
        return true;
    }

    // async canActivate(context: ExecutionContext): Promise<boolean> {
    //     const request = context.switchToHttp().getRequest();
    //     const payload = request.body;
    //     this.logger.debug("payload", { payload });
    //     const verifiedBody = verifySignedMessage(payload.publicKey, payload.signedMessage, payload.signature);
    //     this.logger.debug("verifiedBody", { verifiedBody });

    //     (request as any).session = {
    //         ...(request as any).session,
    //         verifiedBody
    //     };
    //     return true;
    // }
}