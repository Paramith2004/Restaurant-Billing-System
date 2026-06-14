'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import API from '@/lib/api';

interface MenuItem { id: number; name: string; description: string; price: number; category: string; available: boolean; }

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');

    const loadMenu = useCallback(() => { API.get('/menu').then(res => setItems(res.data)); }, []);
    useEffect(() => { loadMenu(); }, [loadMenu]);

    const handleAdd = async () => {
        await API.post('/menu', { ...form, available: true });
        setMessage('✅ Item added!');
        setForm({ name: '', description: '', price: '', category: '' });
        loadMenu();
    };

    const handleDelete = async (id: number) => {
        await API.delete(`/menu/${id}`);
        setMessage('🗑️ Item deleted!');
        loadMenu();
    };

    const filtered = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    const gold = '#c9a84c';
    const inputStyle = {
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#fff',
        outline: 'none', width: '100%', boxSizing: 'border-box' as const,
    };

    const categories = [...new Set(items.map(i => i.category))];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>🍛 Menu Management</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Manage food items & categories</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

                {message && (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
                        {message}
                    </div>
                )}

                {/* Add Form */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>➕ Add New Item</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                        {[
                            { label: 'Name *', key: 'name', placeholder: 'Rice & Curry' },
                            { label: 'Description', key: 'description', placeholder: 'Delicious...' },
                            { label: 'Price (Rs.) *', key: 'price', placeholder: '350' },
                            { label: 'Category *', key: 'category', placeholder: 'Main Course' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.label}</label>
                                <input style={inputStyle} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                                       type={f.key === 'price' ? 'number' : 'text'}
                                       onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                            </div>
                        ))}
                        <button onClick={handleAdd} style={{ background: gold, color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                            + Add
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Items', value: items.length, color: gold },
                        { label: 'Categories', value: categories.length, color: '#4c9ac9' },
                        { label: 'Available', value: items.filter(i => i.available).length, color: '#4caf79' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: '16px' }}>
                    <input style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px' }} placeholder="🔍 Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Table */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'rgba(201,168,76,0.1)', padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '16px' }}>
                            {['Name', 'Category', 'Price', 'Available', 'Action'].map(h => (
                                <p key={h} style={{ fontSize: '11px', color: gold, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</p>
                            ))}
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>
                            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🍛</p>
                            <p>No menu items found</p>
                        </div>
                    ) : (
                        filtered.map((item, i) => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#ddd' }}>{item.name}</p>
                                    {item.description && <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{item.description}</p>}
                                </div>
                                <span style={{ background: 'rgba(201,168,76,0.15)', color: gold, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>{item.category}</span>
                                <p style={{ color: gold, fontWeight: 700 }}>Rs. {item.price}</p>
                                <p style={{ color: item.available ? '#4ade80' : '#f87171' }}>{item.available ? '✅' : '❌'}</p>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
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