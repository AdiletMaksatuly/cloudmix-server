import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { ChatMessage } from "./chat-message.entity";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.chatRooms, { cascade: true, onDelete: 'CASCADE' })
  participants: User[];

  @OneToMany(() => ChatMessage, (message) => message.room, { cascade: true })
  messages: ChatMessage[];

  @CreateDateColumn()
  lastMessageDate: Date;

  @Column({ nullable: true })
  lastMessage: string;
}
