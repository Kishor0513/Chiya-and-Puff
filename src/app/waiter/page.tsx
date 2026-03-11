'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import { SkeletonTable } from '@/components/ui/Skeleton';
import type { Table } from '@/types';
import { AlertCircle, Copy, PlusCircle, QrCode, X } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useRef, useState } from 'react';

const STATUS_CONFIG = {
	AVAILABLE: { label: 'Available', color: '#00A699' },
	OCCUPIED: { label: 'Occupied', color: '#F5A623' },
	NEEDS_SERVICE: { label: 'Needs Service', color: '#FF5A5F' },
	BILL_REQUESTED: { label: 'Bill Requested', color: '#9B59B6' },
} as const;

export default function WaiterDashboard() {
	const [tables, setTables] = useState<Table[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showQrModal, setShowQrModal] = useState<Table | null>(null);
	const [newTableNumber, setNewTableNumber] = useState('');
	const [creating, setCreating] = useState(false);
	const isInitialFetch = useRef(true);
	const previousServiceTables = useRef<string[]>([]);
	const previousBillTables = useRef<string[]>([]);
	const serviceSectionRef = useRef<HTMLDivElement | null>(null);
	const billSectionRef = useRef<HTMLDivElement | null>(null);
	const { toasts, toast, dismiss } = useToast();

	const fetchTables = useCallback(async () => {
		try {
			const res = await fetch('/api/tables');
			if (res.ok) {
				const nextTables: Table[] = await res.json();
				const currentNeedsService = nextTables
					.filter((t) => t.status === 'NEEDS_SERVICE')
					.map((t) => t.id);
				const currentBillRequests = nextTables
					.filter((t) => t.status === 'BILL_REQUESTED')
					.map((t) => t.id);

				if (!isInitialFetch.current) {
					const newlyRequested = nextTables.filter(
						(t) =>
							t.status === 'NEEDS_SERVICE' &&
							!previousServiceTables.current.includes(t.id),
					);
					for (const table of newlyRequested) {
						toast(`Service request from Table ${table.tableNumber}`, 'info');
					}
					const newlyBilled = nextTables.filter(
						(t) =>
							t.status === 'BILL_REQUESTED' &&
							!previousBillTables.current.includes(t.id),
					);
					for (const table of newlyBilled) {
						toast(`Bill requested by Table ${table.tableNumber}`, 'info');
					}
				}

				previousServiceTables.current = currentNeedsService;
				previousBillTables.current = currentBillRequests;
				isInitialFetch.current = false;
				setTables(nextTables);
			}
		} catch {
			// silent poll fail
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchTables();
		const interval = setInterval(fetchTables, 10_000);
		return () => clearInterval(interval);
	}, [fetchTables]);

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

	const serviceTables = tables.filter((t) => t.status === 'NEEDS_SERVICE');
	const billRequestTables = tables.filter((t) => t.status === 'BILL_REQUESTED');

	const jumpToServiceRequests = () => {
		serviceSectionRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	const jumpToBillRequests = () => {
		billSectionRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

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
				<div>
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
					<div
						style={{
							display: 'flex',
							gap: '0.5rem',
							marginTop: '0.55rem',
							flexWrap: 'wrap',
						}}
					>
						<button
							type="button"
							onClick={jumpToServiceRequests}
							style={{
								fontSize: '0.78rem',
								fontWeight: 700,
								color: '#FF5A5F',
								background: '#FF5A5F20',
								border: '1px solid #FF5A5F40',
								borderRadius: '999px',
								padding: '0.2rem 0.6rem',
								cursor: 'pointer',
							}}
						>
							Service: {serviceTables.length}
						</button>
						<button
							type="button"
							onClick={jumpToBillRequests}
							style={{
								fontSize: '0.78rem',
								fontWeight: 700,
								color: '#9B59B6',
								background: '#9B59B620',
								border: '1px solid #9B59B640',
								borderRadius: '999px',
								padding: '0.2rem 0.6rem',
								cursor: 'pointer',
							}}
						>
							Bills: {billRequestTables.length}
						</button>
					</div>
				</div>
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

			{serviceTables.length > 0 && (
				<div
					ref={serviceSectionRef}
					className="glass-panel"
					style={{
						padding: '0.9rem 1rem',
						marginBottom: '1rem',
						borderLeft: '4px solid #FF5A5F',
					}}
				>
					<div
						style={{
							fontWeight: 700,
							fontSize: '0.9rem',
							marginBottom: '0.4rem',
						}}
					>
						Customer call requests
					</div>
					<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
						{serviceTables.map((table) => (
							<Link
								key={table.id}
								href={`/waiter/table/${table.id}`}
								style={{
									textDecoration: 'none',
									fontSize: '0.8rem',
									fontWeight: 700,
									color: '#FF5A5F',
									background: '#FF5A5F20',
									border: '1px solid #FF5A5F40',
									borderRadius: '999px',
									padding: '0.3rem 0.65rem',
								}}
							>
								Table {table.tableNumber}
							</Link>
						))}
					</div>
				</div>
			)}

			{billRequestTables.length > 0 && (
				<div
					ref={billSectionRef}
					className="glass-panel"
					style={{
						padding: '0.9rem 1rem',
						marginBottom: '1rem',
						borderLeft: '4px solid #9B59B6',
					}}
				>
					<div
						style={{
							fontWeight: 700,
							fontSize: '0.9rem',
							marginBottom: '0.4rem',
						}}
					>
						Bill requests
					</div>
					<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
						{billRequestTables.map((table) => (
							<Link
								key={table.id}
								href={`/waiter/table/${table.id}`}
								style={{
									textDecoration: 'none',
									fontSize: '0.8rem',
									fontWeight: 700,
									color: '#9B59B6',
									background: '#9B59B620',
									border: '1px solid #9B59B640',
									borderRadius: '999px',
									padding: '0.3rem 0.65rem',
								}}
							>
								Table {table.tableNumber}
							</Link>
						))}
					</div>
				</div>
			)}

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
						<SkeletonTable key={i} />
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
									size={200}
									level="M"
								/>
							</div>
						</div>
						<p
							style={{
								color: 'var(--text-secondary)',
								fontSize: '0.75rem',
								wordBreak: 'break-all',
								margin: '0 0 0.75rem',
							}}
						>
							{appUrl}/table/{showQrModal.id}?token={showQrModal.qrData}
						</p>
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
					</div>
				</div>
			)}
		</div>
	);
}
