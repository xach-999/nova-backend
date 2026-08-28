import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { Gender } from '../../generated/prisma/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: {
    create: jest.Mock;
    createImage: jest.Mock;
    createVariant: jest.Mock;
    deleteImage: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    update: jest.Mock;
    updateImage: jest.Mock;
    updateVariant: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      createImage: jest.fn(),
      createVariant: jest.fn(),
      deleteImage: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      updateImage: jest.fn(),
      updateVariant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', () => {
    const dto: CreateProductDto = {
      name: 'Classic Cotton Hoodie',
      slug: 'classic-cotton-hoodie',
      basePrice: '59.99',
      categoryId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
      gender: Gender.UNISEX,
    };
    const product = { id: 'product-id', ...dto };

    service.create.mockReturnValue(product);

    expect(controller.create(dto)).toBe(product);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all products', () => {
    const result = {
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };

    service.findAll.mockReturnValue(result);

    expect(controller.findAll({})).toBe(result);
    expect(service.findAll).toHaveBeenCalledWith({});
  });

  it('should find a product by id', () => {
    const product = { id: 'product-id' };

    service.findById.mockReturnValue(product);

    expect(controller.findById('product-id')).toBe(product);
    expect(service.findById).toHaveBeenCalledWith('product-id');
  });

  it('should find a product by slug', () => {
    const product = { id: 'product-id', slug: 'classic-cotton-hoodie' };

    service.findBySlug.mockReturnValue(product);

    expect(controller.findBySlug('classic-cotton-hoodie')).toBe(product);
    expect(service.findBySlug).toHaveBeenCalledWith('classic-cotton-hoodie');
  });

  it('should create a product variant', () => {
    const dto: CreateProductVariantDto = {
      colorId: '4c2764c4-cd3c-4ed8-9291-e7f959260d2c',
      sizeId: 'b998547b-85e6-4c1c-b7f2-b45132e2b6af',
      sku: 'HOODIE-BLACK-M',
      stockQuantity: 8,
    };
    const variant = { id: 'variant-id', ...dto };

    service.createVariant.mockReturnValue(variant);

    expect(controller.createVariant('product-id', dto)).toBe(variant);
    expect(service.createVariant).toHaveBeenCalledWith('product-id', dto);
  });

  it('should create a product image', () => {
    const dto: CreateProductImageDto = {
      url: 'https://example.com/hoodie-black-front.jpg',
      position: 1,
      isPrimary: true,
    };
    const image = { id: 'image-id', ...dto };

    service.createImage.mockReturnValue(image);

    expect(controller.createImage('product-id', dto)).toBe(image);
    expect(service.createImage).toHaveBeenCalledWith('product-id', dto);
  });

  it('should update a product variant', () => {
    const dto: UpdateProductVariantDto = {
      stockQuantity: 12,
    };
    const variant = { id: 'variant-id', ...dto };

    service.updateVariant.mockReturnValue(variant);

    expect(controller.updateVariant('product-id', 'variant-id', dto)).toBe(
      variant,
    );
    expect(service.updateVariant).toHaveBeenCalledWith(
      'product-id',
      'variant-id',
      dto,
    );
  });

  it('should update a product image', () => {
    const dto: UpdateProductImageDto = {
      position: 2,
    };
    const image = { id: 'image-id', ...dto };

    service.updateImage.mockReturnValue(image);

    expect(controller.updateImage('product-id', 'image-id', dto)).toBe(image);
    expect(service.updateImage).toHaveBeenCalledWith(
      'product-id',
      'image-id',
      dto,
    );
  });

  it('should delete a product image', () => {
    const image = { id: 'image-id' };

    service.deleteImage.mockReturnValue(image);

    expect(controller.deleteImage('product-id', 'image-id')).toBe(image);
    expect(service.deleteImage).toHaveBeenCalledWith('product-id', 'image-id');
  });

  it('should update a product', () => {
    const dto: UpdateProductDto = {
      name: 'Updated Hoodie',
    };
    const product = { id: 'product-id', ...dto };

    service.update.mockReturnValue(product);

    expect(controller.update('product-id', dto)).toBe(product);
    expect(service.update).toHaveBeenCalledWith('product-id', dto);
  });
});
