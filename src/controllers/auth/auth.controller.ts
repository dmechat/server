import { Body, Controller, Get, Logger, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiSecurity, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { getApp } from 'firebase/app';
import { FirebaseService } from 'src/app.service';
import { RegisterGuestAccountResponse, RegisterGuestAccountRequest, LoginAccountRequest, LoginAccountResponse, API_BAD_REQUEST_RESPONSE, API_INTERNAL_SERVER_ERROR_RESPONSE, API_SERVICE_UNAVAILABLE_RESPONSE, API_UNAUTHORIZED_RESPONSE } from 'src/models/app.models';
import loginGuestHandler from 'src/usecases/loginGuest';
import registerGuestAccountHandler from 'src/usecases/registerGuestAccount';
import { AuthGuard } from './auth.guard';


import { signInWithCustomToken, getAuth } from "firebase/auth"

@ApiTags("auth")
@Controller("auth")
@ApiBadRequestResponse(API_BAD_REQUEST_RESPONSE)
@ApiUnauthorizedResponse(API_UNAUTHORIZED_RESPONSE)
@ApiInternalServerErrorResponse(API_INTERNAL_SERVER_ERROR_RESPONSE)
@ApiServiceUnavailableResponse(API_SERVICE_UNAVAILABLE_RESPONSE)
@SetMetadata("metadata", { api: "gpsunits" })
export class AuthController {
    constructor(private readonly logger: Logger) {

    }

    @Post("register")
    @ApiOperation({ operationId: "registerGuestAccount", summary: 'Allows users to register an account on the guests.dmechat contract' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Account registered.', type: RegisterGuestAccountResponse })
    async registerGuestAccount(@Body() payload: RegisterGuestAccountRequest): Promise<RegisterGuestAccountResponse> {
        this.logger.verbose(payload);
        const result = await registerGuestAccountHandler(payload, this.logger);
        return { accountId: result.verifyResult.originalMessage.accountId };
    }

    @Post("login-guest")
    @ApiOperation({ operationId: "loginGuest", summary: 'Allows guests login with their secret/public keys and receive a firebase auth token in return' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Account registered.', type: LoginAccountResponse })
    async loginGuest(@Body() payload: LoginAccountRequest): Promise<LoginAccountResponse> {
        this.logger.verbose(payload);
        return await loginGuestHandler(payload, this.logger);
    }

    @Post('sign-in')
    @ApiOperation({ 
        operationId: 'signInWithToken', summary: 'Temp method to allow signing in with custom token' ,
        deprecated: true
    })
    async signInToken(@Body() payload: string): Promise<any> {
        return signInWithCustomToken(getAuth(FirebaseService.firebase), (payload as any).k);
    }
}