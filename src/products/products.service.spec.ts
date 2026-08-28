import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client';
import { Gender, ProductStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      count: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    productVariant: {
      create: jest.Mock;
      update: jest.Mock;
    };
    productImage: {
      create: jest.Mock;
      delete: jest.Mock;
      findFirstOrThrow: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        create: jest.fn(),
        update: jest.fn(),
      },
      productImage: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirstOrThrow: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((queries: unknown[]) => Promise.all(queries)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: 'Classic Cotton Hoodie',
      slug: 'classic-cotton-hoodie',
      basePrice: '59.99',
      categoryId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
      gender: Gender.UNISEX,
      status: ProductStatus.DRAFT,
      isFeatured: false,
    };
    const product: unknown = {
      id: 'product-id',
      ...dto,
    };

    prisma.product.create.mockResolvedValue(product);

    await expect(service.create(dto)).resolves.toBe(product);
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: undefined,
        shortDescription: undefined,
        basePrice: new Prisma.Decimal(dto.basePrice),
        compareAtPrice: undefined,
        categoryId: dto.categoryId,
        gender: dto.gender,
        status: dto.status,
        isFeatured: dto.isFeatured,
      },
      include: {
        category: true,
      },
    });
  });

  it('should find all products with pagination metadata', async () => {
    const products: unknown[] = [{ id: 'product-id' }];

    prisma.product.findMany.mockResolvedValue(products);
    prisma.product.count.mockResolvedValue(1);

    await expect(service.findAll({ page: 1, limit: 20 })).resolves.toEqual({
      items: products,
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
      }),
    );
    expect(prisma.product.count).toHaveBeenCalled();
  });

  it('should find a product by id', async () => {
    const product: unknown = { id: 'product-id' };

    prisma.product.findUnique.mockResolvedValue(product);

    await expect(service.findById('product-id')).resolves.toBe(product);
    expect(prisma.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'product-id',
        },
      }),
    );
  });

  it('should find a product by slug', async () => {
    const product: unknown = {
      id: 'product-id',
      slug: 'classic-cotton-hoodie',
    };

    prisma.product.findUnique.mockResolvedValue(product);

    await expect(service.findBySlug('classic-cotton-hoodie')).resolves.toBe(
      product,
    );
    expect(prisma.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'classic-cotton-hoodie',
        },
      }),
    );
  });

  it('should update a product', async () => {
    const product: unknown = {
      id: 'product-id',
      name: 'Updated Hoodie',
    };

    prisma.product.update.mockResolvedValue(product);

    await expect(
      service.update('product-id', { name: 'Updated Hoodie' }),
    ).resolves.toBe(product);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: {
        id: 'product-id',
      },
      data: {
        name: 'Updated Hoodie',
        slug: undefined,
        description: undefined,
        shortDescription: undefined,
        basePrice: undefined,
        compareAtPrice: undefined,
        categoryId: undefined,
        gender: undefined,
        status: undefined,
        isFeatured: undefined,
      },
      include: {
        category: true,
      },
    });
  });

  it('should create a product variant', async () => {
    const dto: CreateProductVariantDto = {
      colorId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
      sizeId: 'b998547b-85e6-4c1c-b7f2-b45132e2b6af',
      sku: 'HOODIE-BLACK-M',
      price: '59.99',
      stockQuantity: 8,
    };
    const variant: unknown = {
      id: 'variant-id',
      ...dto,
    };

    prisma.productVariant.create.mockResolvedValue(variant);

    await expect(service.createVariant('product-id', dto)).resolves.toBe(
      variant,
    );
    expect(prisma.productVariant.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-id',
        colorId: dto.colorId,
        sizeId: dto.sizeId,
        sku: dto.sku,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice: undefined,
        stockQuantity: dto.stockQuantity,
        isActive: undefined,
      },
      include: {
        color: true,
        product: true,
        size: true,
      },
    });
  });

  it('should update a product variant', async () => {
    const dto: UpdateProductVariantDto = {
      price: '64.99',
      stockQuantity: 12,
    };
    const variant: unknown = {
      id: 'variant-id',
      ...dto,
    };

    prisma.productVariant.update.mockResolvedValue(variant);

    await expect(
      service.updateVariant('product-id', 'variant-id', dto),
    ).resolves.toBe(variant);
    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: {
        id: 'variant-id',
        productId: 'product-id',
      },
      data: {
        colorId: undefined,
        sizeId: undefined,
        sku: undefined,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice: undefined,
        stockQuantity: dto.stockQuantity,
        isActive: undefined,
      },
      include: {
        color: true,
        product: true,
        size: true,
      },
    });
  });

  it('should create a product image', async () => {
    const dto: CreateProductImageDto = {
      url: 'https://example.com/hoodie-black-front.jpg',
      position: 1,
      isPrimary: false,
    };
    const image: unknown = {
      id: 'image-id',
      ...dto,
    };

    prisma.productImage.create.mockResolvedValue(image);

    await expect(service.createImage('product-id', dto)).resolves.toBe(image);
    expect(prisma.productImage.updateMany).not.toHaveBeenCalled();
    expect(prisma.productImage.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-id',
        colorId: undefined,
        url: dto.url,
        altText: undefined,
        position: dto.position,
        isPrimary: dto.isPrimary,
      },
      include: {
        color: true,
      },
    });
  });

  it('should clear existing primary images before creating a primary image', async () => {
    const dto: CreateProductImageDto = {
      colorId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
      url: 'https://example.com/hoodie-black-front.jpg',
      position: 1,
      isPrimary: true,
    };
    const image: unknown = {
      id: 'image-id',
      ...dto,
    };

    prisma.productImage.updateMany.mockResolvedValue({ count: 1 });
    prisma.productImage.create.mockResolvedValue(image);

    await expect(service.createImage('product-id', dto)).resolves.toBe(image);
    expect(prisma.productImage.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-id',
        colorId: dto.colorId,
        id: undefined,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  });

  it('should update a product image', async () => {
    const dto: UpdateProductImageDto = {
      position: 2,
    };
    const existingImage = {
      id: 'image-id',
      colorId: null,
      isPrimary: false,
    };
    const image: unknown = {
      ...existingImage,
      ...dto,
    };

    prisma.productImage.findFirstOrThrow.mockResolvedValue(existingImage);
    prisma.productImage.update.mockResolvedValue(image);

    await expect(
      service.updateImage('product-id', 'image-id', dto),
    ).resolves.toBe(image);
    expect(prisma.productImage.updateMany).not.toHaveBeenCalled();
    expect(prisma.productImage.update).toHaveBeenCalledWith({
      where: {
        id: 'image-id',
        productId: 'product-id',
      },
      data: {
        colorId: undefined,
        url: undefined,
        altText: undefined,
        position: dto.position,
        isPrimary: undefined,
      },
      include: {
        color: true,
      },
    });
  });

  it('should delete a product image', async () => {
    const image: unknown = {
      id: 'image-id',
    };

    prisma.productImage.delete.mockResolvedValue(image);

    await expect(service.deleteImage('product-id', 'image-id')).resolves.toBe(
      image,
    );
    expect(prisma.productImage.delete).toHaveBeenCalledWith({
      where: {
        id: 'image-id',
        productId: 'product-id',
      },
    });
  });

  it('should throw conflict exception for duplicate slug', async () => {
    prisma.product.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        name: 'Classic Cotton Hoodie',
        slug: 'classic-cotton-hoodie',
        basePrice: '59.99',
        categoryId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
        gender: Gender.UNISEX,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should throw not found exception for missing category', async () => {
    prisma.product.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: 'test',
        },
      ),
    );

    await expect(
      service.create({
        name: 'Classic Cotton Hoodie',
        slug: 'classic-cotton-hoodie',
        basePrice: '59.99',
        categoryId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
        gender: Gender.UNISEX,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw not found exception when product does not exist', async () => {
    prisma.product.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.update('product-id', { name: 'Updated Hoodie' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw not found exception when product variant does not exist', async () => {
    prisma.productVariant.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.updateVariant('product-id', 'variant-id', { stockQuantity: 12 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw not found exception when product image does not exist', async () => {
    prisma.productImage.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.deleteImage('product-id', 'image-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
