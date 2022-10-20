import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll() {
    return this.prisma.product.findMany({});
  }

  async findOne(id: number) {
    return this.prisma.product.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
