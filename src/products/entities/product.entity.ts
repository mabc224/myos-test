export class DbProduct {
  productId: number;
  title: string;
  description: string;
  picture: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiProduct {
  productId: number;
  title: string;
  description: string;
  picture: string;
  price: number;
}
