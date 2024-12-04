import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class CreateRoomDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  participantIds: number[];
}
