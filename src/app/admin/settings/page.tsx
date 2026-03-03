'use client';

import { ToastContainer, useToast } from '@/components/Toast';
import { Bell, CreditCard, Save, Store } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'chiya-puff-settings';

type Settings = {
	restaurantName: string;
	contactNumber: string;
	address: string;
	currency: string;
	vatRate: string;
	autoRefreshInterval: string;
	orderNotifications: boolean;
};

const defaultSettings: Settings = {
	restaurantName: 'Chiya & Puff',
	contactNumber: '+977-9800000000',
	address: 'Kathmandu, Nepal',
	currency: 'NPR',
	vatRate: '13',
	autoRefreshInterval: '5',
	orderNotifications: true,
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

export default function SettingsPage() {
	const [settings, setSettings] = useState<Settings>(defaultSettings);
	const [saving, setSaving] = useState(false);
	const { toasts, toast, dismiss } = useToast();

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setSettings({ ...defaultSettings, ...JSON.parse(stored) });
			}
		} catch {
			// ignore parse errors
		}
	}, []);

	const handleChange = (key: keyof Settings, value: string | boolean) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			await new Promise((r) => setTimeout(r, 400));
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
			toast('Settings saved successfully!', 'success');
		} catch {
			toast('Failed to save settings.', 'error');
		} finally {
			setSaving(false);
		}
	};

	const SectionHeader = ({
		icon,
		title,
	}: {
		icon: React.ReactNode;
		title: string;
	}) => (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '0.6rem',
				marginBottom: '1.25rem',
			}}
		>
			<span style={{ color: 'var(--primary)' }}>{icon}</span>
			<h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h2>
		</div>
	);

	return (
		<div>
			<ToastContainer
				toasts={toasts}
				dismiss={dismiss}
			/>

			<div style={{ marginBottom: '2rem' }}>
				<h1
					style={{
						fontSize: '1.75rem',
						fontWeight: 700,
						color: 'var(--text-primary)',
						margin: 0,
					}}
				>
					Settings
				</h1>
				<p
					style={{
						color: 'var(--text-secondary)',
						margin: '0.5rem 0 0',
						fontSize: '0.9rem',
					}}
				>
					Configure your restaurant preferences and system settings.
				</p>
			</div>

			<form
				onSubmit={handleSave}
				style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
			>
				{/* General Info */}
				<div
					className="glass-panel"
					style={{ padding: '1.75rem' }}
				>
					<SectionHeader
						icon={<Store size={20} />}
						title="General Information"
					/>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
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
								Restaurant Name
							</label>
							<input
								type="text"
								value={settings.restaurantName}
								onChange={(e) => handleChange('restaurantName', e.target.value)}
								style={inputStyle}
							/>
						</div>
						<div>
							<label
								style={{
									display: 'block',
									marginBottom: '0.4rem',
									fontSize: '0.875rem',
									fontWeight: 600,
								}}
							>
								Contact Number
							</label>
							<input
								type="text"
								value={settings.contactNumber}
								onChange={(e) => handleChange('contactNumber', e.target.value)}
								style={inputStyle}
							/>
						</div>
						<div style={{ gridColumn: '1 / -1' }}>
							<label
								style={{
									display: 'block',
									marginBottom: '0.4rem',
									fontSize: '0.875rem',
									fontWeight: 600,
								}}
							>
								Address
							</label>
							<input
								type="text"
								value={settings.address}
								onChange={(e) => handleChange('address', e.target.value)}
								style={inputStyle}
							/>
						</div>
					</div>
				</div>

				{/* Billing & Tax */}
				<div
					className="glass-panel"
					style={{ padding: '1.75rem' }}
				>
					<SectionHeader
						icon={<CreditCard size={20} />}
						title="Billing & Tax"
					/>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
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
								Currency
							</label>
							<select
								value={settings.currency}
								onChange={(e) => handleChange('currency', e.target.value)}
								style={inputStyle}
							>
								<option value="NPR">NPR (Nepalese Rupee)</option>
								<option value="USD">USD (US Dollar)</option>
								<option value="INR">INR (Indian Rupee)</option>
							</select>
						</div>
						<div>
							<label
								style={{
									display: 'block',
									marginBottom: '0.4rem',
									fontSize: '0.875rem',
									fontWeight: 600,
								}}
							>
								VAT Rate (%)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								value={settings.vatRate}
								onChange={(e) => handleChange('vatRate', e.target.value)}
								style={inputStyle}
							/>
						</div>
					</div>
				</div>

				{/* System Preferences */}
				<div
					className="glass-panel"
					style={{ padding: '1.75rem' }}
				>
					<SectionHeader
						icon={<Bell size={20} />}
						title="System Preferences"
					/>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
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
								Dashboard Auto-Refresh (seconds)
							</label>
							<input
								type="number"
								min="10"
								max="300"
								value={settings.autoRefreshInterval}
								onChange={(e) =>
									handleChange('autoRefreshInterval', e.target.value)
								}
								style={inputStyle}
							/>
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '1rem',
								paddingTop: '1.4rem',
							}}
						>
							<label
								style={{
									fontSize: '0.875rem',
									fontWeight: 600,
									cursor: 'pointer',
									userSelect: 'none',
								}}
							>
								Order Notifications
							</label>
							<button
								type="button"
								onClick={() =>
									handleChange(
										'orderNotifications',
										!settings.orderNotifications,
									)
								}
								style={{
									width: '44px',
									height: '24px',
									borderRadius: '12px',
									border: 'none',
									cursor: 'pointer',
									background: settings.orderNotifications
										? 'var(--primary)'
										: 'var(--glass-border)',
									position: 'relative',
									transition: 'background 0.2s',
									flexShrink: 0,
								}}
							>
								<span
									style={{
										position: 'absolute',
										top: '3px',
										left: settings.orderNotifications ? '23px' : '3px',
										width: '18px',
										height: '18px',
										borderRadius: '50%',
										background: '#fff',
										transition: 'left 0.2s',
									}}
								/>
							</button>
						</div>
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<button
						type="submit"
						disabled={saving}
						style={{
							background: 'var(--primary)',
							color: '#fff',
							border: 'none',
							borderRadius: '10px',
							padding: '0.75rem 2rem',
							fontWeight: 700,
							fontSize: '0.95rem',
							cursor: saving ? 'not-allowed' : 'pointer',
							opacity: saving ? 0.7 : 1,
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							transition: 'opacity 0.2s',
						}}
					>
						<Save size={16} />
						{saving ? 'Saving…' : 'Save Settings'}
					</button>
				</div>
			</form>
		</div>
	);
}
