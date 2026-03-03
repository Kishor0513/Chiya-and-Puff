'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, UtensilsCrossed, Bell, Minus, Plus, Search, ChevronRight } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';

export default function CustomerMenu() {
    const { id: tableId } = useParams();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [menu, setMenu] = useState<any[]>([]);
    const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetch('/api/menu').then(r => r.json()).then(data => {
            setMenu(data.filter((d: any) => d.available));
            setLoading(false);
        });
    }, []);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === item.id);
            if (existing) {
                return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            return prev.map(p => {
                if (p.id === id) return { ...p, quantity: Math.max(0, p.quantity + delta) };
                return p;
            }).filter(p => p.quantity > 0);
        });
    };

    const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const categories = ['All', ...new Set(menu.map(m => m.category))];

    const filteredMenu = menu.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const placeOrder = async () => {
        if (cart.length === 0) return;
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId,
                    token,
                    items: cart.map(c => ({ menuItemId: c.id, quantity: c.quantity }))
                })
            });
            if (res.ok) {
                alert('Your order has been placed! The waiter will be with you shortly.');
                setCart([]);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to place order');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };

    const callWaiter = async () => {
        try {
            const res = await fetch('/api/tables', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, status: 'NEEDS_SERVICE', token })
            });
            if (res.ok) alert('Waiter has been notified.');
        } catch (e) { console.error(e); }
    };

    if (!token) {
        return (
            <div className="page-wrapper" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)' }}>Invalid QR Code</h1>
                <p>Please scan the code on your table again.</p>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: cart.length > 0 ? '120px' : '40px' }}>
            <header style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'var(--card-bg)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-color)',
                padding: '1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                        <UtensilsCrossed size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Chiya & Puff</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Table Ordering</p>
                    </div>
                </div>

                <button className="btn btn-secondary" onClick={callWaiter} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <Bell size={16} /> Service
                </button>
            </header>

            <div className="container" style={{ marginTop: '2rem' }}>
                {/* Search & Filter */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search our menu..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '999px',
                                    border: 'none',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    background: categoryFilter === cat ? 'var(--text-main)' : 'var(--card-bg)',
                                    color: categoryFilter === cat ? 'var(--background)' : 'var(--text-main)',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading menu...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {filteredMenu.map(item => (
                            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{item.name}</h3>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {item.price.toFixed(2)}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1, marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                    {item.description || "A delicious choice prepared fresh for you."}
                                </p>
                                <button
                                    onClick={() => addToCart(item)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-color)',
                                        background: 'var(--background)', fontWeight: 600, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'var(--transition)'
                                    }}
                                    className="hover-lift"
                                >
                                    <Plus size={16} /> Add to Order
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Cart */}
            {cart.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, width: '100vw', padding: '1rem',
                    background: 'var(--card-bg)', backdropFilter: 'blur(30px)', borderTop: '1px solid var(--border-color)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', zIndex: 100,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ flex: 1, maxWidth: 'container', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                {cart.reduce((a, c) => a + c.quantity, 0)} Items
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                                Rs. {cartTotal.toFixed(2)}
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={placeOrder} style={{ padding: '0.875rem 2rem' }}>
                            Place Order <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
