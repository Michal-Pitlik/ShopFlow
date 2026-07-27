import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  Order,
  OrdersResponse,
  AdminStats,
  OrderStatus,
} from "@/types";

export const shopApi = createApi({
  reducerPath: "shopApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product", "Order", "Category"],
  endpoints: (builder) => ({
    // ─── Products ──────────────────────────────────────────────────────────
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      query: (filters = {}) => ({
        url: "/products",
        params: filters,
      }),
      providesTags: ["Product"],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Product", id }],
    }),

    getCategories: builder.query<string[], void>({
      query: () => "/products/categories",
      providesTags: ["Category"],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product", "Category"],
    }),

    updateProduct: builder.mutation<Product, { id: number } & Partial<Product>>({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Category"],
    }),

    // ─── Orders ────────────────────────────────────────────────────────────
    createOrder: builder.mutation<Order, { items: { productId: number; quantity: number }[] }>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order", "Product"],
    }),

    getMyOrders: builder.query<Order[], void>({
      query: () => "/orders/my",
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Order", id }],
    }),

    getAllOrders: builder.query<OrdersResponse, { status?: string; page?: number }>({
      query: (params = {}) => ({ url: "/orders", params }),
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<Order, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Order"],
    }),

    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/orders/admin/stats",
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminStatsQuery,
} = shopApi;
