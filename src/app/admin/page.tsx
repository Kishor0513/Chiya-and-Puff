'use client';

import type { AdminStats, OrderStatus } from '@/types';
import {
	Activity,
	CheckCircle,
	Clock,
	RefreshCw,
	Table2,
	TrendingUp,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const STATUS_COLOR: Record<OrderStatus, string> = {
	PENDING: '#F5A623',
	PREPARING: '#4A90E2',
	DELIVERED: '#00A699',
	BILLED: '#9B59B6',
};

import { SkeletonCard } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [spinning, setSpinning] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchStats = useCallback(async () => {
		try {
			const res = await fetch('/api/admin/stats');
			if (res.ok) {
				setStats(await res.json());
				setLastUpdated(new Date());
			}
		} catch (e) {
			console.error('Failed to load dashboard stats', e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
		const interval = setInterval(fetchStats, 30_000);
		return () => clearInterval(interval);
	}, [fetchStats]);

	const handleRefresh = async () => {
		setSpinning(true);
		await fetchStats();
		setTimeout(() => setSpinning(false), 600);
	};

	const statCards = stats
		? [
				{
					label: 'Total Tables',
					value: stats.totalTables,
					icon: <Table2 size={22} />,
					color: 'var(--primary)',
					sub: `${stats.totalTables - stats.occupiedTables} available`,
				},
				{
					label: 'Occupied Tables',
					value: stats.occupiedTables,
					icon: <CheckCircle size={22} />,
					color: 'var(--secondary)',
					sub: 'currently in use',
				},
				{
					label: 'Active Orders',
					value: stats.pendingOrders,
					icon: <Clock size={22} />,
					color: '#F5A623',
					sub: 'pending & preparing',
				},
				{
					label: 'Staff Members',
					value: stats.totalStaff,
					icon: <Users size={22} />,
					color: '#4A90E2',
					sub: 'total accounts',
				},
				{
					label: "Today's Revenue",
					value: `Rs. ${stats.todayRevenue.toLocaleString()}`,
					icon: <TrendingUp size={22} />,
					color: '#00A699',
					sub: 'from billed orders',
				},
			]
		: [];

	const quickActions = [
		{ label: 'Manage Menu', href: '/admin/menu', color: 'var(--primary)' },
		{ label: 'Tables & QR', href: '/admin/tables', color: '#4A90E2' },
		{ label: 'Analytics', href: '/admin/analytics', color: '#00A699' },
		{ label: 'Manage Staff', href: '/admin/staff', color: 'var(--secondary)' },
		{ label: 'Settings', href: '/admin/settings', color: '#9B59B6' },
	];

	return (
		<div>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem',
				}}
			>
				<div>
					<h1
						style={{
							fontSize: '1.75rem',
							fontWeight: 700,
							color: 'var(--text-primary)',
							margin: 0,
						}}
					>
						Dashboard
					</h1>
					{lastUpdated && (
						<p
							style={{
								fontSize: '0.8rem',
								color: 'var(--text-secondary)',
								margin: '0.25rem 0 0',
							}}
						>
							Last updated: {lastUpdated.toLocaleTimeString()}
						</p>
					)}
				</div>
				<button
					onClick={handleRefresh}
					style={{
						background: 'var(--glass)',
						border: '1px solid var(--glass-border)',
						borderRadius: '8px',
						padding: '0.5rem 1rem',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						color: 'var(--text-primary)',
						fontSize: '0.875rem',
					}}
				>
					<RefreshCw
						size={16}
						style={{
							transition: 'transform 0.6s',
							transform: spinning ? 'rotate(360deg)' : 'none',
						}}
					/>
					Refresh
				</button>
			</div>

			{/* Stat Cards */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: '1rem',
					marginBottom: '2rem',
				}}
			>
				{loading
					? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
					: statCards.map((card) => (
							<div
								key={card.label}
								className="glass-panel"
								style={{ padding: '1.5rem' }}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										marginBottom: '0.75rem',
									}}
								>
									<span
										style={{
											color: 'var(--text-secondary)',
											fontSize: '0.875rem',
											fontWeight: 500,
										}}
									>
										{card.label}
									</span>
									<span
										style={{
											color: card.color,
											background: `${card.color}20`,
											borderRadius: '8px',
											padding: '0.35rem',
										}}
									>
										{card.icon}
									</span>
								</div>
								<div
									style={{
										fontSize: '1.75rem',
										fontWeight: 700,
										color: 'var(--text-primary)',
									}}
								>
									{card.value}
								</div>
								<div
									style={{
										fontSize: '0.78rem',
										color: 'var(--text-secondary)',
										marginTop: '0.25rem',
									}}
								>
									{card.sub}
								</div>
							</div>
						))}
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '1.5rem',
				}}
			>
				{/* Recent Orders */}
				<div
					className="glass-panel"
					style={{ padding: '1.5rem' }}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							marginBottom: '1rem',
						}}
					>
						<Activity
							size={18}
							color="var(--primary)"
						/>
						<h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
							Recent Orders
						</h2>
					</div>

					{loading ? (
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
							Loading…
						</p>
					) : !stats || stats.recentOrders.length === 0 ? (
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
							No orders yet.
						</p>
					) : (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '0.75rem',
							}}
						>
							{stats.recentOrders.map((order) => (
								<div
									key={order.id}
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '0.6rem 0.75rem',
										background: 'var(--glass)',
										borderRadius: '8px',
										border: '1px solid var(--glass-border)',
									}}
								>
									<div>
										<span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
											Table {order.table?.tableNumber ?? '?'}
										</span>
										<span
											style={{
												color: 'var(--text-secondary)',
												fontSize: '0.78rem',
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
										<span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
											Rs. {order.totalAmount}
										</span>
										<span
											style={{
												background:
													STATUS_COLOR[order.status as OrderStatus] + '22',
												color: STATUS_COLOR[order.status as OrderStatus],
												borderRadius: '20px',
												padding: '0.2rem 0.6rem',
												fontSize: '0.75rem',
												fontWeight: 600,
											}}
										>
											{order.status}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Quick Actions */}
				<div
					className="glass-panel"
					style={{ padding: '1.5rem' }}
				>
					<h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>
						Quick Actions
					</h2>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '0.75rem',
						}}
					>
						{quickActions.map((action) => (
							<Link
								key={action.href}
								href={action.href}
								style={{
									display: 'block',
									padding: '1rem',
									background: `${action.color}15`,
									border: `1px solid ${action.color}40`,
									borderRadius: '10px',
									color: action.color,
									fontWeight: 600,
									fontSize: '0.875rem',
									textDecoration: 'none',
									textAlign: 'center',
									transition: 'all 0.2s ease',
								}}
							>
								{action.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
