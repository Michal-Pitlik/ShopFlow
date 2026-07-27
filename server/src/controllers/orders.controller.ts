import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  AuthRequest,
  CreateOrderBody,
  UpdateOrderStatusBody,
  OrdersQuery,
} from "../types";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { items } = req.body as CreateOrderBody;
  const userId = (req as AuthRequest).user.id;

  if (!items?.length) {
    res.status(400).json({ error: "Order must contain at least one item" });
    return;
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    res.status(400).json({ error: "One or more products not found" });
    return;
  }

  // Validate stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for "${product.name}" (available: ${product.stock})`,
      });
      return;
    }
  }

  // Calculate total
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  // Create order and decrement stock atomically
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total: Math.round(total * 100) / 100,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  res.status(201).json(order);
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
};

export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const authReq = req as unknown as AuthRequest;

  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Customers can only see their own orders
  if (authReq.user.role !== "ADMIN" && order.userId !== authReq.user.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(order);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllOrders = async (
  req: Request<object, object, object, OrdersQuery>,
  res: Response
): Promise<void> => {
  const { status, page = "1", limit = "20" } = req.query;

  const where = status ? { status: status as OrderStatus } : {};
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const updateOrderStatus = async (
  req: Request<{ id: string }, object, UpdateOrderStatusBody>,
  res: Response
): Promise<void> => {
  const validStatuses: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  const existing = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
  });

  res.json(order);
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const [totalOrders, revenueAgg, totalProducts, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  res.json({
    totalOrders,
    totalRevenue: revenueAgg._sum.total ?? 0,
    totalProducts,
    recentOrders,
  });
};
