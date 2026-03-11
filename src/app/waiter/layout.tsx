'use client';

import {
    LogOut,
    Coffee,
} from 'lucide-react';

export default function WaiterLayout({ children }: { children: React.ReactNode }) {

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', background: 'var(--background)' }}>
            {/* Header Notification Bar */}
            <header style={{
                padding: '1rem 5%',
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                        <Coffee size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Waitstaff Portal</h2>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        background: 'rgba(0,0,0,0.05)',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    <LogOut size={16} />
                    <span className="hide-on-mobile">Sign Out</span>
                </button>
            </header>

            {/* Main Waiter Content Area */}
            <main style={{ flex: 1, padding: '2rem 5%' }}>
                {children}
            </main>

            <style jsx global>{`
        @media (max-width: 600px) {
          .hide-on-mobile { display: none; }
        }
      `}</style>
        </div>
    );
}
