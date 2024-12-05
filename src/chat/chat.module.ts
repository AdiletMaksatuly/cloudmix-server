import { forwardRef, Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatRoom } from "./entities/chat-room.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { UserModule } from "../user/user.module";
import { User } from "../user/user.entity";
import { ChatController } from "./chat.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatMessage, User]),
    UserModule,
    forwardRef(() => AuthModule)
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatGateway]
})
export class ChatModule {}
