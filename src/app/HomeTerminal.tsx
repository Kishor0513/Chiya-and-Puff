'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserCircle } from 'lucide-react';

export default function HomeTerminal() {
    const [tableNum, setTableNum] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableNum.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/public/table?number=${tableNum}`);
            if (!res.ok) {
                setError('Table not found. Please try again or ask staff.');
                setLoading(false);
                return;
            }
            const data = await res.json();
            router.push(`/table/${data.id}?token=${data.qrData}`);
        } catch (err) {
            setError('Network error connecting to the terminal.');
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <UserCircle size={32} />
            </div>

            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Walk-in Terminal</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>Enter your assigned Table Number to view the menu and place your order.</p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <input
                        type="text"
                        placeholder="e.g. 1"
                        value={tableNum}
                        onChange={(e) => setTableNum(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                            outline: 'none',
                            fontWeight: 600,
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        required
                    />
                </div>

                {error && <p style={{ color: 'var(--primary)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                    {loading ? 'Connecting...' : <><LogIn size={20} /> Access Table</>}
                </button>
            </form>
        </div>
    );
}
