'use client';

import { AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

export function useToast() {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toast = useCallback((message: string, type: ToastType = 'success') => {
		const id = Math.random().toString(36).slice(2, 9);
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	}, []);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return { toasts, toast, dismiss };
}

const ICONS: Record<ToastType, React.ReactNode> = {
	success: <CheckCircle size={18} />,
	error: <XCircle size={18} />,
	info: <AlertCircle size={18} />,
};

const COLORS: Record<ToastType, string> = {
	success: '#00A699',
	error: '#FF5A5F',
	info: '#4A90E2',
};

interface ToastContainerProps {
	toasts: Toast[];
	dismiss: (id: string) => void;
}

export function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
	if (toasts.length === 0) return null;

	return (
		<>
			<style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .toast-item {
                    animation: toast-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
            `}</style>
			<div
				style={{
					position: 'fixed',
					bottom: '1.5rem',
					right: '1.5rem',
					display: 'flex',
					flexDirection: 'column',
					gap: '0.75rem',
					zIndex: 9999,
					maxWidth: '420px',
					width: 'calc(100vw - 3rem)',
				}}
			>
				{toasts.map((t) => (
					<div
						key={t.id}
						className="toast-item"
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.875rem',
							padding: '0.875rem 1.125rem',
							borderRadius: '14px',
							background: 'var(--card-bg)',
							backdropFilter: 'blur(20px)',
							WebkitBackdropFilter: 'blur(20px)',
							border: `1px solid ${COLORS[t.type]}35`,
							boxShadow: `0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px ${COLORS[t.type]}15`,
							color: 'var(--text-main)',
						}}
					>
						<span
							style={{ color: COLORS[t.type], flexShrink: 0, display: 'flex' }}
						>
							{ICONS[t.type]}
						</span>
						<span
							style={{
								flex: 1,
								fontSize: '0.9rem',
								fontWeight: 500,
								lineHeight: 1.4,
							}}
						>
							{t.message}
						</span>
						<button
							onClick={() => dismiss(t.id)}
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								color: 'var(--text-muted)',
								padding: '0.25rem',
								display: 'flex',
								flexShrink: 0,
								borderRadius: '6px',
							}}
						>
							<X size={16} />
						</button>
					</div>
				))}
			</div>
		</>
	);
}
