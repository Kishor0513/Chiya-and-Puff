'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type MenuItem = {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	available: boolean;
};

export default function MenuManagement() {
	const [items, setItems] = useState<MenuItem[]>([]);
	const [loading, setLoading] = useState(true);

	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState({
		id: '',
		name: '',
		description: '',
		price: '',
		category: 'Drinks',
		available: true,
	});
	const [isEditing, setIsEditing] = useState(false);
	const { toasts, toast, dismiss } = useToast();

	useEffect(() => {
		fetchItems();
	}, []);

	const fetchItems = async () => {
		try {
			const res = await fetch('/api/menu');
			if (res.ok) {
				const data = await res.json();
				setItems(data);
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
			const url =
				isEditing && formData.id ? `/api/menu/${formData.id}` : '/api/menu';
			const method = isEditing && formData.id ? 'PATCH' : 'POST';

			const payload = {
				name: formData.name,
				description: formData.description,
				price: Number(formData.price),
				category: formData.category,
				available: formData.available,
			};

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setShowModal(false);
				fetchItems();
				toast(
					isEditing
						? `"${formData.name}" updated!`
						: `"${formData.name}" added to menu!`,
					'success',
				);
			} else {
				toast('Failed to save menu item', 'error');
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Delete "${name}" from the menu?`)) return;
		try {
			const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
			if (res.ok) {
				fetchItems();
				toast(`"${name}" removed from menu.`, 'success');
			} else {
				toast('Failed to delete item', 'error');
			}
		} catch (e) {
			console.error(e);
		}
	};

	const openNew = () => {
		setIsEditing(false);
		setFormData({
			id: '',
			name: '',
			description: '',
			price: '',
			category: 'Drinks',
			available: true,
		});
		setShowModal(true);
	};

	const openEdit = (item: MenuItem) => {
		setIsEditing(true);
		setFormData({
			id: item.id,
			name: item.name,
			description: item.description || '',
			price: String(item.price),
			category: item.category,
			available: item.available,
		});
		setShowModal(true);
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
				<h1>Menu Management</h1>
				<button
					onClick={openNew}
					className="btn btn-primary"
				>
					<Plus size={18} /> Add New Item
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
								Category
							</th>
							<th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
								Price (Rs.)
							</th>
							<th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
								Status
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
									colSpan={5}
									style={{ padding: '2rem', textAlign: 'center' }}
								>
									Loading menu...
								</td>
							</tr>
						) : items.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									style={{
										padding: '2rem',
										textAlign: 'center',
										color: 'var(--text-muted)',
									}}
								>
									No items found. Add one above!
								</td>
							</tr>
						) : (
							items.map((item) => (
								<tr
									key={item.id}
									style={{
										borderBottom: '1px solid var(--border-color)',
										transition: 'background 0.2s',
									}}
									className="hover-row"
								>
									<td style={{ padding: '1rem 1.5rem' }}>
										<div style={{ fontWeight: 600 }}>{item.name}</div>
										<div
											style={{
												fontSize: '0.875rem',
												color: 'var(--text-muted)',
											}}
										>
											{item.description}
										</div>
									</td>
									<td style={{ padding: '1rem 1.5rem' }}>
										<span
											style={{
												background: 'var(--background)',
												padding: '0.25rem 0.75rem',
												borderRadius: '1rem',
												fontSize: '0.875rem',
											}}
										>
											{item.category}
										</span>
									</td>
									<td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
										Rs. {item.price.toFixed(2)}
									</td>
									<td style={{ padding: '1rem 1.5rem' }}>
										<span
											style={{
												color: item.available
													? 'var(--secondary)'
													: 'var(--primary)',
												background: item.available
													? 'rgba(0, 166, 153, 0.1)'
													: 'rgba(255, 90, 95, 0.1)',
												padding: '0.25rem 0.75rem',
												borderRadius: '1rem',
												fontSize: '0.875rem',
												fontWeight: 500,
											}}
										>
											{item.available ? 'Available' : 'Sold Out'}
										</span>
									</td>
									<td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
										<button
											onClick={() => openEdit(item)}
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												color: 'var(--text-muted)',
												marginRight: '1rem',
											}}
										>
											<Edit2 size={18} />
										</button>
										<button
											onClick={() => handleDelete(item.id, item.name)}
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												color: 'var(--primary)',
											}}
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

			<style jsx>{`
				.hover-row:hover {
					background: rgba(0, 0, 0, 0.01);
				}
			`}</style>

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
							maxWidth: '500px',
							padding: '2rem',
							background: 'var(--card-bg)',
						}}
					>
						<h2 style={{ marginBottom: '1.5rem' }}>
							{isEditing ? 'Edit Item' : 'New Menu Item'}
						</h2>
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
									Name
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
									Description
								</label>
								<textarea
									required
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									style={{
										width: '100%',
										padding: '0.75rem',
										borderRadius: '8px',
										border: '1px solid var(--border-color)',
										outline: 'none',
										minHeight: '80px',
									}}
								/>
							</div>
							<div style={{ display: 'flex', gap: '1rem' }}>
								<div style={{ flex: 1 }}>
									<label
										style={{
											display: 'block',
											marginBottom: '0.5rem',
											fontSize: '0.875rem',
											fontWeight: 500,
										}}
									>
										Price (Rs.)
									</label>
									<input
										type="number"
										step="0.01"
										required
										value={formData.price}
										onChange={(e) =>
											setFormData({ ...formData, price: e.target.value })
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
								<div style={{ flex: 1 }}>
									<label
										style={{
											display: 'block',
											marginBottom: '0.5rem',
											fontSize: '0.875rem',
											fontWeight: 500,
										}}
									>
										Category
									</label>
									<select
										required
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
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
										<option value="Starters">Starters</option>
										<option value="Mains">Mains</option>
										<option value="Drinks">Drinks</option>
										<option value="Desserts">Desserts</option>
									</select>
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.5rem',
									marginTop: '0.5rem',
								}}
							>
								<input
									type="checkbox"
									id="available"
									checked={formData.available}
									onChange={(e) =>
										setFormData({ ...formData, available: e.target.checked })
									}
									style={{ width: '1.25rem', height: '1.25rem' }}
								/>
								<label
									htmlFor="available"
									style={{ fontWeight: 500 }}
								>
									Available for order
								</label>
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
									{isEditing ? 'Save Changes' : 'Create Item'}
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
