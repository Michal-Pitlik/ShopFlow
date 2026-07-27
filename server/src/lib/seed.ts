import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@shopflow.com" },
    update: {},
    create: {
      email: "admin@shopflow.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customerPassword = await bcrypt.hash("customer123", 10);
  await prisma.user.upsert({
    where: { email: "customer@shopflow.com" },
    update: {},
    create: {
      email: "customer@shopflow.com",
      name: "Jane Doe",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  const products = [
    {
      name: "Wireless Headphones",
      description: "Premium noise-cancelling over-ear headphones with 30hr battery life.",
      price: 79.99,
      stock: 50,
      category: "Electronics",
      imageUrl: "https://placehold.co/400x400?text=Headphones",
    },
    {
      name: "Mechanical Keyboard",
      description: "Compact TKL mechanical keyboard with RGB backlighting and tactile switches.",
      price: 99.99,
      stock: 30,
      category: "Electronics",
      imageUrl: "https://placehold.co/400x400?text=Keyboard",
    },
    {
      name: "Running Shoes",
      description: "Lightweight breathable running shoes with responsive cushioning.",
      price: 59.99,
      stock: 100,
      category: "Footwear",
      imageUrl: "https://placehold.co/400x400?text=Shoes",
    },
    {
      name: "Yoga Mat",
      description: "Non-slip eco-friendly yoga mat, 6mm thick with carrying strap.",
      price: 29.99,
      stock: 75,
      category: "Sports",
      imageUrl: "https://placehold.co/400x400?text=Yoga+Mat",
    },
    {
      name: "Coffee Maker",
      description: "12-cup programmable coffee maker with built-in grinder and thermal carafe.",
      price: 89.99,
      stock: 20,
      category: "Kitchen",
      imageUrl: "https://placehold.co/400x400?text=Coffee+Maker",
    },
    {
      name: "Backpack",
      description: "Water-resistant 30L travel backpack with USB charging port and laptop sleeve.",
      price: 49.99,
      stock: 60,
      category: "Bags",
      imageUrl: "https://placehold.co/400x400?text=Backpack",
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ Seed complete!");
  console.log("   Admin:    admin@shopflow.com / admin123");
  console.log("   Customer: customer@shopflow.com / customer123");
  console.log(`   Products: ${products.length} items created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
