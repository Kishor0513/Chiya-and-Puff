'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import type { Order, OrderStatus, Table } from '@/types';
import { ArrowLeft, CheckCircle, Clock, Receipt, Utensils } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
	PENDING: 'PREPARING',
	PREPARING: null,
	DELIVERED: 'BILLED',
	BILLED: null,
};

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; color: string; icon: React.ReactNode }
> = {
	PENDING: { label: 'Pending', color: '#F5A623', icon: <Clock size={14} /> },
	PREPARING: {
		label: 'Preparing',
		color: '#4A90E2',
		icon: <Utensils size={14} />,
	},
	DELIVERED: {
		label: 'Delivered',
		color: '#00A699',
		icon: <CheckCircle size={14} />,
	},
	BILLED: { label: 'Billed', color: '#9B59B6', icon: <Receipt size={14} /> },
};

export default function WaiterTablePage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [table, setTable] = useState<Table | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
	const [billingAll, setBillingAll] = useState(false);
	const { toasts, toast, dismiss } = useToast();

	const fetchData = useCallback(async () => {
		try {
			const [tableRes, ordersRes] = await Promise.all([
				fetch(`/api/tables/${id}`),
				fetch(`/api/orders?tableId=${id}`),
			]);
			if (tableRes.ok) setTable(await tableRes.json());
			if (ordersRes.ok) setOrders(await ordersRes.json());
		} catch {
			// silent poll
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 10_000);
		return () => clearInterval(interval);
	}, [fetchData]);

	const advanceOrderStatus = async (order: Order) => {
		const next = ORDER_STATUS_FLOW[order.status as OrderStatus];
		if (!next) return;
		setUpdatingOrder(order.id);
		try {
			const res = await fetch(`/api/orders/${order.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: next }),
			});
			if (res.ok) {
				setOrders((prev) =>
					prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)),
				);
				toast(`Order marked as ${next.toLowerCase()}`, 'success');
			} else {
				toast('Failed to update order status', 'error');
			}
		} catch {
			toast('Network error', 'error');
		} finally {
			setUpdatingOrder(null);
		}
	};

	const handleBillAll = async () => {
		const billableOrders = orders.filter((o) => o.status !== 'BILLED');
		if (billableOrders.length === 0) {
			toast('No active orders to bill', 'info');
			return;
		}
		setBillingAll(true);
		try {
			await Promise.all(
				billableOrders.map((o) =>
					fetch(`/api/orders/${o.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'BILLED' }),
					}),
				),
			);
			const total = billableOrders.reduce((sum, o) => sum + o.totalAmount, 0);
			setOrders((prev) =>
				prev.map((o) =>
					o.status !== 'BILLED' ? { ...o, status: 'BILLED' as OrderStatus } : o,
				),
			);
			toast(`Bill generated! Total: Rs. ${total.toLocaleString()}`, 'success');
			setTimeout(() => router.push('/waiter'), 1500);
		} catch {
			toast('Failed to generate bill', 'error');
		} finally {
			setBillingAll(false);
		}
	};

	const handleMarkServiced = async () => {
		try {
			const res = await fetch(`/api/tables/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'AVAILABLE' }),
			});
			if (res.ok) {
				toast('Table marked as available', 'success');
				setTimeout(() => router.push('/waiter'), 1000);
			} else {
				toast('Failed to update table', 'error');
			}
		} catch {
			toast('Network error', 'error');
		}
	};

	if (loading) {
		return (
			<div style={{ padding: '2rem' }}>
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="glass-panel"
						style={{
							padding: '1.5rem',
							marginBottom: '1rem',
							height: '100px',
							opacity: 0.5,
						}}
					/>
				))}
			</div>
		);
	}

	if (!table) {
		return (
			<div
				className="glass-panel"
				style={{ padding: '3rem', textAlign: 'center' }}
			>
				<p style={{ color: 'var(--text-secondary)' }}>Table not found.</p>
			</div>
		);
	}

	const activeOrders = orders.filter((o) => o.status !== 'BILLED');
	const totalRevenue = orders
		.filter((o) => o.status !== 'BILLED')
		.reduce((sum, o) => sum + o.totalAmount, 0);

	return (
		<div>
			<ToastContainer
				toasts={toasts}
				dismiss={dismiss}
			/>

			{/* Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
					marginBottom: '2rem',
				}}
			>
				<button
					onClick={() => router.push('/waiter')}
					style={{
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						color: 'var(--text-secondary)',
						display: 'flex',
					}}
				>
					<ArrowLeft size={20} />
				</button>
				<h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
					Table {table.tableNumber}
				</h1>
				<span
					style={{
						background:
							table.status === 'NEEDS_SERVICE'
								? '#FF5A5F20'
								: table.status === 'BILL_REQUESTED'
									? '#9B59B620'
									: table.status === 'OCCUPIED'
										? '#F5A62320'
										: '#00A69920',
						color:
							table.status === 'NEEDS_SERVICE'
								? '#FF5A5F'
								: table.status === 'BILL_REQUESTED'
									? '#9B59B6'
									: table.status === 'OCCUPIED'
										? '#F5A623'
										: '#00A699',
						borderRadius: '20px',
						padding: '0.25rem 0.75rem',
						fontSize: '0.8rem',
						fontWeight: 600,
					}}
				>
					{table.status.replace('_', ' ')}
				</span>
			</div>

			{/* Action Buttons */}
			<div
				style={{
					display: 'flex',
					gap: '0.75rem',
					marginBottom: '1.5rem',
					flexWrap: 'wrap',
				}}
			>
				{totalRevenue > 0 && (
					<button
						onClick={handleBillAll}
						disabled={billingAll}
						style={{
							background: '#9B59B6',
							color: '#fff',
							border: 'none',
							borderRadius: '10px',
							padding: '0.65rem 1.25rem',
							fontWeight: 600,
							cursor: billingAll ? 'not-allowed' : 'pointer',
							opacity: billingAll ? 0.7 : 1,
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							fontSize: '0.875rem',
						}}
					>
						<Receipt size={16} />
						{billingAll
							? 'Generating…'
							: `Generate Bill (Rs. ${totalRevenue.toLocaleString()})`}
					</button>
				)}
				<button
					onClick={handleMarkServiced}
					style={{
						background: 'var(--glass)',
						border: '1px solid var(--glass-border)',
						borderRadius: '10px',
						padding: '0.65rem 1.25rem',
						fontWeight: 600,
						cursor: 'pointer',
						color: 'var(--text-primary)',
						fontSize: '0.875rem',
					}}
				>
					Mark Table Available
				</button>
			</div>

			{/* Orders */}
			{activeOrders.length === 0 ? (
				<div
					className="glass-panel"
					style={{ padding: '2.5rem', textAlign: 'center' }}
				>
					<p style={{ color: 'var(--text-secondary)', margin: 0 }}>
						No active orders for this table.
					</p>
				</div>
			) : (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					{activeOrders.map((order) => {
						const cfg = STATUS_CONFIG[order.status as OrderStatus];
						const next = ORDER_STATUS_FLOW[order.status as OrderStatus];
						return (
							<div
								key={order.id}
								className="glass-panel"
								style={{ padding: '1.25rem' }}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: '1rem',
									}}
								>
									<div>
										<span style={{ fontWeight: 700 }}>
											Order #{order.id.slice(-6).toUpperCase()}
										</span>
										<span
											style={{
												color: 'var(--text-secondary)',
												fontSize: '0.8rem',
												marginLeft: '0.5rem',
											}}
										>
											{new Date(order.createdAt).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '0.75rem',
										}}
									>
										<span
											style={{
												background: cfg.color + '20',
												color: cfg.color,
												borderRadius: '20px',
												padding: '0.25rem 0.65rem',
												fontSize: '0.75rem',
												fontWeight: 600,
												display: 'flex',
												alignItems: 'center',
												gap: '0.3rem',
											}}
										>
											{cfg.icon} {cfg.label}
										</span>
										{next && (
											<button
												onClick={() => advanceOrderStatus(order)}
												disabled={updatingOrder === order.id}
												style={{
													background: 'var(--primary)',
													color: '#fff',
													border: 'none',
													borderRadius: '8px',
													padding: '0.4rem 0.85rem',
													fontSize: '0.8rem',
													fontWeight: 600,
													cursor:
														updatingOrder === order.id
															? 'not-allowed'
															: 'pointer',
													opacity: updatingOrder === order.id ? 0.7 : 1,
												}}
											>
												{updatingOrder === order.id
													? '…'
													: `Mark ${next.charAt(0) + next.slice(1).toLowerCase()}`}
											</button>
										)}
										{order.status === 'PREPARING' && (
											<span
												style={{
													fontSize: '0.75rem',
													fontWeight: 600,
													color: '#4A90E2',
												}}
											>
												Waiting for kitchen to mark ready
											</span>
										)}
									</div>
								</div>

								<div
									style={{
										borderTop: '1px solid var(--glass-border)',
										paddingTop: '0.75rem',
									}}
								>
									{order.items &&
										order.items.map((item) => (
											<div
												key={item.id}
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													padding: '0.3rem 0',
													fontSize: '0.875rem',
												}}
											>
												<span style={{ color: 'var(--text-secondary)' }}>
													{item.quantity}x {item.menuItem?.name || 'Item'}
												</span>
												<span style={{ fontWeight: 600 }}>
													Rs. {item.subTotal}
												</span>
											</div>
										))}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											marginTop: '0.5rem',
											paddingTop: '0.5rem',
											borderTop: '1px solid var(--glass-border)',
											fontWeight: 700,
										}}
									>
										<span>Total</span>
										<span>Rs. {order.totalAmount.toLocaleString()}</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
