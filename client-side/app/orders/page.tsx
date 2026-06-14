'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface OrderItem { id: number; menuItem: { name: string; price: number }; quantity: number; unitPrice: number; totalPrice: number; }
interface Order { id: number; customer: { name: string; phone: string }; tableNumber: number; subtotal: number; tax: number; discount: number; total: number; paymentMethod: string; status: string; createdAt: string; items: OrderItem[]; }

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [search, setSearch] = useState('');
    const gold = '#c9a84c';

    const loadOrders = useCallback(async () => {
        try { const res = await API.get('/orders'); setOrders(res.data); } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const filtered = orders.filter(o =>
        o.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toString().includes(search) ||
        o.paymentMethod.toLowerCase().includes(search.toLowerCase())
    );

    const handlePrint = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const date = new Date(order.createdAt);
        const dateStr = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const itemsHTML = order.items?.map(item => `<tr><td style="padding:8px 5px;border-bottom:1px solid #eee;">${item.menuItem?.name}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs.${item.unitPrice?.toFixed(2)}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs.${item.totalPrice?.toFixed(2)}</td></tr>`).join('') || '';
        printWindow.document.write(`<html><head><title>Invoice #${order.id}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;max-width:380px;margin:0 auto;padding:20px;color:#222;font-size:13px;}.center{text-align:center;}.dashed{border-top:2px dashed #999;margin:10px 0;}.solid{border-top:2px solid #222;margin:10px 0;}table{width:100%;border-collapse:collapse;}th{padding:8px 5px;border-bottom:2px solid #222;border-top:2px solid #222;}.row{display:flex;justify-content:space-between;padding:5px 0;}.total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:bold;}</style></head><body><div class="center"><p style="font-size:22px;font-weight:bold;">🍽️ RESTAURANT</p><div class="dashed"></div><p style="font-size:11px;color:#666;">📅 ${dateStr} | 🕐 ${timeStr}</p></div><div style="background:#f9f9f9;padding:10px;margin:12px 0;border-radius:5px;"><div class="row"><span>Bill No.</span><span><b>#${order.id}</b></span></div><div class="row"><span>Customer</span><span><b>${order.customer?.name}</b></span></div><div class="row"><span>Table</span><span><b>${order.tableNumber || 'Take Away'}</b></span></div><div class="row"><span>Payment</span><span><b>${order.paymentMethod}</b></span></div></div><table><thead><tr><th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead><tbody>${itemsHTML}</tbody></table><div class="dashed"></div><div class="row"><span>Subtotal</span><span>Rs.${order.subtotal?.toFixed(2)}</span></div><div class="row"><span>Tax</span><span>Rs.${order.tax?.toFixed(2)}</span></div>${order.discount > 0 ? `<div class="row" style="color:red;"><span>Discount</span><span>- Rs.${order.discount?.toFixed(2)}</span></div>` : ''}<div class="solid"></div><div class="total-row"><span>TOTAL</span><span style="color:#16a34a;">Rs.${order.total?.toFixed(2)}</span></div><div class="solid"></div><div class="center" style="margin-top:15px;"><p style="font-size:16px;">🙏 Thank You!</p><p style="color:#666;font-size:12px;">Please Visit Again ⭐</p></div></body></html>`);
        printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close();
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>⏳ Loading orders...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>📋 Order History</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>View all previous bills</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Orders', value: orders.length, color: gold, prefix: '' },
                        { label: 'Total Revenue', value: orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2), color: '#4caf79', prefix: 'Rs.' },
                        { label: 'Average Bill', value: orders.length > 0 ? (orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length).toFixed(2) : '0.00', color: '#4c9ac9', prefix: 'Rs.' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.prefix}{s.value}</p>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px' }}>
                    <input style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#fff', outline: 'none', boxSizing: 'border-box' as const }} placeholder="🔍 Search by customer, bill no, payment..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#555' }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filtered.map(order => (
                            <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                                <div style={{ padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' as const }}>
                                                <span style={{ fontWeight: 700, color: gold, fontSize: '16px' }}>#{order.id}</span>
                                                <span style={{ fontWeight: 600, color: '#ddd' }}>{order.customer?.name}</span>
                                                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: order.paymentMethod === 'cash' ? 'rgba(34,197,94,0.15)' : order.paymentMethod === 'card' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)', color: order.paymentMethod === 'cash' ? '#4ade80' : order.paymentMethod === 'card' ? '#60a5fa' : '#c084fc' }}>
                                                    {order.paymentMethod === 'cash' ? '💵 Cash' : order.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'}
                                                </span>
                                                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: order.tableNumber === 0 ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.08)', color: order.tableNumber === 0 ? '#fbbf24' : '#888' }}>
                                                    {order.tableNumber === 0 ? '🛍️ Take Away' : `🪑 Table ${order.tableNumber}`}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#555' }}>📅 {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, color: '#4ade80', fontSize: '20px' }}>Rs. {order.total?.toFixed(2)}</p>
                                            <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{order.items?.length || 0} items</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                                            {selectedOrder?.id === order.id ? '▲ Hide Details' : '▼ View Details'}
                                        </button>
                                        <button onClick={() => handlePrint(order)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                                            🖨️ Reprint
                                        </button>
                                    </div>
                                </div>

                                {selectedOrder?.id === order.id && (
                                    <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                {['Item', 'Qty', 'Price', 'Total'].map(h => (
                                                    <th key={h} style={{ padding: '8px 0', fontSize: '11px', color: '#666', textAlign: h === 'Item' ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {order.items?.map(item => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px 0', color: '#ccc', fontSize: '13px' }}>{item.menuItem?.name}</td>
                                                    <td style={{ padding: '8px 0', color: '#888', fontSize: '13px', textAlign: 'right' }}>{item.quantity}</td>
                                                    <td style={{ padding: '8px 0', color: '#888', fontSize: '13px', textAlign: 'right' }}>Rs. {item.unitPrice?.toFixed(2)}</td>
                                                    <td style={{ padding: '8px 0', color: '#ccc', fontSize: '13px', textAlign: 'right' }}>Rs. {item.totalPrice?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {[
                                                { label: 'Subtotal', value: `Rs. ${order.subtotal?.toFixed(2)}`, color: '#888' },
                                                { label: 'Tax', value: `Rs. ${order.tax?.toFixed(2)}`, color: '#888' },
                                                ...(order.discount > 0 ? [{ label: 'Discount', value: `- Rs. ${order.discount?.toFixed(2)}`, color: '#f87171' }] : []),
                                                { label: 'Total', value: `Rs. ${order.total?.toFixed(2)}`, color: '#4ade80' },
                                            ].map(r => (
                                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                    <span style={{ color: '#666' }}>{r.label}</span>
                                                    <span style={{ color: r.color, fontWeight: r.label === 'Total' ? 700 : 400 }}>{r.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}