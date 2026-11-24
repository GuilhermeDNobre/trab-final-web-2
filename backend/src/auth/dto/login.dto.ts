import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@geanbebidas.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'your-admin-password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
