import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

const productInclude = {
  category: true,
} satisfies Prisma.ProductInclude;

const productDetailInclude = {
  category: true,
  images: {
    orderBy: {
      position: 'asc',
    },
    include: {
      color: true,
    },
  },
  variants: {
    orderBy: [
      {
        color: {
          name: 'asc',
        },
      },
      {
        size: {
          sortOrder: 'asc',
        },
      },
    ],
    include: {
      color: true,
      size: true,
    },
  },
} satisfies Prisma.ProductInclude;

const productVariantInclude = {
  color: true,
  product: true,
  size: true,
} satisfies Prisma.ProductVariantInclude;

const productImageInclude = {
  color: true,
} satisfies Prisma.ProductImageInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildProductWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
        include: productDetailInclude,
      }),
      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
      },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          basePrice: new Prisma.Decimal(data.basePrice),
          compareAtPrice: data.compareAtPrice
            ? new Prisma.Decimal(data.compareAtPrice)
            : undefined,
          categoryId: data.categoryId,
          gender: data.gender,
          status: data.status,
          isFeatured: data.isFeatured,
        },
        include: productInclude,
      });
    } catch (error) {
      this.handleProductWriteError(error);
    }
  }

  async update(id: string, data: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          basePrice: data.basePrice
            ? new Prisma.Decimal(data.basePrice)
            : undefined,
          compareAtPrice: data.compareAtPrice
            ? new Prisma.Decimal(data.compareAtPrice)
            : undefined,
          categoryId: data.categoryId,
          gender: data.gender,
          status: data.status,
          isFeatured: data.isFeatured,
        },
        include: productInclude,
      });
    } catch (error) {
      this.handleProductWriteError(error);
    }
  }

  async createVariant(productId: string, data: CreateProductVariantDto) {
    try {
      return await this.prisma.productVariant.create({
        data: {
          productId,
          colorId: data.colorId,
          sizeId: data.sizeId,
          sku: data.sku,
          price: data.price ? new Prisma.Decimal(data.price) : undefined,
          compareAtPrice: data.compareAtPrice
            ? new Prisma.Decimal(data.compareAtPrice)
            : undefined,
          stockQuantity: data.stockQuantity,
          isActive: data.isActive,
        },
        include: productVariantInclude,
      });
    } catch (error) {
      this.handleProductWriteError(error);
    }
  }

  async updateVariant(
    productId: string,
    variantId: string,
    data: UpdateProductVariantDto,
  ) {
    try {
      return await this.prisma.productVariant.update({
        where: {
          id: variantId,
          productId,
        },
        data: {
          colorId: data.colorId,
          sizeId: data.sizeId,
          sku: data.sku,
          price: data.price ? new Prisma.Decimal(data.price) : undefined,
          compareAtPrice: data.compareAtPrice
            ? new Prisma.Decimal(data.compareAtPrice)
            : undefined,
          stockQuantity: data.stockQuantity,
          isActive: data.isActive,
        },
        include: productVariantInclude,
      });
    } catch (error) {
      this.handleProductWriteError(error);
    }
  }

  async createImage(productId: string, data: CreateProductImageDto) {
    try {
      if (data.isPrimary) {
        await this.clearPrimaryProductImages(productId, data.colorId);
      }

      return await this.prisma.productImage.create({
        data: {
          productId,
          colorId: data.colorId,
          url: data.url,
          altText: data.altText,
          position: data.position,
          isPrimary: data.isPrimary,
        },
        include: productImageInclude,
      });
    } catch (error) {
      this.handleProductImageWriteError(error);
    }
  }

  async updateImage(
    productId: string,
    imageId: string,
    data: UpdateProductImageDto,
  ) {
    try {
      const image = await this.prisma.productImage.findFirstOrThrow({
        where: {
          id: imageId,
          productId,
        },
      });
      const colorId = data.colorId ?? image.colorId;
      const isPrimary = data.isPrimary ?? image.isPrimary;

      if (isPrimary) {
        await this.clearPrimaryProductImages(productId, colorId, imageId);
      }

      return await this.prisma.productImage.update({
        where: {
          id: imageId,
          productId,
        },
        data: {
          colorId: data.colorId,
          url: data.url,
          altText: data.altText,
          position: data.position,
          isPrimary: data.isPrimary,
        },
        include: productImageInclude,
      });
    } catch (error) {
      this.handleProductImageWriteError(error);
    }
  }

  async deleteImage(productId: string, imageId: string) {
    try {
      return await this.prisma.productImage.delete({
        where: {
          id: imageId,
          productId,
        },
      });
    } catch (error) {
      this.handleProductImageWriteError(error);
    }
  }

  private async clearPrimaryProductImages(
    productId: string,
    colorId?: string | null,
    exceptImageId?: string,
  ) {
    await this.prisma.productImage.updateMany({
      where: {
        productId,
        colorId,
        id: exceptImageId
          ? {
              not: exceptImageId,
            }
          : undefined,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  private buildProductWhere(query: ProductsQueryDto): Prisma.ProductWhereInput {
    return {
      categoryId: query.categoryId,
      gender: query.gender,
      status: query.status,
      isFeatured: query.isFeatured,
      OR: query.search
        ? [
            {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              shortDescription: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };
  }

  private handleProductWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Product slug, variant SKU, or variant option combination already exists',
        );
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related product, category, color, or size not found',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Product not found');
      }
    }

    throw error;
  }

  private handleProductImageWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new NotFoundException('Related product or color not found');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Product image not found');
      }
    }

    throw error;
  }
}
