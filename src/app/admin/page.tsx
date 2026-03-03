'use client';

import { useEffect, useState } from 'react';
import { Users, UtensilsCrossed, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalTables: 0,
        occupiedTables: 0,
        pendingOrders: 0,
        totalStaff: 0
    });

    useEffect(() => {
        // In a real app we would fetch these from an API
        // For now we simulate an API call retrieving current counts
        setStats({
            totalTables: 12,
            occupiedTables: 3,
            pendingOrders: 5,
            totalStaff: 4
        });
    }, []);

    const statCards = [
        { label: 'Total Tables', value: stats.totalTables, icon: <UtensilsCrossed size={24} />, color: 'var(--primary)' },
        { label: 'Occupied', value: stats.occupiedTables, icon: <CheckCircle size={24} />, color: 'var(--secondary)' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: <Clock size={24} />, color: '#F5A623' },
        { label: 'Total Staff', value: stats.totalStaff, icon: <Users size={24} />, color: '#4A90E2' },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: `rgba(255, 255, 255, 0.5)`,
                            color: stat.color,
                            padding: '1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{stat.label}</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Dummy activity stream */}
                        {[
                            { time: '10:45 AM', event: 'Table 4 ordered 2x Chicken Momo' },
                            { time: '10:30 AM', event: 'Table 2 paid final bill' },
                            { time: '10:15 AM', event: 'Waiter "John" logged in' },
                        ].map((act, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: idx < 2 ? '1px solid var(--border-color)' : 'none' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{act.time}</span>
                                <span>{act.event}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                    <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Need to jump straight to management?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white' }}>+ Add New Menu Item</button>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white' }}>Manage Waitstaff</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
