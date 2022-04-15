import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginAccountRequest, LoginAccountResponse, RegisterGuestAccountRequest, RegisterGuestAccountResponse } from './app.models';
import { AppService, FirebaseService } from './app.service';
import loginGuestHandler from './usecases/loginGuest';
import registerGuestAccountHandler from './usecases/registerGuestAccount';

@ApiTags("api")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly logger: Logger, private readonly firebaseService: FirebaseService) {
    firebaseService.init();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
  async loginGuest(@Body() payload: LoginAccountRequest): Promise<LoginAccountResponse> {
    this.logger.verbose(payload);
    return await loginGuestHandler(payload, this.logger);
  }
}
