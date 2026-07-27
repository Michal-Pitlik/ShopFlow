import { User } from "@prisma/client";
import { Request } from "express";

// Extend Express Request to include the authenticated user
export interface AuthRequest extends Request {
  user: User;
}

// JWT payload shape
export interface JwtPayload {
  userId: number;
}

// Request body types
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshBody {
  refreshToken: string;
}

export interface CreateProductBody {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderBody {
  items: OrderItem[];
}

export interface UpdateOrderStatusBody {
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

// Query param types
export interface ProductsQuery {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

export interface OrdersQuery {
  status?: string;
  page?: string;
  limit?: string;
}
