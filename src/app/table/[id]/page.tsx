'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import type { CartItem, MenuItem, Order, OrderStatus } from '@/types';
import {
	Banknote,
	Bell,
	CheckCircle,
	Clock,
	CreditCard,
	Minus,
	PartyPopper,
	Plus,
	Receipt,
	Search,
	ShoppingCart,
	Utensils,
	X,
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Tab = 'menu' | 'orders';
type PayMethod = 'cash' | 'esewa' | 'khalti' | 'fonepay';

const ORDER_STEPS: {
	status: OrderStatus;
	label: string;
	color: string;
	icon: React.ReactNode;
}[] = [
	{
		status: 'PENDING',
		label: 'Order Received',
		color: '#F5A623',
		icon: <Clock size={13} />,
	},
	{
		status: 'PREPARING',
		label: 'Being Prepared',
		color: '#4A90E2',
		icon: <Utensils size={13} />,
	},
	{
		status: 'DELIVERED',
		label: 'Delivered',
		color: '#00A699',
		icon: <CheckCircle size={13} />,
	},
];

const statusStep: Record<OrderStatus, number> = {
	PENDING: 0,
	PREPARING: 1,
	DELIVERED: 2,
	BILLED: 3,
};

export default function CustomerMenuPage() {
	const { id } = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') || '';

	const [tab, setTab] = useState<Tab>('menu');
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [search, setSearch] = useState('');
	const [menuLoading, setMenuLoading] = useState(true);
	const [showCart, setShowCart] = useState(false);
	const [orderLoading, setOrderLoading] = useState(false);
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [showPayment, setShowPayment] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<PayMethod>('cash');
	const { toasts, toast, dismiss } = useToast();

	useEffect(() => {
		fetch('/api/menu')
			.then((r) => r.json())
			.then((data: MenuItem[]) => setMenuItems(data.filter((m) => m.available)))
			.catch(() => toast('Failed to load menu', 'error'))
			.finally(() => setMenuLoading(false));
	}, []);

	const fetchOrders = useCallback(async () => {
		try {
			const res = await fetch(`/api/orders?tableId=${id}`);
			if (res.ok) {
				const data: Order[] = await res.json();
				setOrders(data);
			}
		} catch {
			// silent poll
		}
	}, [id]);

	useEffect(() => {
		fetchOrders();
		const interval = setInterval(fetchOrders, 8_000);
		return () => clearInterval(interval);
	}, [fetchOrders]);

	const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
	const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
	const activeOrders = orders.filter((o) => o.status !== 'BILLED');
	const billedOrders = orders.filter((o) => o.status === 'BILLED');
	const orderTotal = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
	const billedTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);

	// Auto-show payment modal when waiter delivers the bill
	useEffect(() => {
		if (billedOrders.length > 0 && !showPayment) {
			setShowPayment(true);
			setTab('orders');
		}
	}, [billedOrders.length]); // eslint-disable-line react-hooks/exhaustive-deps

	const updateCart = (item: MenuItem, delta: number) => {
		setCart((prev) => {
			const existing = prev.find((c) => c.id === item.id);
			if (existing) {
				const newQty = existing.quantity + delta;
				if (newQty <= 0) return prev.filter((c) => c.id !== item.id);
				return prev.map((c) =>
					c.id === item.id ? { ...c, quantity: newQty } : c,
				);
			}
			if (delta > 0)
				return [
					...prev,
					{ id: item.id, name: item.name, price: item.price, quantity: 1 },
				];
			return prev;
		});
		if (delta > 0) toast(`${item.name} added to cart`, 'success');
	};

	const handlePlaceOrder = async () => {
		if (cart.length === 0) return;
		setOrderLoading(true);
		try {
			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tableId: id,
					token,
					items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity })),
				}),
			});
			if (res.ok) {
				setCart([]);
				setShowCart(false);
				await fetchOrders();
				setTab('orders');
				toast('Order placed! Track it in "My Orders"', 'success');
			} else {
				const err = await res.json();
				toast(err.error || 'Failed to place order', 'error');
			}
		} catch {
			toast('Network error. Please try again.', 'error');
		} finally {
			setOrderLoading(false);
		}
	};

	const handleCancelOrder = async (orderId: string) => {
		setCancellingId(orderId);
		try {
			const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
			if (res.ok) {
				await fetchOrders();
				toast('Order cancelled successfully', 'success');
			} else {
				const err = await res.json();
				toast(err.error || 'Cannot cancel this order', 'error');
			}
		} catch {
			toast('Network error', 'error');
		} finally {
			setCancellingId(null);
		}
	};

	const handleCallWaiter = async () => {
		try {
			const res = await fetch('/api/tables', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tableId: id, token, status: 'NEEDS_SERVICE' }),
			});
			if (res.ok) toast('Waiter has been notified!', 'success');
			else toast('Could not signal waiter. Please try again.', 'error');
		} catch {
			toast('Network error', 'error');
		}
	};

	const categories = Array.from(new Set(menuItems.map((m) => m.category)));
	const filtered = menuItems.filter(
		(m) =>
			m.name.toLowerCase().includes(search.toLowerCase()) ||
			m.category.toLowerCase().includes(search.toLowerCase()),
	);
	const itemQty = (itemId: string) =>
		cart.find((c) => c.id === itemId)?.quantity ?? 0;

	return (
		<div
			style={{
				minHeight: '100vh',
				background: 'var(--bg)',
				paddingBottom: '5rem',
			}}
		>
			<ToastContainer
				toasts={toasts}
				dismiss={dismiss}
			/>

			{/* Sticky Header */}
			<div
				style={{
					padding: '0.9rem 1.25rem',
					borderBottom: '1px solid var(--glass-border)',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					background: 'var(--glass)',
					backdropFilter: 'blur(12px)',
					position: 'sticky',
					top: 0,
					zIndex: 30,
				}}
			>
				<div>
					<h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
						Chiya &amp; Puff
					</h1>
					<p
						style={{
							margin: 0,
							fontSize: '0.72rem',
							color: 'var(--text-secondary)',
						}}
					>
						Table #{id.slice(-4).toUpperCase()}
					</p>
				</div>
				<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
					<button
						onClick={handleCallWaiter}
						style={{
							background: '#FF5A5F20',
							color: '#FF5A5F',
							border: '1px solid #FF5A5F40',
							borderRadius: '10px',
							padding: '0.45rem 0.75rem',
							cursor: 'pointer',
							fontWeight: 600,
							fontSize: '0.78rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.35rem',
						}}
					>
						<Bell size={13} /> Call Waiter
					</button>
					{cartCount > 0 && (
						<button
							onClick={() => setShowCart(true)}
							style={{
								background: 'var(--primary)',
								color: '#fff',
								border: 'none',
								borderRadius: '10px',
								padding: '0.45rem 0.9rem',
								cursor: 'pointer',
								fontWeight: 600,
								fontSize: '0.85rem',
								display: 'flex',
								alignItems: 'center',
								gap: '0.35rem',
							}}
						>
							<ShoppingCart size={15} /> {cartCount}
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div
				style={{
					display: 'flex',
					borderBottom: '1px solid var(--glass-border)',
					background: 'var(--glass)',
					position: 'sticky',
					top: '60px',
					zIndex: 20,
				}}
			>
				{(['menu', 'orders'] as Tab[]).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						style={{
							flex: 1,
							padding: '0.8rem',
							border: 'none',
							background: 'none',
							cursor: 'pointer',
							fontWeight: 600,
							fontSize: '0.9rem',
							color: tab === t ? 'var(--primary)' : 'var(--text-secondary)',
							borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
							transition: 'all 0.2s',
							position: 'relative',
						}}
					>
						{t === 'menu' ? 'Menu' : 'My Orders'}
						{t === 'orders' && orders.length > 0 && (
							<span
								style={{
									background: '#FF5A5F',
									color: '#fff',
									borderRadius: '50%',
									width: '18px',
									height: '18px',
									fontSize: '0.65rem',
									fontWeight: 700,
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginLeft: '0.4rem',
									verticalAlign: 'middle',
								}}
							>
								{orders.length}
							</span>
						)}
					</button>
				))}
			</div>

			{/* MENU TAB */}
			{tab === 'menu' && (
				<div style={{ padding: '1.25rem' }}>
					<div style={{ position: 'relative', marginBottom: '1.25rem' }}>
						<Search
							size={15}
							style={{
								position: 'absolute',
								left: '0.85rem',
								top: '50%',
								transform: 'translateY(-50%)',
								color: 'var(--text-secondary)',
							}}
						/>
						<input
							type="text"
							placeholder="Search menu…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							style={{
								width: '100%',
								padding: '0.6rem 0.9rem 0.6rem 2.2rem',
								background: 'var(--glass)',
								border: '1px solid var(--glass-border)',
								borderRadius: '10px',
								color: 'var(--text-primary)',
								fontSize: '0.9rem',
								boxSizing: 'border-box',
							}}
						/>
					</div>
					{menuLoading ? (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '0.6rem',
							}}
						>
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="glass-panel"
									style={{ height: '70px', opacity: 0.4 }}
								/>
							))}
						</div>
					) : filtered.length === 0 ? (
						<div
							style={{
								textAlign: 'center',
								padding: '3rem',
								color: 'var(--text-secondary)',
							}}
						>
							<Search
								size={32}
								style={{ margin: '0 auto 0.75rem', opacity: 0.4 }}
							/>
							<p>No items match &quot;{search}&quot;</p>
						</div>
					) : (
						<>
							{categories.map((cat) => {
								const items = filtered.filter((m) => m.category === cat);
								if (!items.length) return null;
								return (
									<div
										key={cat}
										style={{ marginBottom: '1.75rem' }}
									>
										<h2
											style={{
												fontSize: '0.75rem',
												fontWeight: 700,
												margin: '0 0 0.65rem',
												color: 'var(--text-secondary)',
												textTransform: 'uppercase',
												letterSpacing: '0.07em',
											}}
										>
											{cat}
										</h2>
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '0.6rem',
											}}
										>
											{items.map((item) => {
												const qty = itemQty(item.id);
												return (
													<div
														key={item.id}
														className="glass-panel"
														style={{
															padding: '0.9rem 1rem',
															display: 'flex',
															justifyContent: 'space-between',
															alignItems: 'center',
															gap: '0.75rem',
														}}
													>
														<div style={{ flex: 1, minWidth: 0 }}>
															<div
																style={{ fontWeight: 700, fontSize: '0.9rem' }}
															>
																{item.name}
															</div>
															{item.description && (
																<div
																	style={{
																		color: 'var(--text-secondary)',
																		fontSize: '0.72rem',
																		marginTop: '0.1rem',
																		overflow: 'hidden',
																		textOverflow: 'ellipsis',
																		whiteSpace: 'nowrap',
																	}}
																>
																	{item.description}
																</div>
															)}
															<div
																style={{
																	fontWeight: 700,
																	color: 'var(--primary)',
																	fontSize: '0.88rem',
																	marginTop: '0.3rem',
																}}
															>
																Rs. {item.price}
															</div>
														</div>
														<div style={{ flexShrink: 0 }}>
															{qty === 0 ? (
																<button
																	onClick={() => updateCart(item, 1)}
																	style={{
																		background: 'var(--primary)',
																		color: '#fff',
																		border: 'none',
																		borderRadius: '8px',
																		padding: '0.4rem 0.9rem',
																		cursor: 'pointer',
																		fontWeight: 600,
																		fontSize: '0.85rem',
																		display: 'flex',
																		alignItems: 'center',
																		gap: '0.25rem',
																	}}
																>
																	<Plus size={13} /> Add
																</button>
															) : (
																<div
																	style={{
																		display: 'flex',
																		alignItems: 'center',
																		gap: '0.4rem',
																	}}
																>
																	<button
																		onClick={() => updateCart(item, -1)}
																		style={{
																			background: 'var(--glass)',
																			border: '1px solid var(--glass-border)',
																			borderRadius: '7px',
																			padding: '0.3rem 0.45rem',
																			cursor: 'pointer',
																			color: 'var(--text-primary)',
																		}}
																	>
																		<Minus size={13} />
																	</button>
																	<span
																		style={{
																			fontWeight: 700,
																			minWidth: '1.25rem',
																			textAlign: 'center',
																		}}
																	>
																		{qty}
																	</span>
																	<button
																		onClick={() => updateCart(item, 1)}
																		style={{
																			background: 'var(--primary)',
																			border: 'none',
																			borderRadius: '7px',
																			padding: '0.3rem 0.45rem',
																			cursor: 'pointer',
																			color: '#fff',
																		}}
																	>
																		<Plus size={13} />
																	</button>
																</div>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</>
					)}
				</div>
			)}

			{/* MY ORDERS TAB */}
			{tab === 'orders' && (
				<div style={{ padding: '1.25rem' }}>
					{activeOrders.length === 0 && billedOrders.length === 0 ? (
						<div
							style={{
								textAlign: 'center',
								padding: '3rem',
								color: 'var(--text-secondary)',
							}}
						>
							<ShoppingCart
								size={36}
								style={{ margin: '0 auto 0.75rem', opacity: 0.3 }}
							/>
							<p
								style={{
									margin: 0,
									fontWeight: 600,
									color: 'var(--text-primary)',
								}}
							>
								No active orders
							</p>
							<p style={{ margin: '0.4rem 0 1.5rem', fontSize: '0.85rem' }}>
								Browse the menu and place your first order!
							</p>
							<button
								onClick={() => setTab('menu')}
								style={{
									background: 'var(--primary)',
									color: '#fff',
									border: 'none',
									borderRadius: '10px',
									padding: '0.65rem 1.5rem',
									cursor: 'pointer',
									fontWeight: 600,
								}}
							>
								Go to Menu
							</button>
						</div>
					) : (
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
						>
							<div
								style={{
									background: 'var(--glass)',
									border: '1px solid var(--glass-border)',
									borderRadius: '10px',
									padding: '0.6rem 1rem',
									fontSize: '0.78rem',
									color: 'var(--text-secondary)',
									display: 'flex',
									alignItems: 'center',
									gap: '0.5rem',
								}}
							>
								<span style={{ color: '#00A699', fontSize: '1rem' }}>
									&#8635;
								</span>{' '}
								Status updates live every 8 seconds
							</div>
							{billedOrders.length > 0 && (
								<button
									onClick={() => setShowPayment(true)}
									style={{ width: '100%', background: '#9B59B6', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
								>
									<Receipt size={18} /> View Bill &amp; Pay — Rs. {billedTotal.toLocaleString()}
								</button>
							)}
							{activeOrders.map((order) => {
								const step = statusStep[order.status as OrderStatus];
								const activeColor =
									ORDER_STEPS[Math.min(step, 2)]?.color ?? '#9B59B6';
								return (
									<div
										key={order.id}
										className="glass-panel"
										style={{
											padding: '1.25rem',
											borderLeft: `4px solid ${activeColor}`,
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'flex-start',
												marginBottom: '1rem',
											}}
										>
											<div>
												<div style={{ fontWeight: 700 }}>
													Order #{order.id.slice(-6).toUpperCase()}
												</div>
												<div
													style={{
														color: 'var(--text-secondary)',
														fontSize: '0.75rem',
													}}
												>
													{new Date(order.createdAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
											</div>
											<span
												style={{
													background: activeColor + '22',
													color: activeColor,
													borderRadius: '20px',
													padding: '0.25rem 0.75rem',
													fontSize: '0.75rem',
													fontWeight: 700,
													display: 'flex',
													alignItems: 'center',
													gap: '0.3rem',
												}}
											>
												{ORDER_STEPS[Math.min(step, 2)]?.icon}{' '}
												{ORDER_STEPS[Math.min(step, 2)]?.label}
											</span>
										</div>
										{/* Progress bar */}
										<div
											style={{
												display: 'flex',
												marginBottom: '1.1rem',
												position: 'relative',
											}}
										>
											<div
												style={{
													position: 'absolute',
													top: '11px',
													left: '11px',
													right: '11px',
													height: '2px',
													background: 'var(--glass-border)',
													zIndex: 0,
												}}
											/>
											<div
												style={{
													position: 'absolute',
													top: '11px',
													left: '11px',
													height: '2px',
													background: 'var(--primary)',
													zIndex: 0,
													width:
														step === 0 ? '0%' : step === 1 ? '50%' : '100%',
													transition: 'width 0.5s ease',
												}}
											/>
											{ORDER_STEPS.map((s, i) => {
												const done = step > i;
												const active = step === i;
												return (
													<div
														key={s.status}
														style={{
															flex: 1,
															display: 'flex',
															flexDirection: 'column',
															alignItems: 'center',
															gap: '0.35rem',
															zIndex: 1,
														}}
													>
														<div
															style={{
																width: '22px',
																height: '22px',
																borderRadius: '50%',
																background: done
																	? 'var(--primary)'
																	: active
																		? s.color
																		: 'var(--bg)',
																border: `2px solid ${done ? 'var(--primary)' : active ? s.color : 'var(--glass-border)'}`,
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																fontSize: '0.7rem',
																color:
																	done || active
																		? '#fff'
																		: 'var(--text-secondary)',
																fontWeight: 700,
																transition: 'all 0.3s',
															}}
														>
															{done ? '✓' : i + 1}
														</div>
														<span
															style={{
																fontSize: '0.62rem',
																textAlign: 'center',
																color: active
																	? s.color
																	: done
																		? 'var(--text-primary)'
																		: 'var(--text-secondary)',
																fontWeight: active ? 700 : 400,
																lineHeight: 1.2,
															}}
														>
															{s.label}
														</span>
													</div>
												);
											})}
										</div>
										{/* Items */}
										<div
											style={{
												borderTop: '1px solid var(--glass-border)',
												paddingTop: '0.75rem',
											}}
										>
											{order.items?.map((item) => (
												<div
													key={item.id}
													style={{
														display: 'flex',
														justifyContent: 'space-between',
														fontSize: '0.85rem',
														padding: '0.2rem 0',
													}}
												>
													<span style={{ color: 'var(--text-secondary)' }}>
														{item.quantity}&times; {item.menuItem?.name}
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
													fontWeight: 700,
													marginTop: '0.6rem',
													paddingTop: '0.5rem',
													borderTop: '1px solid var(--glass-border)',
												}}
											>
												<span>Subtotal</span>
												<span>Rs. {order.totalAmount.toLocaleString()}</span>
											</div>
										</div>
										{order.status === 'PENDING' && (
											<button
												onClick={() => handleCancelOrder(order.id)}
												disabled={cancellingId === order.id}
												style={{
													marginTop: '0.85rem',
													background: '#FF5A5F18',
													color: '#FF5A5F',
													border: '1px solid #FF5A5F40',
													borderRadius: '8px',
													padding: '0.45rem 1rem',
													cursor:
														cancellingId === order.id
															? 'not-allowed'
															: 'pointer',
													fontWeight: 600,
													fontSize: '0.8rem',
													opacity: cancellingId === order.id ? 0.6 : 1,
												}}
											>
												{cancellingId === order.id
													? 'Cancelling…'
													: '✕ Cancel Order'}
											</button>
										)}
									</div>
								);
							})}
							{/* Running Bill */}
							{orderTotal > 0 && billedOrders.length === 0 && (
								<div
									className="glass-panel"
									style={{ padding: '1.25rem', borderTop: '3px solid #9B59B6' }}
								>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: '0.75rem',
										}}
									>
										<span style={{ fontWeight: 700, fontSize: '1rem' }}>
											Running Bill
										</span>
										<Receipt
											size={18}
											color="#9B59B6"
										/>
									</div>
									{activeOrders.map((o) => (
										<div
											key={o.id}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												fontSize: '0.83rem',
												color: 'var(--text-secondary)',
												padding: '0.15rem 0',
											}}
										>
											<span>Order #{o.id.slice(-6).toUpperCase()}</span>
											<span>Rs. {o.totalAmount.toLocaleString()}</span>
										</div>
									))}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											fontWeight: 700,
											fontSize: '1.05rem',
											marginTop: '0.65rem',
											paddingTop: '0.6rem',
											borderTop: '1px solid var(--glass-border)',
										}}
									>
										<span>Total</span>
										<span style={{ color: '#9B59B6' }}>
											Rs. {orderTotal.toLocaleString()}
										</span>
									</div>
									<button
										onClick={handleCallWaiter}
										style={{
											width: '100%',
											marginTop: '0.85rem',
											background: '#9B59B6',
											color: '#fff',
											border: 'none',
											borderRadius: '10px',
											padding: '0.75rem',
											fontWeight: 700,
											cursor: 'pointer',
											fontSize: '0.95rem',
										}}
									>
										Request Bill
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Payment Modal */}
			{showPayment && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.75)',
						zIndex: 60,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '1rem',
					}}
				>
					<div
						className="glass-panel"
						style={{
							width: '100%',
							maxWidth: '420px',
							maxHeight: '90vh',
							overflowY: 'auto',
							borderRadius: '20px',
							padding: '1.75rem',
						}}
					>
						{/* Header */}
						<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
							<div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
								<PartyPopper
									size={40}
									color="#9B59B6"
									style={{ margin: '0 auto' }}
								/>
							</div>
							<h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
								Your Bill is Ready!
							</h2>
							<p
								style={{
									margin: '0.3rem 0 0',
									color: 'var(--text-secondary)',
									fontSize: '0.85rem',
								}}
							>
								Choose how you&apos;d like to pay
							</p>
						</div>

						{/* Bill Breakdown */}
						<div
							style={{
								background: 'var(--bg)',
								borderRadius: '12px',
								padding: '1rem',
								marginBottom: '1.25rem',
							}}
						>
							{orders.map((o) => (
								<div key={o.id}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											fontWeight: 600,
											fontSize: '0.8rem',
											color: 'var(--text-secondary)',
											padding: '0.25rem 0',
										}}
									>
										<span>Order #{o.id.slice(-6).toUpperCase()}</span>
										<span>Rs. {o.totalAmount.toLocaleString()}</span>
									</div>
									{o.items?.map((item) => (
										<div
											key={item.id}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												fontSize: '0.78rem',
												color: 'var(--text-secondary)',
												paddingLeft: '0.75rem',
												padding: '0.1rem 0 0.1rem 0.75rem',
											}}
										>
											<span>
												{item.quantity}&times; {item.menuItem?.name}
											</span>
											<span>Rs. {item.subTotal}</span>
										</div>
									))}
								</div>
							))}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontWeight: 700,
									fontSize: '1.1rem',
									marginTop: '0.75rem',
									paddingTop: '0.75rem',
									borderTop: '2px solid var(--glass-border)',
								}}
							>
								<span>Total</span>
								<span style={{ color: '#9B59B6' }}>
									Rs. {billedTotal.toLocaleString()}
								</span>
							</div>
						</div>

						{/* Payment Methods */}
						<p
							style={{
								margin: '0 0 0.65rem',
								fontWeight: 600,
								fontSize: '0.85rem',
							}}
						>
							Payment Method
						</p>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '0.6rem',
								marginBottom: '1.25rem',
							}}
						>
							{(
								[
									{
										key: 'cash',
										label: 'Cash',
										icon: '💵',
										color: '#27AE60',
										desc: 'Pay waiter directly',
									},
									{
										key: 'esewa',
										label: 'eSewa',
										icon: '🟢',
										color: '#60BB46',
										desc: 'Scan eSewa QR',
									},
									{
										key: 'khalti',
										label: 'Khalti',
										icon: '🟣',
										color: '#5C2D91',
										desc: 'Scan Khalti QR',
									},
									{
										key: 'fonepay',
										label: 'FonePay',
										icon: '🔴',
										color: '#E4002B',
										desc: 'Scan FonePay QR',
									},
								] as const
							).map((m) => (
								<button
									key={m.key}
									onClick={() => setPaymentMethod(m.key)}
									style={{
										background:
											paymentMethod === m.key ? m.color + '20' : 'var(--bg)',
										border: `2px solid ${paymentMethod === m.key ? m.color : 'var(--glass-border)'}`,
										borderRadius: '12px',
										padding: '0.75rem 0.5rem',
										cursor: 'pointer',
										textAlign: 'center',
										transition: 'all 0.2s',
									}}
								>
									<div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
										{m.icon}
									</div>
									<div
										style={{
											fontWeight: 700,
											fontSize: '0.85rem',
											color:
												paymentMethod === m.key
													? m.color
													: 'var(--text-primary)',
										}}
									>
										{m.label}
									</div>
									<div
										style={{
											fontSize: '0.68rem',
											color: 'var(--text-secondary)',
											marginTop: '0.15rem',
										}}
									>
										{m.desc}
									</div>
								</button>
							))}
						</div>

						{/* Payment Instructions */}
						{paymentMethod === 'cash' ? (
							<div
								style={{
									background: '#27AE6015',
									border: '1px solid #27AE6040',
									borderRadius: '12px',
									padding: '1rem',
									marginBottom: '1.25rem',
									textAlign: 'center',
								}}
							>
								<Banknote
									size={28}
									color="#27AE60"
									style={{ margin: '0 auto 0.5rem' }}
								/>
								<div
									style={{
										fontWeight: 700,
										fontSize: '1rem',
										color: '#27AE60',
									}}
								>
									Pay Rs. {billedTotal.toLocaleString()} in Cash
								</div>
								<div
									style={{
										color: 'var(--text-secondary)',
										fontSize: '0.82rem',
										marginTop: '0.35rem',
									}}
								>
									Hand the cash to your waiter. Thank you!
								</div>
							</div>
						) : (
							<div
								style={{
									background: 'var(--bg)',
									border: '1px solid var(--glass-border)',
									borderRadius: '12px',
									padding: '1rem',
									marginBottom: '1.25rem',
									textAlign: 'center',
								}}
							>
								<CreditCard
									size={28}
									color="var(--primary)"
									style={{ margin: '0 auto 0.5rem' }}
								/>
								<div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
									Scan to Pay Rs. {billedTotal.toLocaleString()}
								</div>
								<div
									style={{
										color: 'var(--text-secondary)',
										fontSize: '0.8rem',
										marginTop: '0.25rem',
									}}
								>
									Ask your waiter for the{' '}
									{paymentMethod === 'esewa'
										? 'eSewa'
										: paymentMethod === 'khalti'
											? 'Khalti'
											: 'FonePay'}{' '}
									QR code, or open the app and pay to the merchant account.
								</div>
							</div>
						)}

						<button
							onClick={() => {
								setShowPayment(false);
								toast('Thank you for dining at Chiya & Puff! 🙏', 'success');
							}}
							style={{
								width: '100%',
								background: '#9B59B6',
								color: '#fff',
								border: 'none',
								borderRadius: '12px',
								padding: '0.9rem',
								fontWeight: 700,
								fontSize: '1rem',
								cursor: 'pointer',
							}}
						>
							Done — Thank You! 🙏
						</button>
					</div>
				</div>
			)}
			{/* Cart Drawer */}
			{showCart && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.55)',
						zIndex: 50,
						display: 'flex',
						alignItems: 'flex-end',
					}}
					onClick={() => setShowCart(false)}
				>
					<div
						className="glass-panel"
						style={{
							width: '100%',
							maxHeight: '85vh',
							borderRadius: '20px 20px 0 0',
							padding: '1.5rem',
							overflowY: 'auto',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '1.25rem',
							}}
						>
							<h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
								Your Cart
							</h2>
							<button
								onClick={() => setShowCart(false)}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									color: 'var(--text-secondary)',
								}}
							>
								<X size={20} />
							</button>
						</div>
						{cart.map((item) => (
							<div
								key={item.id}
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									padding: '0.65rem 0',
									borderBottom: '1px solid var(--glass-border)',
								}}
							>
								<div>
									<div style={{ fontWeight: 600 }}>{item.name}</div>
									<div
										style={{
											color: 'var(--text-secondary)',
											fontSize: '0.8rem',
										}}
									>
										Rs. {item.price} each
									</div>
								</div>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.5rem',
									}}
								>
									<button
										onClick={() => {
											const mi = menuItems.find((m) => m.id === item.id);
											if (mi) updateCart(mi, -1);
										}}
										style={{
											background: 'var(--glass)',
											border: '1px solid var(--glass-border)',
											borderRadius: '8px',
											padding: '0.25rem 0.45rem',
											cursor: 'pointer',
											color: 'var(--text-primary)',
										}}
									>
										<Minus size={13} />
									</button>
									<span
										style={{
											fontWeight: 700,
											minWidth: '1.25rem',
											textAlign: 'center',
										}}
									>
										{item.quantity}
									</span>
									<button
										onClick={() => {
											const mi = menuItems.find((m) => m.id === item.id);
											if (mi) updateCart(mi, 1);
										}}
										style={{
											background: 'var(--primary)',
											border: 'none',
											borderRadius: '8px',
											padding: '0.25rem 0.45rem',
											cursor: 'pointer',
											color: '#fff',
										}}
									>
										<Plus size={13} />
									</button>
									<span
										style={{
											fontWeight: 700,
											minWidth: '3rem',
											textAlign: 'right',
										}}
									>
										Rs. {item.price * item.quantity}
									</span>
								</div>
							</div>
						))}
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								fontWeight: 700,
								fontSize: '1.1rem',
								margin: '1rem 0',
							}}
						>
							<span>Total</span>
							<span>Rs. {cartTotal.toLocaleString()}</span>
						</div>
						<button
							onClick={handlePlaceOrder}
							disabled={orderLoading}
							style={{
								width: '100%',
								background: 'var(--primary)',
								color: '#fff',
								border: 'none',
								borderRadius: '12px',
								padding: '0.9rem',
								fontWeight: 700,
								fontSize: '1rem',
								cursor: orderLoading ? 'not-allowed' : 'pointer',
								opacity: orderLoading ? 0.7 : 1,
							}}
						>
							{orderLoading ? 'Placing Order…' : 'Place Order'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
