import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getChats(@Query('userId') userId: number) {
    return await this.chatService.getChats(userId);
  }

  @Get(':roomId/messages')
  async getChatMessages(@Param('roomId') roomId: number) {
    return await this.chatService.getChatMessages(roomId);
  }

  @Delete('/all')
  async deleteAllChats() {
    return await this.chatService.deleteAllChats();
  }
}
