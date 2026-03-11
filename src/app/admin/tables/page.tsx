'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import type { Table } from '@/types';
import { Copy, PlusCircle, Trash2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

const STATUS_CONFIG = {
	AVAILABLE: { label: 'Available', color: '#00A699' },
	OCCUPIED: { label: 'Occupied', color: '#F5A623' },
	NEEDS_SERVICE: { label: 'Needs Service', color: '#FF5A5F' },
	BILL_REQUESTED: { label: 'Bill Requested', color: '#9B59B6' },
} as const;

export default function AdminTablesPage() {
	const [tables, setTables] = useState<Table[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showQrModal, setShowQrModal] = useState<Table | null>(null);
	const [newTableNumber, setNewTableNumber] = useState('');
	const [creating, setCreating] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);
	const { toasts, toast, dismiss } = useToast();

	const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

	useEffect(() => {
		fetch('/api/tables')
			.then((r) => r.json())
			.then(setTables)
			.catch(() => toast('Failed to load tables', 'error'))
			.finally(() => setLoading(false));
	}, [toast]);

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
				toast(`Table ${t.tableNumber} created!`, 'success');
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

	const handleDelete = async (table: Table) => {
		if (table.orders && table.orders.length > 0) {
			toast('Cannot delete a table with active orders', 'error');
			return;
		}
		setDeleting(table.id);
		try {
			const res = await fetch(`/api/tables/${table.id}`, { method: 'DELETE' });
			if (res.ok) {
				setTables((prev) => prev.filter((t) => t.id !== table.id));
				toast(`Table ${table.tableNumber} deleted`, 'success');
			} else {
				const err = await res.json();
				toast(err.error || 'Failed to delete', 'error');
			}
		} catch {
			toast('Network error', 'error');
		} finally {
			setDeleting(null);
		}
	};

	const copyLink = (table: Table) => {
		navigator.clipboard
			.writeText(`${appUrl}/table/${table.id}?token=${table.qrData}`)
			.then(() => toast('Order link copied!', 'success'));
	};

	const inputStyle: React.CSSProperties = {
		width: '100%',
		padding: '0.65rem 0.9rem',
		background: 'var(--glass)',
		border: '1px solid var(--glass-border)',
		borderRadius: '8px',
		color: 'var(--text-primary)',
		fontSize: '0.9rem',
		boxSizing: 'border-box',
	};

	return (
		<div>
			<style>{`
				@media print {
					body * { visibility: hidden; }
					.print-section, .print-section * { visibility: visible; }
					.print-section {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						display: grid !important;
						grid-template-columns: repeat(2, 1fr) !important;
						gap: 2rem !important;
						padding: 2rem !important;
					}
					.no-print { display: none !important; }
				}
				.print-only { display: none; }
				@media print { .print-only { display: block; } }
			`}</style>

			<div className="print-only print-section">
				{tables.map((table) => (
					<div
						key={table.id}
						style={{
							textAlign: 'center',
							padding: '1rem',
							border: '1px solid #eee',
							borderRadius: '12px',
							pageBreakInside: 'avoid',
						}}
					>
						<h2 style={{ marginBottom: '0.5rem' }}>
							Table {table.tableNumber}
						</h2>
						<div
							style={{
								padding: '0.5rem',
								background: '#fff',
								display: 'inline-block',
							}}
						>
							<QRCodeSVG
								value={`${appUrl}/table/${table.id}?token=${table.qrData}`}
								size={180}
							/>
						</div>
						<p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
							Chiya & Puff Ordering
						</p>
					</div>
				))}
			</div>
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
				<div>
					<h1
						style={{
							fontSize: '1.75rem',
							fontWeight: 700,
							color: 'var(--text-primary)',
							margin: 0,
						}}
					>
						Tables &amp; QR Codes
					</h1>
					<p
						style={{
							color: 'var(--text-secondary)',
							margin: '0.4rem 0 0',
							fontSize: '0.875rem',
						}}
					>
						Manage tables. Print or share the QR code for each table so
						customers can order.
					</p>
				</div>
				<div style={{ display: 'flex', gap: '0.75rem' }}>
					<button
						onClick={() => window.print()}
						className="btn btn-secondary"
						style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
					>
						Print All QR
					</button>
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
			</div>

			{/* How it works banner */}
			<div
				className="glass-panel"
				style={{
					padding: '1rem 1.5rem',
					marginBottom: '1.5rem',
					borderLeft: '4px solid var(--primary)',
					display: 'flex',
					alignItems: 'flex-start',
					gap: '0.75rem',
				}}
			>
				<div style={{ fontSize: '1.25rem' }}>ℹ️</div>
				<div
					style={{
						fontSize: '0.875rem',
						color: 'var(--text-secondary)',
						lineHeight: 1.6,
					}}
				>
					<strong style={{ color: 'var(--text-primary)' }}>
						How ordering works:
					</strong>{' '}
					Place the printed QR code on each physical table. Customers scan it
					with their phone camera → opens the menu → they browse and place their
					order. The waiter dashboard auto-refreshes every 10 seconds and shows
					new orders with{' '}
					<strong style={{ color: '#FF5A5F' }}>Needs Service</strong> status
					when a customer calls for assistance.
				</div>
			</div>

			{/* Table list */}
			{loading ? (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
						gap: '1rem',
					}}
				>
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="glass-panel"
							style={{ height: '140px', opacity: 0.4 }}
						/>
					))}
				</div>
			) : tables.length === 0 ? (
				<div
					className="glass-panel"
					style={{
						padding: '3rem',
						textAlign: 'center',
						color: 'var(--text-secondary)',
					}}
				>
					No tables yet. Click <strong>Add Table</strong> to create your first
					one.
				</div>
			) : (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
						gap: '1rem',
					}}
				>
					{tables.map((table) => {
						const cfg =
							STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG];
						const activeOrders = table.orders?.length ?? 0;
						return (
							<div
								key={table.id}
								className="glass-panel"
								style={{
									padding: '1.25rem',
									borderTop: `3px solid ${cfg.color}`,
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										marginBottom: '0.75rem',
									}}
								>
									<div>
										<div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
											Table {table.tableNumber}
										</div>
										<div
											style={{
												fontSize: '0.78rem',
												color: 'var(--text-secondary)',
												marginTop: '0.2rem',
											}}
										>
											{activeOrders} active order{activeOrders !== 1 ? 's' : ''}
										</div>
									</div>
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
									<button
										onClick={() => setShowQrModal(table)}
										style={{
											flex: 1,
											background: 'var(--primary)',
											color: '#fff',
											border: 'none',
											borderRadius: '8px',
											padding: '0.45rem',
											cursor: 'pointer',
											fontWeight: 600,
											fontSize: '0.8rem',
										}}
									>
										Show QR
									</button>
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
										onClick={() => handleDelete(table)}
										disabled={deleting === table.id || activeOrders > 0}
										title={
											activeOrders > 0 ? 'Has active orders' : 'Delete table'
										}
										style={{
											background:
												activeOrders > 0 ? 'var(--glass)' : '#FF5A5F20',
											border: `1px solid ${activeOrders > 0 ? 'var(--glass-border)' : '#FF5A5F40'}`,
											borderRadius: '8px',
											padding: '0.45rem 0.6rem',
											cursor:
												activeOrders > 0 || deleting === table.id
													? 'not-allowed'
													: 'pointer',
											color:
												activeOrders > 0 ? 'var(--text-secondary)' : '#FF5A5F',
											opacity: deleting === table.id ? 0.5 : 1,
										}}
									>
										<Trash2 size={14} />
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
							maxWidth: '380px',
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
								fontSize: '1.2rem',
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
									required
									autoFocus
									onChange={(e) => setNewTableNumber(e.target.value)}
									placeholder="e.g. 5"
									style={inputStyle}
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
							maxWidth: '380px',
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
								margin: '0 0 1.25rem',
								fontSize: '1.1rem',
								fontWeight: 700,
							}}
						>
							Table {showQrModal.tableNumber} — QR Code
						</h3>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								marginBottom: '1rem',
							}}
						>
							<div
								style={{
									padding: '1rem',
									background: '#fff',
									borderRadius: '12px',
									display: 'inline-block',
								}}
							>
								<QRCodeSVG
									value={`${appUrl}/table/${showQrModal.id}?token=${showQrModal.qrData}`}
									size={220}
									level="M"
								/>
							</div>
						</div>
						<p
							style={{
								color: 'var(--text-secondary)',
								fontSize: '0.75rem',
								wordBreak: 'break-all',
								margin: '0 0 1rem',
							}}
						>
							{appUrl}/table/{showQrModal.id}?token={showQrModal.qrData}
						</p>
						<div
							style={{
								display: 'flex',
								gap: '0.75rem',
								justifyContent: 'center',
							}}
						>
							<button
								onClick={() => {
									navigator.clipboard.writeText(
										`${appUrl}/table/${showQrModal!.id}?token=${showQrModal!.qrData}`,
									);
									toast('Link copied!', 'success');
								}}
								style={{
									background: 'var(--primary)',
									color: '#fff',
									border: 'none',
									borderRadius: '8px',
									padding: '0.5rem 1.25rem',
									cursor: 'pointer',
									fontWeight: 600,
									fontSize: '0.85rem',
								}}
							>
								Copy Link
							</button>
							<button
								onClick={() => window.print()}
								style={{
									background: 'var(--glass)',
									border: '1px solid var(--glass-border)',
									borderRadius: '8px',
									padding: '0.5rem 1.25rem',
									cursor: 'pointer',
									fontWeight: 600,
									fontSize: '0.85rem',
									color: 'var(--text-primary)',
								}}
							>
								Print
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
