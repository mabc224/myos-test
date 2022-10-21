import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { DbProduct, ApiProduct } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<DbProduct> {
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll(findAllProductsDto: FindAllProductsDto): Promise<DbProduct[]> {
    const { sortBy, order, searchBy, search } = findAllProductsDto;

    const query = {};

    if (searchBy && search) {
      query['where'] = {
        AND: [
          {
            isDeleted: {
              equals: false,
            },
          },
          {
            [searchBy]: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    } else if (search) {
      query['where'] = {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        AND: {
          isDeleted: {
            equals: false,
          },
        },
      };
    }

    if (sortBy && order) {
      query['orderBy'] = {
        [sortBy]: order,
      };
    } else if (order) {
      query['orderBy'] = {
        price: order,
      };
    }

    if (!Object.keys(query).length) {
      query['where'] = {
        isDeleted: false,
      };
      query['orderBy'] = { price: 'asc' };
    }

    return this.prisma.product.findMany(query);
  }

  async findOne(productId: number): Promise<DbProduct> {
    return this.prisma.product.findFirst({
      where: {
        AND: [
          {
            productId: {
              equals: productId,
            },
          },
          {
            isDeleted: {
              equals: false,
            },
          },
        ],
      },
    });
  }

  async update(
    productId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<DbProduct> {
    return this.prisma.product.update({
      where: {
        productId,
      },
      data: updateProductDto,
    });
  }

  async remove(productId: number): Promise<DbProduct> {
    return this.prisma.product.update({
      where: {
        productId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  /** ***************************************************************
   ************          Db > API transforms          ************
   **************************************************************** */

  getProductFromDb(product: any): ApiProduct {
    const { productId, title, description, picture, price } = product;

    return {
      productId,
      title,
      description,
      picture,
      price,
    };
  }
}
