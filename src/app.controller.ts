import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService, FirebaseService } from './app.service';

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly logger: Logger, private readonly firebaseService: FirebaseService) {
    firebaseService.init();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // create-room

  // list available users
  // @Get("list-available-users")
  // @ApiOperation({ operationId: "listAvailableUsers", summary: "list users in the app" })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // @ApiResponse({ status: 404, description: 'Bad request.' })
  // @ApiResponse({ status: 200, description: 'Users list', type: [User] })
  // async listAvailableUsers() {
  //   return await listAvailableUsersHandler(this.logger);
  // }


}
