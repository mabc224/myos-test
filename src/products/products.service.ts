import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll(findAllProductsDto: FindAllProductsDto): Promise<Product[]> {
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

  async findOne(id: number): Promise<Product> {
    return this.prisma.product.findFirst({
      where: {
        AND: [
          {
            id: {
              equals: id,
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
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
