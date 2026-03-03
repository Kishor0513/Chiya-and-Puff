'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import { KeyRound, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Staff = {
	id: string;
	name: string;
	role: string;
	createdAt: string;
};

export default function StaffManagement() {
	const [staff, setStaff] = useState<Staff[]>([]);
	const [loading, setLoading] = useState(true);

	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		password: '',
		role: 'WAITER',
	});
	const { toasts, toast, dismiss } = useToast();

	useEffect(() => {
		fetchStaff();
	}, []);

	const fetchStaff = async () => {
		try {
			const res = await fetch('/api/staff');
			if (res.ok) {
				const data = await res.json();
				setStaff(data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch('/api/staff', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				setShowModal(false);
				setFormData({ name: '', password: '', role: 'WAITER' });
				fetchStaff();
				toast(`Staff member "${formData.name}" created!`, 'success');
			} else {
				const error = await res.json();
				toast(error.error || 'Failed to create staff', 'error');
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete ${name}?`)) return;
		try {
			const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
			if (res.ok) {
				fetchStaff();
				toast(`Staff member removed.`, 'success');
			} else {
				const err = await res.json();
				toast(err.error || 'Failed to delete staff', 'error');
			}
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem',
				}}
			>
				<h1>Staff Management</h1>
				<button
					onClick={() => setShowModal(true)}
					className="btn btn-primary"
				>
					<UserPlus size={18} /> Add Staff
				</button>
			</div>

			<div
				className="glass-panel"
				style={{ overflow: 'hidden' }}
			>
				<table
					style={{
						width: '100%',
						borderCollapse: 'collapse',
						textAlign: 'left',
					}}
				>
					<thead>
						<tr
							style={{
								borderBottom: '1px solid var(--border-color)',
								background: 'rgba(0,0,0,0.02)',
							}}
						>
							<th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
								Name
							</th>
							<th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
								Role
							</th>
							<th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
								Joined
							</th>
							<th
								style={{
									padding: '1.25rem 1.5rem',
									fontWeight: 600,
									textAlign: 'right',
								}}
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td
									colSpan={4}
									style={{ padding: '2rem', textAlign: 'center' }}
								>
									Loading staff...
								</td>
							</tr>
						) : staff.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									style={{
										padding: '2rem',
										textAlign: 'center',
										color: 'var(--text-muted)',
									}}
								>
									No staff members.
								</td>
							</tr>
						) : (
							staff.map((member) => (
								<tr
									key={member.id}
									style={{ borderBottom: '1px solid var(--border-color)' }}
								>
									<td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
										{member.name}
									</td>
									<td style={{ padding: '1rem 1.5rem' }}>
										<span
											style={{
												background:
													member.role === 'ADMIN'
														? 'rgba(255, 90, 95, 0.1)'
														: 'rgba(0, 166, 153, 0.1)',
												color:
													member.role === 'ADMIN'
														? 'var(--primary)'
														: 'var(--secondary)',
												padding: '0.25rem 0.75rem',
												borderRadius: '1rem',
												fontSize: '0.875rem',
												fontWeight: 600,
											}}
										>
											{member.role}
										</span>
									</td>
									<td
										style={{
											padding: '1rem 1.5rem',
											color: 'var(--text-muted)',
										}}
									>
										{new Date(member.createdAt).toLocaleDateString()}
									</td>
									<td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
										<button
											onClick={() => handleDelete(member.id, member.name)}
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												color: 'var(--primary)',
											}}
											title="Delete user"
										>
											<Trash2 size={18} />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Basic Modal implementation */}
			{showModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						background: 'rgba(0,0,0,0.4)',
						backdropFilter: 'blur(5px)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 100,
					}}
				>
					<div
						className="glass-panel"
						style={{
							width: '100%',
							maxWidth: '400px',
							padding: '2rem',
							background: 'var(--card-bg)',
						}}
					>
						<h2 style={{ marginBottom: '1.5rem' }}>Add Waitstaff / Admin</h2>
						<form
							onSubmit={handleSave}
							style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
						>
							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '0.5rem',
										fontSize: '0.875rem',
										fontWeight: 500,
									}}
								>
									Name / Login ID
								</label>
								<input
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									style={{
										width: '100%',
										padding: '0.75rem',
										borderRadius: '8px',
										border: '1px solid var(--border-color)',
										outline: 'none',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '0.5rem',
										fontSize: '0.875rem',
										fontWeight: 500,
									}}
								>
									Access Password
								</label>
								<div style={{ position: 'relative' }}>
									<KeyRound
										size={18}
										style={{
											position: 'absolute',
											top: '50%',
											left: '0.75rem',
											transform: 'translateY(-50%)',
											color: 'var(--text-muted)',
										}}
									/>
									<input
										type="password"
										required
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										style={{
											width: '100%',
											padding: '0.75rem 0.75rem 0.75rem 2.25rem',
											borderRadius: '8px',
											border: '1px solid var(--border-color)',
											outline: 'none',
										}}
									/>
								</div>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										marginBottom: '0.5rem',
										fontSize: '0.875rem',
										fontWeight: 500,
									}}
								>
									Role Assignment
								</label>
								<select
									required
									value={formData.role}
									onChange={(e) =>
										setFormData({ ...formData, role: e.target.value })
									}
									style={{
										width: '100%',
										padding: '0.75rem',
										borderRadius: '8px',
										border: '1px solid var(--border-color)',
										outline: 'none',
										background: 'white',
									}}
								>
									<option value="WAITER">Waiter</option>
									<option value="ADMIN">Administrator</option>
								</select>
							</div>

							<div
								style={{
									display: 'flex',
									justifyContent: 'flex-end',
									gap: '1rem',
									marginTop: '1.5rem',
								}}
							>
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-primary"
								>
									Create Staff
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			<ToastContainer
				toasts={toasts}
				dismiss={dismiss}
			/>
		</div>
	);
}
