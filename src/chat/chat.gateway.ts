import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { JoinRoomDto } from "./dto/join-room.dto";
import { User } from "../user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          throw new Error('No token provided');
        }

        const user = await this.authService.validateJwt(token);
        if (!user) {
          throw new Error('Invalid token');
        }

        socket.data.user = user;
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      await this.userRepository.update({ id: +userId }, { isOnline: true });

      this.server.emit('userStatusChanged', { userId, isOnline: true });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      await this.userRepository.update({ id: +userId }, { isOnline: false });

      this.server.emit('userStatusChanged', { userId, isOnline: false });
    }
  }

  @SubscribeMessage('chats')
  async handleGetChats(
    @MessageBody() { userId }: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const chatRooms = await this.chatService.getChats(userId);

    client.emit('chats', chatRooms);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.chatService.findOrCreateRoom(joinRoomDto.senderId, joinRoomDto.receiverId);

    client.join(room.name);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() { roomId }: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getChatMessages(roomId);

    client.emit('messages', messages);
  }


  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { receiverId, senderId, message } = sendMessageDto;

    const room = await this.chatService.findOrCreateRoom(senderId, receiverId);

    const savedMessage = await this.chatService.saveMessage(room.id, senderId, message);

    const chatRooms = await this.chatService.getChats(senderId);

    const chatMessages = await this.chatService.getChatMessages(room.id);

    this.server.to(room.name).emit('newMessage', savedMessage);
    this.server.to(room.name).emit('chats', chatRooms);
    this.server.to(room.name).emit('messages', chatMessages);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() createRoomDto: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { participantIds } = createRoomDto;

    if (!participantIds || participantIds.length !== 2) {
      throw new Error('A chat room must have exactly two participants');
    }

   const [userId1, userId2] = participantIds;

    const room = await this.chatService.findOrCreateRoom(userId1, userId2);

    this.server.emit('roomCreated', room);
  }
}
