'use client';

import { useState, useEffect } from 'react';
import { Bell, Copy, Plus } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';

export default function WaiterDashboard() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrModal, setQrModal] = useState<{ url: string, tableNum: string } | null>(null);

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables');
            if (res.ok) {
                const data = await res.json();
                setTables(data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchTables();
        // Simulate real-time polling
        const interval = setInterval(fetchTables, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'AVAILABLE') return { bg: 'rgba(0, 166, 153, 0.1)', color: 'var(--secondary)' };
        if (status === 'OCCUPIED') return { bg: 'rgba(245, 166, 35, 0.1)', color: '#F5A623' };
        if (status === 'NEEDS_SERVICE') return { bg: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)' };
        return { bg: '#eee', color: '#666' };
    };

    const handleCopyLink = (tableId: string, qrData: string) => {
        const url = `${window.location.origin}/table/${tableId}?token=${qrData}`;
        navigator.clipboard.writeText(url);
        alert('Table QR link copied to clipboard!');
    };

    // Mock function for admins testing Waiter Dashboard to spawn tables
    const generateDummyTable = async () => {
        const tableNumber = prompt("Enter a new table number:");
        if (!tableNumber) return;

        await fetch('/api/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableNumber })
        });
        fetchTables();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Live Floor Plan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor tables and incoming orders.</p>
                </div>
                <button className="btn btn-secondary" onClick={generateDummyTable}>
                    <Plus size={16} /> <span className="hide-on-mobile">Add Table</span>
                </button>
            </div>

            {loading && tables.length === 0 ? (
                <div>Loading live table statuses...</div>
            ) : tables.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No tables generated. Click Add Table to create the floor plan.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {tables.map(table => {
                        const activeOrder = table.orders.length > 0 ? table.orders[0] : null;
                        const cStyles = getStatusColor(table.status);

                        return (
                            <div key={table.id} className="glass-panel hover-lift" style={{
                                padding: '1.5rem',
                                position: 'relative',
                                borderTop: `4px solid ${cStyles.color}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Table {table.tableNumber}</h2>
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            background: cStyles.bg,
                                            color: cStyles.color,
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            {table.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {table.status === 'NEEDS_SERVICE' && (
                                        <span className="pulse-dot" style={{ background: 'var(--primary)', width: '12px', height: '12px', borderRadius: '50%' }} />
                                    )}
                                </div>

                                {activeOrder ? (
                                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            Order Status: <span style={{ color: 'var(--text-main)' }}>{activeOrder.status}</span>
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {activeOrder.items.slice(0, 3).map((item: any) => (
                                                <li key={item.id}>{item.quantity}x {item.menuItem.name}</li>
                                            ))}
                                            {activeOrder.items.length > 3 && <li>...and {activeOrder.items.length - 3} more</li>}
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        No active orders.
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/table/${table.id}?token=${table.qrData}`;
                                            setQrModal({ url, tableNum: table.tableNumber });
                                        }}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <QrCode size={16} /> Show QR
                                    </button>
                                    <button
                                        onClick={() => handleCopyLink(table.id, table.qrData)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <Copy size={16} /> Copy
                                    </button>
                                    <Link href={`/waiter/table/${table.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}>
                                        View & Manage
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QR Code Modal Display */}
            {qrModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '400px', width: '100%', borderRadius: '24px' }}>
                        <h2 style={{ marginBottom: '0.25rem' }}>Table {qrModal.tableNum}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>Have your customer scan this code.</p>

                        <div style={{ display: 'inline-block', background: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <QRCodeSVG value={qrModal.url} size={220} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                                navigator.clipboard.writeText(qrModal.url);
                                alert('Link copied to clipboard!');
                            }}>Copy Link</button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setQrModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .pulse-dot {
          box-shadow: 0 0 0 0 rgba(255, 90, 95, 1);
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 90, 95, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0);
          }
        }
      `}</style>
        </div>
    );
}
