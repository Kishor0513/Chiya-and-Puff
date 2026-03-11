import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'WAITER']);

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: UserRoleSchema.default('WAITER'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  createdAt: z.date().optional(),
});

export const MenuItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid image URL').or(z.literal('')).optional(),
  category: z.string().min(1, 'Category is required'),
  available: z.boolean().default(true),
});

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  subTotal: z.number().nonnegative(),
});

export const OrderStatusSchema = z.enum(['PENDING', 'PREPARING', 'DELIVERED', 'BILLED']);

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  tableId: z.string().uuid(),
  status: OrderStatusSchema.default('PENDING'),
  totalAmount: z.number().nonnegative(),
  items: z.array(OrderItemSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
export type MenuItemInput = z.infer<typeof MenuItemSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
