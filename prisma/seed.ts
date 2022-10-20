/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.create({
    data: {
      title: 'some title',
      description: 'some desc',
      picture:
        'https://4.img-dpreview.com/files/p/E~C667x0S5333x4000T1200x900~articles/3925134721/0266554465.jpeg',
      price: 10.5,
      quantity: 10,
    },
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
