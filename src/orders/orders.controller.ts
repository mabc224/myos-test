import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductDto, UpdateProductDto } from './dto';
import { AuthGuard, OrderGuard } from './../common/guards';
import { OrderStatus } from './utils/constants';

@Controller({ path: 'orders', version: ['1'] })
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Req() request, @Res({ passthrough: true }) response) {
    const { userId } = request.user;
    const activeOrder = await this.ordersService.findOrderForUserWithStatus(
      userId,
      OrderStatus.DRAFT,
    );
    if (activeOrder) {
      const orderRow = await this.ordersService.getApiOrder(activeOrder);
      return response.status(HttpStatus.OK).send(orderRow);
    }
    const orderRow = await this.ordersService.create(userId);
    return this.ordersService.getApiOrder(orderRow);
  }

  @UseGuards(OrderGuard)
  @Get(':orderId')
  async findOne(@Param('orderId', ParseIntPipe) orderId: number) {
    const orderRow = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(orderRow);
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
    await this.ordersService.reCalculateCart(cartWithProducts);
    const updatedCartRow = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(updatedCartRow);
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
    await this.ordersService.reCalculateCart(cartWithProducts);
    const updatedCartRow = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(updatedCartRow);
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
    await this.ordersService.reCalculateCart(cartWithProducts);
    const updatedCartRow = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(updatedCartRow);
  }

  @UseGuards(OrderGuard)
  @Post(':orderId/purchase')
  async purchaseOrder(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const { userId } = request.user;
    await this.ordersService.purchaseOrder(userId, orderId);
    const cartWithProducts = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(cartWithProducts);
  }

  @UseGuards(OrderGuard)
  @Post(':orderId/pay')
  async payOrder(
    @Req() request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const { userId } = request.user;
    await this.ordersService.payOrder(userId, orderId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const cartWithProducts = await this.ordersService.getCart(orderId);
    return this.ordersService.getApiOrder(cartWithProducts);
  }
}
