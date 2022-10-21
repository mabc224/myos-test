import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddProductDto } from './dto';
import { PrismaService } from 'nestjs-prisma';
import Constants, { OrderStatus } from './utils/constants';
import { UpdateProductDto } from '../products/dto';
import {
  ApiCartItem,
  ApiCartProductItem,
  ApiOrder,
  DbCart,
  DbOrder,
} from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(userId: number): Promise<DbOrder> {
    return this.prisma.order.create({ data: { userId } });
  }

  async addProduct(
    userId: number,
    orderId: number,
    addProductDto: AddProductDto,
  ): Promise<DbCart> {
    const order = await this.findActiveOrderForUser(userId);
    if (!order) {
      throw new HttpException(
        'User does not have active order',
        HttpStatus.FORBIDDEN,
      );
    }

    const { productId, quantity } = addProductDto;

    return this.prisma.cart.create({
      data: { orderId, userId, productId, quantity },
    });
  }

  async deleteProduct(userId: number, orderId: number, cartId: number) {
    const order = await this.findActiveOrderForUser(userId);
    if (!order) {
      throw new HttpException(
        'User does not have active order',
        HttpStatus.FORBIDDEN,
      );
    }
    const aa = await this.prisma.cart.delete({
      where: { cartId },
    });
    console.log(aa);
    // return this.prisma.cart.delete({
    //   where: { cartId },
    // });
  }

  async updateProduct(
    userId: number,
    orderId: number,
    cartId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<DbCart> {
    const order = await this.findActiveOrderForUser(userId);
    if (!order) {
      throw new HttpException(
        'User does not have active order',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.cart.update({
      where: { cartId },
      data: updateProductDto,
    });
  }

  async purchaseOrder(userId: number, orderId: number) {
    const order = await this.findActiveOrderForUser(userId);
    if (!order) {
      throw new HttpException(
        'User does not have active order',
        HttpStatus.FORBIDDEN,
      );
    }
    const orderDetail = await this.getCart(orderId);
    const { cart = [] } = orderDetail;

    const promises = [];
    cart.forEach((item) => {
      const { quantity, product } = item;
      const { productId } = product;
      const query = this.prisma.product.update({
        where: {
          productId,
        },
        data: { quantity: { decrement: quantity } },
      });
      promises.push(query);
    });
    const updateOrderStatus = this.prisma.order.update({
      where: {
        orderId,
      },
      data: { status: Constants.OrderStatus.PURCHASED },
    });
    promises.push(updateOrderStatus);

    return this.prisma.$transaction(promises);
  }

  async payOrder(userId: number, orderId: number) {
    const order = await this.findOrderForUserWithStatus(
      userId,
      OrderStatus.PURCHASED,
    );
    if (!order) {
      throw new HttpException(
        'User does not have purchased order',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.order.update({
      where: {
        orderId,
      },
      data: { status: OrderStatus.PAID },
    });
  }

  /** *********************************
   ********* Other functions *********
   ********************************** */

  async reCalculateCart(order: any) {
    const orderDetail = { ...order };
    const { orderId, cart = [] } = orderDetail;
    let cartTotalPrice = 0;
    cart.forEach((item) => {
      const { quantity, product } = item;
      const { price } = product;
      const totalPrice = Number(
        parseFloat(String(quantity * price)).toFixed(2),
      );
      cartTotalPrice += totalPrice;
    });
    order.totalPrice = cartTotalPrice;

    await this.prisma.order.update({
      where: {
        orderId,
      },
      data: { totalPrice: cartTotalPrice },
    });

    return order;
  }

  async getCart(orderId: number) {
    return this.prisma.order.findUnique({
      where: {
        orderId,
      },
      include: {
        cart: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findUserWithActiveOrder(userId: number) {
    return this.prisma.order.findFirst({
      where: {
        AND: [
          {
            userId: {
              equals: userId,
            },
          },
          {
            status: {
              equals: Constants.OrderStatus.DRAFT,
            },
          },
        ],
      },
    });
  }

  async isOrderBelongToCurrentUser(userId: number, orderId: number) {
    return this.prisma.order.findFirst({
      where: {
        AND: [
          {
            userId: {
              equals: userId,
            },
          },
          {
            orderId: {
              equals: orderId,
            },
          },
        ],
      },
    });
  }

  async findActiveOrderForUser(userId: number) {
    return this.prisma.order.findFirst({
      where: {
        AND: [
          {
            userId: {
              equals: userId,
            },
          },
          {
            status: {
              equals: Constants.OrderStatus.DRAFT,
            },
          },
        ],
      },
    });
  }

  async findOrderForUserWithStatus(userId: number, status: OrderStatus) {
    return this.prisma.order.findFirst({
      where: {
        AND: [
          {
            userId: {
              equals: userId,
            },
          },
          {
            status: {
              equals: status,
            },
          },
        ],
      },
    });
  }

  /** ***************************************************************
   ************          Db > API transforms          ************
   **************************************************************** */

  getApiOrder(order: any): ApiOrder {
    const { orderId, status, totalPrice, cart = [] } = order;

    return {
      orderId,
      status,
      totalPrice,
      cart: cart.map((cartRow) => this.getAPiCart(cartRow)),
    };
  }

  getAPiCart(cart: any): ApiCartItem {
    const { cartId, quantity, product } = cart;
    const productRow = this.getApiProduct(product);
    return { cartId, quantity, ...productRow };
  }

  getApiProduct(product: any): ApiCartProductItem {
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
