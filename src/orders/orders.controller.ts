import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductDto } from './dto';
import { AuthGuard, OrderGuard } from './../common/guards';
import { UpdateProductDto } from '../products/dto';

@Controller({ path: 'orders', version: ['1'] })
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Req() request, @Res({ passthrough: true }) response) {
    const { userId } = request.user;
    const activeOrder = await this.ordersService.findUserWithActiveOrder(
      userId,
    );
    if (activeOrder) {
      return response.status(HttpStatus.OK).send(activeOrder);
    }
    return this.ordersService.create(userId);
  }

  @UseGuards(OrderGuard)
  @Get(':orderId')
  async findOne(@Param('orderId', ParseIntPipe) orderId: number) {
    const cartRow = await this.ordersService.getCart(orderId);
    console.log(cartRow);
    return this.ordersService.getOrderFromDb(cartRow);
  }

  @UseGuards(OrderGuard)
  @Post(':orderId/products')
  async createProduct(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() addProductDto: AddProductDto,
  ) {
    const { userId } = request.user;
    await this.ordersService.addProduct(userId, orderId, addProductDto);
    const cartWithProducts = await this.ordersService.getCart(orderId);

    return this.ordersService.reCalculateCart(cartWithProducts);
  }

  @UseGuards(OrderGuard)
  @Delete(':orderId/products/:cartId')
  async deleteProduct(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('cartId', ParseIntPipe) cartId: number,
  ) {
    const { userId } = request.user;
    await this.ordersService.deleteProduct(userId, orderId, cartId);
    const cartWithProducts = await this.ordersService.getCart(orderId);

    return this.ordersService.reCalculateCart(cartWithProducts);
  }

  @UseGuards(OrderGuard)
  @Put(':orderId/products/:cartId')
  async updateProduct(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('cartId', ParseIntPipe) cartId: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const { userId } = request.user;
    await this.ordersService.updateProduct(
      userId,
      orderId,
      cartId,
      updateProductDto,
    );
    const cartWithProducts = await this.ordersService.getCart(orderId);

    return this.ordersService.reCalculateCart(cartWithProducts);
  }

  @UseGuards(OrderGuard)
  @Post(':orderId/purchase')
  async purchaseOrder(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const { userId } = request.user;
    await this.ordersService.purchaseOrder(userId, orderId);
    return this.ordersService.getCart(orderId);
  }

  @UseGuards(OrderGuard)
  @Post(':orderId/pay')
  async payOrder(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const { userId } = request.user;
    await this.ordersService.payOrder(userId, orderId);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return this.ordersService.getCart(orderId);
  }
}
