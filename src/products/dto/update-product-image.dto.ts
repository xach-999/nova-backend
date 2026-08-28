import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductImageDto {
  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  url?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
