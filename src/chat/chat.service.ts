import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { ChatRoom } from "./entities/chat-room.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { User } from "../user/user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateRoom(userId1: number, userId2: number): Promise<ChatRoom> {
    const roomName = `${userId1}-${userId2}`;
    const reversedRoomName = `${userId2}-${userId1}`;

    const existingRoom = await this.chatRoomRepository.findOne({
      where: [
        { name: roomName },
        { name: reversedRoomName },
      ],
    });

    if (!existingRoom) {
      return await this.createRoom(roomName, [userId1, userId2]);
    }

    const participants = await this.userRepository.find({
      where: { id: In([userId1, userId2]) }
    });

    return {
      ...existingRoom,
      participants
    };
  }

  async createRoom(name: string, participantIds: number[]) {
    const participants = await this.userRepository.findBy({
      id: In(participantIds)
    });

    const room = this.chatRoomRepository.create({ name, participants });

    const createdRoom = this.chatRoomRepository.save(room);

    return await createdRoom;
  }

  async saveMessage(roomId: number, senderId: number, content: string) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants']
    });

    if (!room) {
      throw new Error(`Room with name "${roomId}" not found`);
    }

    const sender = await this.userRepository.findOne({ where: { id: senderId } });

    if (!sender) {
      throw new Error(`Sender user with ID "${senderId}" not found`);
    }

    const message = this.chatMessageRepository.create({ room, sender, content });

    await this.chatRoomRepository.update(roomId, {
      lastMessage: content,
      lastMessageDate: new Date(),
    });

    return this.chatMessageRepository.save(message);
  }

  async getChats(userId: number): Promise<ChatRoom[]> {
    const roomsWithAnotherParticipant = await this.chatRoomRepository.find({
      where: { participants: { id: Not(userId) } },
      relations: ['participants', 'messages', 'messages.sender'],
    });

    const currentUser = await this.userRepository
      .findOne(
        {
          where: { id: userId }
        });

    const roomsWithAllParticipants = roomsWithAnotherParticipant.map(room => {
      const otherParticipant = room.participants.find(p => p.id !== userId);

      return {
        ...room,
        participants: [currentUser, otherParticipant],
      };
    });

    return  roomsWithAllParticipants;
  }

  async getChatMessages(roomId: number) {
    return await this.chatMessageRepository
      .createQueryBuilder('message')
      .where('message.room.id = :roomId', { roomId })
      .leftJoinAndSelect('message.sender', 'sender')
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async deleteAllChats() {
    return await this.chatRoomRepository.delete({});
  }
}
