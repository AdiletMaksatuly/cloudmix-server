import { IsInt, IsString } from "class-validator";

export class SendMessageDto {
  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsString()
  message: string;
}
