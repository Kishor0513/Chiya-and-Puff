'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import type { Table } from '@/types';
import { AlertCircle, Copy, PlusCircle, QrCode, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STATUS_CONFIG = {
	AVAILABLE: { label: 'Available', color: '#00A699' },
	OCCUPIED: { label: 'Occupied', color: '#F5A623' },
	NEEDS_SERVICE: { label: 'Needs Service', color: '#FF5A5F' },
} as const;

export default function WaiterDashboard() {
	const [tables, setTables] = useState<Table[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showQrModal, setShowQrModal] = useState<Table | null>(null);
	const [newTableNumber, setNewTableNumber] = useState('');
	const [creating, setCreating] = useState(false);
	const { toasts, toast, dismiss } = useToast();

	const fetchTables = async () => {
		try {
			const res = await fetch('/api/tables');
			if (res.ok) setTables(await res.json());
		} catch {
			toast('Failed to load tables', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTables();
	}, []);

	const handleAddTable = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTableNumber.trim()) return;
		setCreating(true);
		try {
			const res = await fetch('/api/tables', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tableNumber: parseInt(newTableNumber) }),
			});
			if (res.ok) {
				const t: Table = await res.json();
				setTables((prev) => [...prev, t]);
				toast(`Table ${t.tableNumber} added successfully!`, 'success');
				setShowAddModal(false);
				setNewTableNumber('');
			} else {
				const err = await res.json();
				toast(err.error || 'Failed to create table', 'error');
			}
		} catch {
			toast('Network error', 'error');
		} finally {
			setCreating(false);
		}
	};

	const copyLink = (table: Table) => {
		const url = `${window.location.origin}/table/${table.id}?token=${table.qrData}`;
		navigator.clipboard
			.writeText(url)
			.then(() => toast('Link copied!', 'success'));
	};

	const appUrl =
		typeof window !== 'undefined'
			? window.location.origin
			: process.env.NEXT_PUBLIC_APP_URL || '';

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
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem',
				}}
			>
				<h1
					style={{
						fontSize: '1.75rem',
						fontWeight: 700,
						color: 'var(--text-primary)',
						margin: 0,
					}}
				>
					Table Floor Plan
				</h1>
				<button
					onClick={() => setShowAddModal(true)}
					style={{
						background: 'var(--primary)',
						color: '#fff',
						border: 'none',
						borderRadius: '10px',
						padding: '0.65rem 1.25rem',
						fontWeight: 600,
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						fontSize: '0.9rem',
					}}
				>
					<PlusCircle size={16} />
					Add Table
				</button>
			</div>

			{/* Status Legend */}
			<div
				style={{
					display: 'flex',
					gap: '1.25rem',
					marginBottom: '1.5rem',
					flexWrap: 'wrap',
				}}
			>
				{Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
					<div
						key={key}
						style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
					>
						<span
							style={{
								width: 10,
								height: 10,
								borderRadius: '50%',
								background: cfg.color,
								display: 'inline-block',
							}}
						/>
						<span
							style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
						>
							{cfg.label}
						</span>
					</div>
				))}
			</div>

			{/* Table Grid */}
			{loading ? (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
						gap: '1rem',
					}}
				>
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="glass-panel"
							style={{ padding: '1.5rem', height: '160px', opacity: 0.5 }}
						/>
					))}
				</div>
			) : tables.length === 0 ? (
				<div
					className="glass-panel"
					style={{ padding: '3rem', textAlign: 'center' }}
				>
					<AlertCircle
						size={40}
						color="var(--text-secondary)"
						style={{ margin: '0 auto 1rem' }}
					/>
					<p style={{ color: 'var(--text-secondary)', margin: 0 }}>
						No tables yet. Add your first table above.
					</p>
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
						gap: '1rem',
					}}
				>
					{tables.map((table) => {
						const cfg =
							STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG];
						return (
							<div
								key={table.id}
								className="glass-panel"
								style={{
									padding: '1.25rem',
									borderTop: `3px solid ${cfg.color}`,
									display: 'flex',
									flexDirection: 'column',
									gap: '0.75rem',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
										Table {table.tableNumber}
									</span>
									<span
										style={{
											background: cfg.color + '20',
											color: cfg.color,
											borderRadius: '20px',
											padding: '0.2rem 0.65rem',
											fontSize: '0.75rem',
											fontWeight: 600,
										}}
									>
										{cfg.label}
									</span>
								</div>

								<div
									style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
								>
									<Link
										href={`/waiter/table/${table.id}`}
										style={{
											flex: 1,
											textAlign: 'center',
											background: 'var(--primary)',
											color: '#fff',
											borderRadius: '8px',
											padding: '0.45rem',
											fontSize: '0.8rem',
											fontWeight: 600,
											textDecoration: 'none',
										}}
									>
										Manage
									</Link>
									<button
										onClick={() => copyLink(table)}
										title="Copy order link"
										style={{
											background: 'var(--glass)',
											border: '1px solid var(--glass-border)',
											borderRadius: '8px',
											padding: '0.45rem 0.6rem',
											cursor: 'pointer',
											color: 'var(--text-secondary)',
										}}
									>
										<Copy size={14} />
									</button>
									<button
										onClick={() => setShowQrModal(table)}
										title="Show QR code"
										style={{
											background: 'var(--glass)',
											border: '1px solid var(--glass-border)',
											borderRadius: '8px',
											padding: '0.45rem 0.6rem',
											cursor: 'pointer',
											color: 'var(--text-secondary)',
										}}
									>
										<QrCode size={14} />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add Table Modal */}
			{showAddModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.6)',
						zIndex: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
					onClick={() => setShowAddModal(false)}
				>
					<div
						className="glass-panel"
						style={{
							padding: '2rem',
							width: '100%',
							maxWidth: '400px',
							position: 'relative',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setShowAddModal(false)}
							style={{
								position: 'absolute',
								top: '1rem',
								right: '1rem',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								color: 'var(--text-secondary)',
							}}
						>
							<X size={20} />
						</button>
						<h2
							style={{
								margin: '0 0 1.5rem',
								fontSize: '1.25rem',
								fontWeight: 700,
							}}
						>
							Add New Table
						</h2>
						<form
							onSubmit={handleAddTable}
							style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
						>
							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '0.4rem',
										fontSize: '0.875rem',
										fontWeight: 600,
									}}
								>
									Table Number
								</label>
								<input
									type="number"
									min="1"
									value={newTableNumber}
									onChange={(e) => setNewTableNumber(e.target.value)}
									placeholder="e.g. 7"
									required
									autoFocus
									style={{
										width: '100%',
										padding: '0.65rem 0.9rem',
										background: 'var(--glass)',
										border: '1px solid var(--glass-border)',
										borderRadius: '8px',
										color: 'var(--text-primary)',
										fontSize: '0.9rem',
										boxSizing: 'border-box',
									}}
								/>
							</div>
							<button
								type="submit"
								disabled={creating}
								style={{
									background: 'var(--primary)',
									color: '#fff',
									border: 'none',
									borderRadius: '10px',
									padding: '0.75rem',
									fontWeight: 700,
									cursor: creating ? 'not-allowed' : 'pointer',
									opacity: creating ? 0.7 : 1,
								}}
							>
								{creating ? 'Creating…' : 'Create Table'}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* QR Modal */}
			{showQrModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.6)',
						zIndex: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
					onClick={() => setShowQrModal(null)}
				>
					<div
						className="glass-panel"
						style={{
							padding: '2rem',
							width: '100%',
							maxWidth: '360px',
							textAlign: 'center',
							position: 'relative',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setShowQrModal(null)}
							style={{
								position: 'absolute',
								top: '1rem',
								right: '1rem',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								color: 'var(--text-secondary)',
							}}
						>
							<X size={20} />
						</button>
						<h3
							style={{
								margin: '0 0 1rem',
								fontSize: '1.1rem',
								fontWeight: 700,
							}}
						>
							Table {showQrModal.tableNumber} — QR Code
						</h3>
						<p
							style={{
								color: 'var(--text-secondary)',
								fontSize: '0.8rem',
								wordBreak: 'break-all',
								margin: '0.5rem 0 0',
							}}
						>
							{appUrl}/table/{showQrModal.id}?token={showQrModal.qrData}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
