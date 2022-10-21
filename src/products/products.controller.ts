import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';

@Controller({
  path: 'products',
  version: ['1'],
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const productRow = await this.productsService.create(createProductDto);
    return this.productsService.getProductFromDb(productRow);
  }

  @Get()
  async findAll(@Query() queryParams: FindAllProductsDto) {
    const productsRows = await this.productsService.findAll(queryParams);
    return productsRows.map((row) =>
      this.productsService.getProductFromDb(row),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const productRow = await this.productsService.findOne(+id);
    if (!productRow) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return this.productsService.getProductFromDb(productRow);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    let productRow = await this.productsService.findOne(id);
    if (!productRow) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    productRow = await this.productsService.update(id, updateProductDto);
    return this.productsService.getProductFromDb(productRow);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    await this.productsService.remove(id);
  }
}
