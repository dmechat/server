import { Controller, UseGuards, Logger, Get, Param, Session, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiSecurity, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { JoiResponseTransformInterceptor } from "src/interceptors/joiResponseTransform.interceptor";
import { AuthSession } from "src/models/auth.models";
import { Chat, ApiChatSchema, ListOfApiChatSchema } from "src/models/chats/chat.model";
import { AuthGuard } from "../auth/auth.guard";
import listChatsUsecase from "./usecases/listChats";

@ApiTags("users")
@Controller("users")
@UseGuards(AuthGuard)
@ApiSecurity("ID_TOKEN")
export class UsersController {
    constructor(private readonly logger: Logger) {

    }

    // // createChat
    // @Post()
    // @ApiOperation({ operationId: "createChat", summary: '' })
    // @ApiResponse({ status: 403, description: 'Forbidden.' })
    // @ApiResponse({ status: 404, description: 'Bad request.' })
    // @ApiResponse({ status: 201, description: 'Chat', type: Chat })
    // @UsePipes(new JoiValidationPipe(CreateChatSchema, "body"))
    // @UseInterceptors(new JoiResponseTransformInterceptor(ApiChatSchema))
    // async createChat(@Body() payload: Chat, @Session() session: AuthSession): Promise<Chat> {
    //     this.logger.verbose("payload", payload);
    //     // TODO: usecase style approach to allow cleaner code
    //     return await createChatUsecase(this.logger)(payload, session);
    // }

    // retrieveChat
    @Get("/:uid")
    @ApiOperation({ operationId: "listChats", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Chat', type: [Chat] })
    @ApiParam({ name: "uid", type: String })
    @UseInterceptors(new JoiResponseTransformInterceptor(ListOfApiChatSchema))
    async listChats(@Param() params, @Session() session: AuthSession): Promise<Chat[]> {
        return await listChatsUsecase(this.logger)(params.uid, session);
    }

}