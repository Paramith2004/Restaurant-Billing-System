'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import API from '@/lib/api';

interface Summary { totalOrders: number; totalRevenue: number; totalTax: number; totalDiscount: number; totalMenuItems: number; totalCustomers: number; }
interface Order { id: number; customer: { name: string }; total: number; paymentMethod: string; tableNumber: number; status: string; createdAt: string; }
interface PaymentMethods { cash?: number; card?: number; upi?: number; }

export default function ReportsPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({});
    const [loading, setLoading] = useState(true);
    const gold = '#c9a84c';

    const loadReports = useCallback(() => {
        Promise.all([
            API.get('/reports/summary'),
            API.get('/reports/recent-orders'),
            API.get('/reports/payment-methods'),
        ]).then(([s, o, p]) => { setSummary(s.data); setRecentOrders(o.data); setPaymentMethods(p.data); setLoading(false); });
    }, []);

    useEffect(() => { loadReports(); }, [loadReports]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>⏳ Loading reports...</p>
        </div>
    );

    const totalPayments = Object.values(paymentMethods).reduce((a, b) => a + b, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>📊 Reports & Analytics</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Sales insights & performance</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { icon: '🧾', label: 'Total Orders', value: summary?.totalOrders, color: gold },
                        { icon: '💰', label: 'Total Revenue', value: `Rs. ${summary?.totalRevenue.toFixed(2)}`, color: '#4caf79' },
                        { icon: '👥', label: 'Total Customers', value: summary?.totalCustomers, color: '#4c9ac9' },
                        { icon: '🍛', label: 'Menu Items', value: summary?.totalMenuItems, color: '#c94c7a' },
                        { icon: '🏷️', label: 'Tax Collected', value: `Rs. ${summary?.totalTax.toFixed(2)}`, color: '#fbbf24' },
                        { icon: '🎁', label: 'Total Discounts', value: `Rs. ${summary?.totalDiscount.toFixed(2)}`, color: '#f87171' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '36px', marginBottom: '8px' }}>{s.icon}</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

                    {/* Payment Methods */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>💳 Payment Methods</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {Object.entries(paymentMethods).map(([method, count]) => (
                                <div key={method}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', color: '#aaa', textTransform: 'capitalize' }}>
                                            {method === 'cash' ? '💵' : method === 'card' ? '💳' : '📱'} {method}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#666' }}>{count} orders ({Math.round((count / totalPayments) * 100)}%)</span>
                                    </div>
                                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '8px' }}>
                                        <div style={{ height: '8px', borderRadius: '999px', width: `${Math.round((count / totalPayments) * 100)}%`, background: method === 'cash' ? '#4ade80' : method === 'card' ? '#60a5fa' : '#c084fc', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>📈 Quick Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Average Order Value', value: `Rs. ${summary?.totalOrders ? (summary.totalRevenue / summary.totalOrders).toFixed(2) : '0.00'}`, color: gold },
                                { label: 'Average Tax per Order', value: `Rs. ${summary?.totalOrders ? (summary.totalTax / summary.totalOrders).toFixed(2) : '0.00'}`, color: '#fbbf24' },
                                { label: 'Average Discount per Order', value: `Rs. ${summary?.totalOrders ? (summary.totalDiscount / summary.totalOrders).toFixed(2) : '0.00'}`, color: '#f87171' },
                                { label: 'Net Revenue', value: `Rs. ${summary?.totalRevenue.toFixed(2)}`, color: '#4ade80' },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '13px', color: '#888' }}>{s.label}</span>
                                    <span style={{ fontWeight: 700, color: s.color, fontSize: '14px' }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.1)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>🕒 Recent Orders</h3>
                    </div>
                    <div style={{ overflowX: 'auto' as const }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Bill ID', 'Customer', 'Table', 'Payment', 'Total', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#555' }}>No orders yet</td></tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: gold }}>#{order.id}</td>
                                        <td style={{ padding: '12px 16px', color: '#ccc' }}>{order.customer?.name}</td>
                                        <td style={{ padding: '12px 16px', color: '#888' }}>{order.tableNumber === 0 ? '🛍️ Take Away' : `Table ${order.tableNumber}`}</td>
                                        <td style={{ padding: '12px 16px', color: '#888', textTransform: 'capitalize' }}>
                                            {order.paymentMethod === 'cash' ? '💵' : order.paymentMethod === 'card' ? '💳' : '📱'} {order.paymentMethod}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4ade80' }}>Rs. {order.total?.toFixed(2)}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{order.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}