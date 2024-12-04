import { IsNumber } from "class-validator";

export class JoinRoomDto {
  @IsNumber()
  senderId: number;

  @IsNumber()
  receiverId: number;
}
