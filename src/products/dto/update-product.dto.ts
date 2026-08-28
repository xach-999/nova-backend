import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { Gender, ProductStatus } from '../../../generated/prisma/enums';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  @Matches(SLUG_PATTERN, {
    message:
      'slug must use lowercase letters, numbers, and single hyphens only',
  })
  slug?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @Matches(MONEY_PATTERN, {
    message: 'basePrice must be a positive amount with up to 2 decimals',
  })
  basePrice?: string;

  @IsOptional()
  @Matches(MONEY_PATTERN, {
    message: 'compareAtPrice must be a positive amount with up to 2 decimals',
  })
  compareAtPrice?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
