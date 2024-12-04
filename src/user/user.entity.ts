import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoom } from "../chat/entities/chat-room.entity";
import { ChatMessage } from "../chat/entities/chat-message.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: false })
  isOnline: boolean;

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.participants)
  @JoinTable()
  chatRooms: ChatRoom[];

  @OneToMany(() => ChatMessage, (message) => message.sender)
  messages: ChatMessage[];
}
