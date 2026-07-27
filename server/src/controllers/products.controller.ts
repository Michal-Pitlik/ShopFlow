import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  CreateProductBody,
  UpdateProductBody,
  ProductsQuery,
} from "../types";

// ─── Public ──────────────────────────────────────────────────────────────────

export const getProducts = async (
  req: Request<object, object, object, ProductsQuery>,
  res: Response
): Promise<void> => {
  const { search, category, minPrice, maxPrice, page = "1", limit = "12" } = req.query;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category: { equals: category, mode: "insensitive" as const } }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    }),
  };

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  res.json(categories.map((c) => c.category));
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const createProduct = async (
  req: Request<object, object, CreateProductBody>,
  res: Response
): Promise<void> => {
  const { name, description, price, stock, category, imageUrl } = req.body;

  if (!name || !description || price == null || stock == null || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(String(price)),
      stock: parseInt(String(stock)),
      category,
      imageUrl,
    },
  });

  res.status(201).json(product);
};

export const updateProduct = async (
  req: Request<{ id: string }, object, UpdateProductBody>,
  res: Response
): Promise<void> => {
  const existing = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { name, description, price, stock, category, imageUrl } = req.body;

  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(String(price)) }),
      ...(stock !== undefined && { stock: parseInt(String(stock)) }),
      ...(category !== undefined && { category }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });

  res.json(product);
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const existing = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Product deleted" });
};
