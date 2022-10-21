import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddProductDto, UpdateOrderDto } from './dto';
import { PrismaService } from 'nestjs-prisma';
import Constants, { OrderStatus } from './utils/constants';
import { UpdateProductDto } from '../products/dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(userId: number) {
    return this.prisma.order.create({ data: { userId } });
  }

  async addProduct(
    userId: number,
    orderId: number,
    addProductDto: AddProductDto,
  ) {
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
    return this.prisma.cart.delete({
      where: { id: cartId },
    });
  }

  async updateProduct(
    userId: number,
    orderId: number,
    cartId: number,
    updateProductDto: UpdateProductDto,
  ) {
    const order = await this.findActiveOrderForUser(userId);
    if (!order) {
      throw new HttpException(
        'User does not have active order',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.prisma.cart.update({
      where: { id: cartId },
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
    const { id, cart = [] } = orderDetail;

    const promises = [];
    cart.forEach((item) => {
      const { quantity, product } = item;
      const { id } = product;
      const query = this.prisma.product.update({
        where: {
          id,
        },
        data: { quantity: { decrement: quantity } },
      });
      promises.push(query);
    });
    const updateOrderStatus = this.prisma.order.update({
      where: {
        id: orderId,
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
        id: orderId,
      },
      data: { status: OrderStatus.PAID },
    });
  }

  /** *********************************
   ********* Other functions *********
   ********************************** */

  async reCalculateCart(order: any) {
    const orderDetail = { ...order };
    const { id, cart = [] } = orderDetail;
    let cartTotalPrice = 0;
    cart.forEach((item) => {
      const { quantity, product } = item;
      const { price } = product;
      const totalPrice = Number(
        parseFloat(String(quantity * price)).toFixed(2),
      );
      // product.totalPrice = totalPrice;
      cartTotalPrice += totalPrice;
    });
    order.totalPrice = cartTotalPrice;

    await this.prisma.order.update({
      where: {
        id,
      },
      data: { totalPrice: cartTotalPrice },
    });

    return order;
  }

  async getCart(orderId: number) {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
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
            id: {
              equals: orderId,
            },
          },
        ],
      },
    });
  }

  async isActiveOrderForUser(userId: number, orderId: number) {
    return this.prisma.order.findFirst({
      where: {
        AND: [
          {
            userId: {
              equals: userId,
            },
          },
          {
            id: {
              equals: orderId,
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

  getOrderFromDb(order: any) {
    const { id, status, totalPrice, cart } = order;

    return {
      orderId: id,
      status,
      totalPrice,
      cart: cart.map((cartRow) => this.getCartFromDb(cartRow)),
    };
  }

  getCartFromDb(cart: any) {
    const { id, quantity, product } = cart;
    const productRow = this.getProductFromDb(product);
    return { cartId: id, quantity, ...productRow };
  }

  getProductFromDb(product: any) {
    const { id, title, description, picture, price } = product;
    return {
      productId: id,
      title,
      description,
      picture,
      price,
    };
  }
}
