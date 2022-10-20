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
    let whereClause = {};
    if (searchBy && search) {
      whereClause = {
        [searchBy]: {
          contains: search,
        },
      };
    } else if (search) {
      whereClause: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ];
      }
    }
    query['where'] = whereClause;

    if (sortBy && order) {
      query['orderBy'] = {
        [sortBy]: order,
      };
    } else if (order) {
      query['orderBy'] = {
        price: order,
      };
    }

    return this.prisma.product.findMany(query);
  }

  async findOne(id: number): Promise<Product> {
    return this.prisma.product.findFirst({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
