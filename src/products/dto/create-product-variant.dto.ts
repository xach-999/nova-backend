import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const SKU_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsUUID()
  colorId!: string;

  @IsNotEmpty()
  @IsUUID()
  sizeId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @Matches(SKU_PATTERN, {
    message: 'sku must use uppercase letters, numbers, and single hyphens only',
  })
  sku!: string;

  @IsOptional()
  @Matches(MONEY_PATTERN, {
    message: 'price must be a positive amount with up to 2 decimals',
  })
  price?: string;

  @IsOptional()
  @Matches(MONEY_PATTERN, {
    message: 'compareAtPrice must be a positive amount with up to 2 decimals',
  })
  compareAtPrice?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
