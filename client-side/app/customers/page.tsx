'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';

interface Customer { id: number; name: string; phone: string; email: string; }

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');

    const loadCustomers = useCallback(() => {
        API.get('/customers').then(res => setCustomers(res.data));
    }, []);

    useEffect(() => { loadCustomers(); }, [loadCustomers]);

    const handleAdd = async () => {
        await API.post('/customers', form);
        setMessage('✅ Customer added!');
        setForm({ name: '', phone: '', email: '' });
        loadCustomers();
    };

    const handleDelete = async (id: number) => {
        await API.delete(`/customers/${id}`);
        setMessage('🗑️ Customer deleted!');
        loadCustomers();
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
    );

    const gold = '#c9a84c';
    const inputStyle = {
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#fff',
        outline: 'none', width: '100%', boxSizing: 'border-box' as const,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>👥 Customer Management</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Manage customer records</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

                {message && (
                    <div style={{ background: message.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.includes('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: message.includes('✅') ? '#4ade80' : '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
                        {message}
                    </div>
                )}

                {/* Add Form */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>➕ Add New Customer</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Name *</label>
                            <input style={inputStyle} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone *</label>
                            <input style={inputStyle} placeholder="07X XXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                            <input style={inputStyle} placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <button onClick={handleAdd} style={{ background: gold, color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                            + Add
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '16px' }}>
                    <input style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px' }} placeholder="🔍 Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Customers', value: customers.length, color: gold },
                        { label: 'Search Results', value: filtered.length, color: '#4c9ac9' },
                        { label: 'Active Records', value: customers.length, color: '#4caf79' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'rgba(201,168,76,0.1)', padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 1fr', gap: '16px' }}>
                            {['Name', 'Phone', 'Email', 'Action'].map(h => (
                                <p key={h} style={{ fontSize: '11px', color: gold, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</p>
                            ))}
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>
                            <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
                            <p>No customers found</p>
                        </div>
                    ) : (
                        filtered.map((c, i) => (
                            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                                <p style={{ fontWeight: 600, color: '#ddd' }}>{c.name}</p>
                                <p style={{ color: '#888', fontSize: '13px' }}>{c.phone}</p>
                                <p style={{ color: '#888', fontSize: '13px' }}>{c.email || '—'}</p>
                                <button onClick={() => handleDelete(c.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}