'use client';

import { Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Restaurant Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure platform preferences and restaurant details.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    General Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Restaurant Name</label>
                        <input type="text" defaultValue="Chiya & Puff" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Contact Number</label>
                        <input type="text" defaultValue="+977-9800000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location Address</label>
                        <input type="text" defaultValue="Kathmandu, Nepal" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Billing & Currency
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Default Currency</label>
                        <select defaultValue="NPR" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}>
                            <option value="NPR">Nepalese Rupee (NPR / Rs.)</option>
                            <option value="USD">US Dollar (USD / $)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>VAT Rate (%)</label>
                        <input type="number" defaultValue="13" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert('Settings saved successfully! (Demo Mode)')}>
                        <Save size={18} /> Save Configurations
                    </button>
                </div>
            </div>
        </div>
    );
}
