import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginAccountRequest, LoginAccountResponse, RegisterGuestAccountRequest, RegisterGuestAccountResponse } from './app.models';
import { AppService } from './app.service';

@ApiTags("api")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("register")
  @ApiOperation({ operationId: "registerGuestAccount", summary: 'Allows users to register an account on the guests.dmechat contract' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Bad request.' })
  @ApiResponse({ status: 201, description: 'Account registered.', type: RegisterGuestAccountResponse  })
  registerGuestAccount(@Body() payload: RegisterGuestAccountRequest): string {
    throw new Error("Not Implemented");
  }

  @Post("login-guest")
  @ApiOperation({ operationId: "loginGuest", summary: 'Allows guests login with their secret/public keys and receive a firebase auth token in return' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Bad request.' })
  loginGuest(@Body() payload: LoginAccountRequest): LoginAccountResponse {
    throw new Error("Not Implemented");
  }
}
