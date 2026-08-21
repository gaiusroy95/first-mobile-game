import { IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(24)
  displayName: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
