'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChefHat, Clock, LogOut, Utensils } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import styles from './kitchen.module.css';

interface Order {
	id: string;
	status: 'PENDING' | 'PREPARING' | 'DELIVERED' | 'BILLED';
	totalAmount: number;
	createdAt: string;
	table: { tableNumber: number };
	items: Array<{
		id: string;
		quantity: number;
		menuItem: { name: string; category: string };
	}>;
}

export default function KitchenDashboard() {
	const [orders, setOrders] = useState<Order[]>([]);

	const fetchOrders = useCallback(async () => {
		try {
			const res = await fetch('/api/kitchen');
			if (res.ok) {
				setOrders(await res.json());
			}
		} catch (error) {
			console.error('Failed to fetch kitchen orders', error);
		}
	}, []);

	useEffect(() => {
		(async () => {
			await fetchOrders();
		})();
	}, [fetchOrders]);

	useEffect(() => {
		const interval = setInterval(fetchOrders, 10000); // Poll every 10s
		return () => clearInterval(interval);
	}, [fetchOrders]);

	const updateStatus = async (orderId: string, newStatus: string) => {
		try {
			const res = await fetch('/api/kitchen', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderId, status: newStatus }),
			});
			if (res.ok) {
				fetchOrders();
			}
		} catch (error) {
			console.error('Failed to update status', error);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (e) {
			console.error('Logout failed', e);
		}
	};

	const getElapsedTime = (createdAt: string) => {
		const start = new Date(createdAt).getTime();
		const now = new Date().getTime();
		const diff = Math.floor((now - start) / 60000);
		return diff;
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.logo}>
					<ChefHat
						size={32}
						color="var(--primary)"
					/>
					<h1>Kitchen Display System</h1>
				</div>
				<div className={styles.stats}>
					<span>
						Active Orders:{' '}
						<strong>
							{orders.filter((o) => o.status !== 'DELIVERED').length}
						</strong>
					</span>
					<button
						onClick={handleLogout}
						style={{
							marginLeft: '1.5rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							padding: '0.5rem 1rem',
							borderRadius: '12px',
							color: 'var(--text-main)',
							background: 'rgba(0,0,0,0.05)',
							border: 'none',
							fontWeight: 600,
							cursor: 'pointer',
							fontSize: '0.875rem',
						}}
					>
						<LogOut size={16} />
						<span>Sign Out</span>
					</button>
				</div>
			</header>

			<main className={styles.grid}>
				<AnimatePresence>
					{orders.map((order) => (
						<motion.div
							key={order.id}
							layout
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className={`${styles.orderCard} ${styles[order.status.toLowerCase()]}`}
						>
							<div className={styles.cardHeader}>
								<div className={styles.tableInfo}>
									<span className={styles.tableNumber}>
										Table {order.table.tableNumber}
									</span>
									<span className={styles.timeInfo}>
										<Clock size={14} /> {getElapsedTime(order.createdAt)}m ago
									</span>
								</div>
								<div
									className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}
								>
									{order.status}
								</div>
							</div>

							<div className={styles.itemList}>
								{order.items.map((item) => (
									<div
										key={item.id}
										className={styles.item}
									>
										<span className={styles.quantity}>{item.quantity}x</span>
										<span className={styles.itemName}>
											{item.menuItem.name}
										</span>
									</div>
								))}
							</div>

							<div className={styles.cardActions}>
								{order.status === 'PREPARING' && (
									<button
										onClick={() => updateStatus(order.id, 'DELIVERED')}
										className={styles.actionBtn}
										style={{ backgroundColor: 'var(--secondary)' }}
									>
										<CheckCircle2 size={18} /> Mark Ready
									</button>
								)}
								{order.status === 'DELIVERED' && (
									<div className={styles.readyText}>
										<Utensils size={18} /> Ready for Pickup
									</div>
								)}
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</main>
		</div>
	);
}
