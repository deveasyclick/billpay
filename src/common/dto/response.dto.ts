import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty()
  data?: T;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  statusCode: number;
}

export class ApiErrorResponseDto extends ApiResponseDto<null> {
  @ApiProperty()
  error: string;
}
