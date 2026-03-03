// Shared TypeScript types across the application

export type UserRole = 'ADMIN' | 'WAITER';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'NEEDS_SERVICE';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'DELIVERED' | 'BILLED';

export interface MenuItem {
	id: string;
	name: string;
	description: string | null;
	price: number;
	imageUrl: string | null;
	category: string;
	available: boolean;
}

export interface OrderItem {
	id: string;
	orderId: string;
	menuItemId: string;
	menuItem: MenuItem;
	quantity: number;
	subTotal: number;
}

export interface Order {
	id: string;
	tableId: string;
	table?: Table;
	status: OrderStatus;
	totalAmount: number;
	items: OrderItem[];
	createdAt: string;
	updatedAt: string;
}

export interface Table {
	id: string;
	tableNumber: number;
	status: TableStatus;
	qrData: string | null;
	orders: Order[];
}

export interface StaffMember {
	id: string;
	name: string;
	role: UserRole;
	createdAt: string;
}

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

export interface AdminStats {
	totalTables: number;
	occupiedTables: number;
	pendingOrders: number;
	totalStaff: number;
	todayRevenue: number;
	recentOrders: Array<{
		id: string;
		status: OrderStatus;
		totalAmount: number;
		createdAt: string;
		table: { tableNumber: number };
		items: Array<{
			quantity: number;
			menuItem: { name: string };
		}>;
	}>;
}
