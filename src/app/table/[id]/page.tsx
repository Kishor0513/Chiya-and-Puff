'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import type { CartItem, MenuItem } from '@/types';
import {
	Bell,
	CheckCircle,
	Minus,
	Plus,
	Search,
	ShoppingCart,
	X,
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CustomerMenuPage() {
	const { id } = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') || '';

	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [showCart, setShowCart] = useState(false);
	const [orderLoading, setOrderLoading] = useState(false);
	const [orderPlaced, setOrderPlaced] = useState(false);
	const { toasts, toast, dismiss } = useToast();

	useEffect(() => {
		fetch('/api/menu')
			.then((r) => r.json())
			.then((data: MenuItem[]) => setMenuItems(data.filter((m) => m.available)))
			.catch(() => toast('Failed to load menu', 'error'))
			.finally(() => setLoading(false));
	}, []);

	const cartTotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
			if (delta > 0) {
				return [
					...prev,
					{ id: item.id, name: item.name, price: item.price, quantity: 1 },
				];
			}
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
					items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity })),
				}),
			});
			if (res.ok) {
				setCart([]);
				setShowCart(false);
				setOrderPlaced(true);
				toast('Order placed successfully!', 'success');
				setTimeout(() => setOrderPlaced(false), 5000);
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

	const handleCallWaiter = async () => {
		try {
			const res = await fetch('/api/tables', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tableId: id, token, status: 'NEEDS_SERVICE' }),
			});
			if (res.ok) {
				toast('Waiter has been notified!', 'success');
			} else {
				toast('Could not signal waiter. Please try again.', 'error');
			}
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

	const itemQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;

	return (
		<div
			style={{
				minHeight: '100vh',
				background: 'var(--bg)',
				paddingBottom: '6rem',
			}}
		>
			<ToastContainer
				toasts={toasts}
				dismiss={dismiss}
			/>

			{/* Order Placed Banner */}
			{orderPlaced && (
				<div
					style={{
						background: '#00A699',
						color: '#fff',
						padding: '0.75rem 1.5rem',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						fontWeight: 600,
					}}
				>
					<CheckCircle size={18} />
					Your order has been placed! We&apos;ll start preparing it shortly.
				</div>
			)}

			{/* Header */}
			<div
				style={{
					padding: '1.5rem 1.5rem 1rem',
					borderBottom: '1px solid var(--glass-border)',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					background: 'var(--glass)',
					backdropFilter: 'blur(12px)',
					position: 'sticky',
					top: 0,
					zIndex: 20,
				}}
			>
				<div>
					<h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
						Chiya &amp; Puff
					</h1>
					<p
						style={{
							margin: 0,
							fontSize: '0.8rem',
							color: 'var(--text-secondary)',
						}}
					>
						Table #{id.slice(-4).toUpperCase()}
					</p>
				</div>
				<div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
					<button
						onClick={handleCallWaiter}
						style={{
							background: '#FF5A5F20',
							color: '#FF5A5F',
							border: '1px solid #FF5A5F40',
							borderRadius: '10px',
							padding: '0.5rem 0.85rem',
							cursor: 'pointer',
							fontWeight: 600,
							fontSize: '0.8rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.4rem',
						}}
					>
						<Bell size={14} />
						Call Waiter
					</button>
					{cartCount > 0 && (
						<button
							onClick={() => setShowCart(true)}
							style={{
								background: 'var(--primary)',
								color: '#fff',
								border: 'none',
								borderRadius: '10px',
								padding: '0.5rem 1rem',
								cursor: 'pointer',
								fontWeight: 600,
								fontSize: '0.85rem',
								display: 'flex',
								alignItems: 'center',
								gap: '0.4rem',
								position: 'relative',
							}}
						>
							<ShoppingCart size={16} />
							{cartCount}
						</button>
					)}
				</div>
			</div>

			<div style={{ padding: '1.25rem 1.5rem' }}>
				{/* Search */}
				<div style={{ position: 'relative', marginBottom: '1.5rem' }}>
					<Search
						size={16}
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
							padding: '0.65rem 0.9rem 0.65rem 2.25rem',
							background: 'var(--glass)',
							border: '1px solid var(--glass-border)',
							borderRadius: '10px',
							color: 'var(--text-primary)',
							fontSize: '0.9rem',
							boxSizing: 'border-box',
						}}
					/>
				</div>

				{/* Menu */}
				{loading ? (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
							gap: '1rem',
						}}
					>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="glass-panel"
								style={{ height: '180px', opacity: 0.5 }}
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
							if (items.length === 0) return null;
							return (
								<div
									key={cat}
									style={{ marginBottom: '2rem' }}
								>
									<h2
										style={{
											fontSize: '1rem',
											fontWeight: 700,
											margin: '0 0 0.75rem',
											color: 'var(--text-secondary)',
											textTransform: 'uppercase',
											letterSpacing: '0.05em',
										}}
									>
										{cat}
									</h2>
									<div
										style={{
											display: 'grid',
											gridTemplateColumns:
												'repeat(auto-fill, minmax(280px, 1fr))',
											gap: '0.85rem',
										}}
									>
										{items.map((item) => {
											const qty = itemQty(item.id);
											return (
												<div
													key={item.id}
													className="glass-panel"
													style={{
														padding: '1rem',
														display: 'flex',
														flexDirection: 'column',
														gap: '0.5rem',
													}}
												>
													<div
														style={{
															display: 'flex',
															justifyContent: 'space-between',
															alignItems: 'flex-start',
														}}
													>
														<div style={{ flex: 1 }}>
															<div
																style={{ fontWeight: 700, fontSize: '0.95rem' }}
															>
																{item.name}
															</div>
															{item.description && (
																<div
																	style={{
																		color: 'var(--text-secondary)',
																		fontSize: '0.78rem',
																		marginTop: '0.2rem',
																	}}
																>
																	{item.description}
																</div>
															)}
														</div>
														<div
															style={{
																fontWeight: 700,
																color: 'var(--primary)',
																marginLeft: '0.75rem',
																fontSize: '0.95rem',
																whiteSpace: 'nowrap',
															}}
														>
															Rs. {item.price}
														</div>
													</div>
													<div
														style={{
															display: 'flex',
															justifyContent: 'flex-end',
															marginTop: '0.25rem',
														}}
													>
														{qty === 0 ? (
															<button
																onClick={() => updateCart(item, 1)}
																style={{
																	background: 'var(--primary)',
																	color: '#fff',
																	border: 'none',
																	borderRadius: '8px',
																	padding: '0.4rem 1rem',
																	cursor: 'pointer',
																	fontWeight: 600,
																	fontSize: '0.85rem',
																	display: 'flex',
																	alignItems: 'center',
																	gap: '0.3rem',
																}}
															>
																<Plus size={14} /> Add
															</button>
														) : (
															<div
																style={{
																	display: 'flex',
																	alignItems: 'center',
																	gap: '0.5rem',
																}}
															>
																<button
																	onClick={() => updateCart(item, -1)}
																	style={{
																		background: 'var(--glass)',
																		border: '1px solid var(--glass-border)',
																		borderRadius: '8px',
																		padding: '0.3rem 0.5rem',
																		cursor: 'pointer',
																		color: 'var(--text-primary)',
																	}}
																>
																	<Minus size={14} />
																</button>
																<span
																	style={{
																		fontWeight: 700,
																		minWidth: '1.5rem',
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
																		borderRadius: '8px',
																		padding: '0.3rem 0.5rem',
																		cursor: 'pointer',
																		color: '#fff',
																	}}
																>
																	<Plus size={14} />
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
									padding: '0.6rem 0',
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
