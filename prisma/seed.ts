/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const generatedProducts = [];
  for (let i = 0; i < 10; i++) {
    const data = {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      picture: faker.image.nature(),
      price: parseFloat(faker.commerce.price(1, 10, 0)),
      quantity: parseInt(faker.commerce.price(100, 200, 0), 10),
    };
    generatedProducts.push(data);
  }
  await prisma.product.createMany({
    data: generatedProducts,
  });

  const generatedUsers = [];
  for (let i = 0; i < 10; i++) {
    const data = {
      name: faker.name.fullName(),
    };
    generatedUsers.push(data);
  }
  await prisma.user.createMany({
    data: generatedUsers,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
