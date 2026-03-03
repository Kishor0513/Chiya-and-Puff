'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Clock, ReceiptText, ChefHat, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WaiterTableDetails() {
    const { id: tableId } = useParams();
    const router = useRouter();

    const [table, setTable] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchTable = async () => {
        try {
            const res = await fetch('/api/tables');
            if (res.ok) {
                const data = await res.json();
                const t = data.find((x: any) => x.id === tableId);
                setTable(t);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchTable();
        const intv = setInterval(fetchTable, 5000);
        return () => clearInterval(intv);
    }, []);

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchTable();
        } catch (e) { console.error(e); }
    };

    const markTableServiced = async () => {
        try {
            await fetch(`/api/tables/${tableId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'OCCUPIED' })
            });
            fetchTable();
        } catch (e) { console.error(e); }
    };

    const generateBill = async () => {
        if (!confirm('Finalize bill for this table?')) return;
        try {
            // Mark all unbilled orders as BILLED
            for (const order of table.orders) {
                if (order.status !== 'BILLED') {
                    await updateOrderStatus(order.id, 'BILLED');
                }
            }
            alert('Bill Generated!');
            router.push('/waiter');
        } catch (e) { console.error(e); }
    };

    if (loading) return <div>Loading table details...</div>;
    if (!table) return <div>Table not found.</div>;

    const totalUnbilled = table.orders
        .filter((o: any) => o.status !== 'BILLED')
        .reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

    return (
        <div>
            <Link href="/waiter" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 600 }}>
                <ArrowLeft size={18} /> Back to Floor Plan
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Table {table.tableNumber} Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                        <span style={{
                            background: table.status === 'NEEDS_SERVICE' ? 'rgba(255, 90, 95, 0.1)' : 'rgba(0, 166, 153, 0.1)',
                            color: table.status === 'NEEDS_SERVICE' ? 'var(--primary)' : 'var(--secondary)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 700
                        }}>
                            {table.status.replace('_', ' ')}
                        </span>
                        {table.status === 'NEEDS_SERVICE' && (
                            <button
                                onClick={markTableServiced}
                                className="btn btn-primary"
                                style={{ padding: '0.25rem 1rem', fontSize: '0.875rem', marginLeft: '1rem' }}
                            >
                                Mark Serviced
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Unbilled Total</p>
                    <h2 style={{ color: 'var(--primary)', margin: 0 }}>Rs. {totalUnbilled.toFixed(2)}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {table.orders.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active orders for this table.
                    </div>
                ) : (
                    table.orders.map((order: any) => (
                        <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <div style={{ fontWeight: 600 }}>
                                    Order #{order.id.slice(0, 8)}
                                    <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, marginRight: '1rem' }}>Rs. {order.totalAmount.toFixed(2)}</span>

                                    {order.status === 'PENDING' && (
                                        <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                            <ChefHat size={16} /> Accept & Prepare
                                        </button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                            <Check size={16} /> Mark Delivered
                                        </button>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                            <Check size={18} /> Delivered
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {order.items.map((item: any) => (
                                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ background: 'rgba(0,0,0,0.05)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 600 }}>
                                                {item.quantity}
                                            </span>
                                            <span>{item.menuItem.name}</span>
                                        </div>
                                        <span style={{ color: 'var(--text-muted)' }}>Rs. {item.subTotal.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={generateBill}
                    className="btn btn-primary"
                    style={{ width: '100%', maxWidth: '400px', padding: '1.25rem', fontSize: '1.125rem' }}
                    disabled={table.orders.length === 0}
                >
                    <ReceiptText size={20} /> Generate Final Bill & Checkout
                </button>
            </div>
        </div>
    );
}
