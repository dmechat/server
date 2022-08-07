import { Body, Controller, Delete, Get, Logger, NotImplementedException, Param, ParseEnumPipe, PayloadTooLargeException, Post, Put, Query, Session, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SignedRequest } from 'src/models/app.models';
import { AuthSession } from 'src/models/auth.models';
import { ApiChatSchema, Chat, CreateChatSchema } from 'src/models/chats/chat.model';
import { UpdateParticipantsRequest, UpdateParticipantsRequestSchema } from 'src/models/chats/participants.model';
import { ApiMessageListSchema, ApiMessageSchema, CreateMessageSchema, ListMessagesQuery, ListMessagesQuerySchema, Message, UpdateMessageSchema } from 'src/models/chats/message.model';
import { AuthGuard } from '../auth/auth.guard';
import createChatUsecase from './usecases/createChat';
import retrieveChatUsecase from "./usecases/retrieveChat";
import updateParticipantsUsecase from "./usecases/addParticipants";
import sendMessageUsecase from "./usecases/sendMessage";
import retreiveMessageUsecase from "./usecases/retrieveMessage";
import updateMessageUsecase from "./usecases/updateMessage";
import listMessagesUsecase from "./usecases/listMessages";
import { JoiValidationPipe } from 'src/pipes/joiValidation.pipe';
import { JoiResponseTransformInterceptor } from 'src/interceptors/joiResponseTransform.interceptor';


@ApiTags("chats")
@Controller("chats")
@UseGuards(AuthGuard)
@ApiSecurity("ID_TOKEN")
export class ChatsController {
    constructor(private readonly logger: Logger) {

    }
    // createChat
    @Post()
    @ApiOperation({ operationId: "createChat", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Chat', type: Chat })
    @UsePipes(new JoiValidationPipe(CreateChatSchema, "body"))
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiChatSchema))
    async createChat(@Body() payload: Chat, @Session() session: AuthSession): Promise<Chat> {
        this.logger.verbose("payload", payload);
        // TODO: usecase style approach to allow cleaner code
        return await createChatUsecase(this.logger)(payload, session);
    }

    // retrieveChat
    @Get("/:id")
    @ApiOperation({ operationId: "retrieveChat", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Chat', type: Chat })
    @ApiParam({ name: "id", type: String })
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiChatSchema))
    async retrieveChat(@Param() params, @Session() session: AuthSession): Promise<Chat> {
        return await retrieveChatUsecase(this.logger)(params.id, session);
    }

    @Put("/:id/participants")
    @ApiOperation({ operationId: "addParticipants", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Success', type: Boolean })
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: UpdateParticipantsRequest })
    @UsePipes(new JoiValidationPipe(UpdateParticipantsRequestSchema, "body"))
    async updateParticipants(@Param() params, @Body() payload: UpdateParticipantsRequest, @Session() session: AuthSession) {
        return await updateParticipantsUsecase(this.logger)(params.id, payload, session);
    }

    @Post("/:id/messages")
    @ApiOperation({ operationId: "sendMessage", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Success', type: Message })
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: Message })
    @UsePipes(new JoiValidationPipe(CreateMessageSchema, "body"))
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiMessageSchema))
    async sendMessage(@Param() params, @Body() payload: Message, @Session() session: AuthSession) {
        return await sendMessageUsecase(this.logger)(params.id, payload, session);
    }

    @Get("/:id/messages")
    @ApiOperation({ operationId: "listMessages", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 200, description: 'Success', type: [Message] })
    @ApiParam({ name: "id", type: String })
    @ApiQuery({ name: "limit", type: Number, required: false })
    @ApiQuery({ name: "before", type: Number, required: false })
    @ApiQuery({ name: "after", type: Number, required: false })
    @ApiQuery({ name: "order", type: String, required: false })
    @UsePipes(new JoiValidationPipe(ListMessagesQuerySchema, "query"))
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiMessageListSchema))
    async listMessages(@Param() params, @Query() query: ListMessagesQuery, @Session() session: AuthSession) {
        return await listMessagesUsecase(this.logger)(params.id, query, session);
    }

    @Get("/:id/messages/:messageId")
    @ApiOperation({ operationId: "retrieveMessage", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 201, description: 'Success', type: Message })
    @ApiParam({ name: "id", type: String })
    @ApiParam({ name: "messageId", type: String })
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiMessageSchema))
    async retrieveMessage(@Param() params, @Session() session: AuthSession) {
        return await retreiveMessageUsecase(this.logger)(params.id, params.messageId, session);
    }

    @Put("/:id/messages/:messageId")
    @ApiOperation({ operationId: "updateMessage", summary: '' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Bad request.' })
    @ApiResponse({ status: 200, description: 'Success', type: Message })
    @ApiParam({ name: "id", type: String })
    @ApiParam({ name: "messageId", type: String })
    @ApiBody({ type: Message })
    @UsePipes(new JoiValidationPipe(UpdateMessageSchema, "body"))
    @UseInterceptors(new JoiResponseTransformInterceptor(ApiMessageSchema))
    async updateMessage(@Param() params, @Body() payload: Message, @Session() session: AuthSession) {
        return await updateMessageUsecase(this.logger)(params.id, params.messageId, payload, session);
    }



    // // updateChat
    // @Post("/:id")
    // @ApiOperation({ operationId: "updateChat", summary: '' })
    // @ApiResponse({ status: 403, description: 'Forbidden.' })
    // @ApiResponse({ status: 404, description: 'Bad request.' })
    // @ApiResponse({ status: 201, description: 'Chat', type: Chat })
    // async updateChat(@Body() payload: Chat, @Session() session: AuthSession): Promise<Chat> {
    //     return await updateChatUsecase(this.logger)(payload, session);
    // }

    // // invite user
    // @Post("invite")
    // @ApiOperation({ operationId: "inviteUser", summary: '' })
    // @ApiResponse({ status: 403, description: 'Forbidden.' })
    // @ApiResponse({ status: 404, description: 'Bad request.' })
    // @ApiResponse({ status: 201, description: 'Chat', type: Chat })
    // async inviteUser(@Body() payload: Chat): Promise<Chat> {
    //     this.logger.verbose(payload);
    //     throw new NotImplementedException();
    // }
    // remove user

    // update user ( as admin or normal user)
}
