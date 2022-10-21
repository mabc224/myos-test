export class DbOrder {
  orderId: number;
  userId: number;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DbCart {
  cartId: number;
  userId: number;
  productId: number;
  orderId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiOrder {
  orderId: number;
  status: string;
  totalPrice: number;
  cart: ApiCartItem[];
}

export class ApiCartItem {
  cartId: number;
  quantity: number;
  productId: number;
  title: string;
  description: string;
  picture: string;
  price: number;
}

export class ApiCartProductItem {
  productId: number;
  title: string;
  description: string;
  picture: string;
  price: number;
}
