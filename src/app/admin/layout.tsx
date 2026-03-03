'use client';

import {
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Table2,
	Users,
	UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const navItems = [
		{ name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
		{
			name: 'Menu Items',
			path: '/admin/menu',
			icon: <UtensilsCrossed size={20} />,
		},
		{ name: 'Tables & QR', path: '/admin/tables', icon: <Table2 size={20} /> },
		{
			name: 'Staff Management',
			path: '/admin/staff',
			icon: <Users size={20} />,
		},
		{ name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
	];

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (e) {
			console.error('Logout failed', e);
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				minHeight: '100vh',
				background: 'var(--background)',
			}}
		>
			{/* Mobile Header */}
			<div
				style={{
					display: 'none',
					padding: '1rem',
					background: 'var(--card-bg)',
					borderBottom: '1px solid var(--border-color)',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
				className="mobile-header"
			>
				<h3 style={{ margin: 0 }}>Chiya admin</h3>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					style={{
						background: 'none',
						border: 'none',
						color: 'var(--text-main)',
					}}
				>
					<Menu size={24} />
				</button>
			</div>

			{/* Sidebar */}
			<aside
				style={{
					width: '260px',
					background: 'var(--card-bg)',
					backdropFilter: 'blur(20px)',
					borderRight: '1px solid var(--border-color)',
					display: 'flex',
					flexDirection: 'column',
					position: 'fixed',
					height: '100vh',
					zIndex: 10,
					// Mobile handling would use CSS media queries to hide/show, inline for simplicity:
					transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)',
					transition: 'var(--transition)',
				}}
			>
				<div
					style={{
						padding: '2rem 1.5rem',
						borderBottom: '1px solid var(--border-color)',
					}}
				>
					<h2
						style={{
							margin: 0,
							fontSize: '1.5rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
						}}
					>
						<span style={{ color: 'var(--primary)' }}>
							<UtensilsCrossed size={24} />
						</span>
						Admin Panel
					</h2>
				</div>

				<nav
					style={{
						flex: 1,
						padding: '1.5rem 1rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '0.5rem',
					}}
				>
					{navItems.map((item) => {
						const isActive = pathname === item.path;
						return (
							<Link
								key={item.path}
								href={item.path}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '1rem',
									padding: '0.875rem 1rem',
									borderRadius: '12px',
									color: isActive ? 'white' : 'var(--text-muted)',
									background: isActive ? 'var(--primary)' : 'transparent',
									fontWeight: isActive ? 600 : 500,
									transition: 'all 0.2s ease',
								}}
							>
								{item.icon}
								{item.name}
							</Link>
						);
					})}
				</nav>

				<div
					style={{
						padding: '1.5rem 1rem',
						borderTop: '1px solid var(--border-color)',
					}}
				>
					<button
						onClick={handleLogout}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '1rem',
							padding: '0.875rem 1rem',
							width: '100%',
							borderRadius: '12px',
							color: 'var(--primary)',
							background: 'rgba(255, 90, 95, 0.1)',
							border: 'none',
							fontWeight: 600,
							cursor: 'pointer',
							fontSize: '1rem',
						}}
					>
						<LogOut size={20} />
						Logout
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }}>
				{children}
			</main>

			<style
				jsx
				global
			>{`
				@media (max-width: 768px) {
					.mobile-header {
						display: flex !important;
						margin-bottom: 1rem;
					}
					aside {
						transform: translateX(-100%) !important;
					}
					main {
						marginleft: 0 !important;
						padding: 1rem !important;
					}
				}
			`}</style>
		</div>
	);
}
