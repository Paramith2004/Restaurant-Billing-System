'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface MenuItem { id: number; name: string; price: number; category: string; }
interface Customer { id: number; name: string; phone: string; }
interface BillItem { menuItemId: number; name: string; quantity: number; unitPrice: number; totalPrice: number; }
interface Bill { id: number; customer: { name: string }; tableNumber: number; subtotal: number; tax: number; discount: number; total: number; paymentMethod: string; orderType: string; }

export default function BillingPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [orderType, setOrderType] = useState('dine-in');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState('0');
    const [serviceCharge, setServiceCharge] = useState('0');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [bill, setBill] = useState<Bill | null>(null);
    const [message, setMessage] = useState('');
    const [givenMoney, setGivenMoney] = useState('0');
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [addingCustomer, setAddingCustomer] = useState(false);

    const gold = '#c9a84c';

    const loadData = useCallback(() => {
        API.get('/customers').then(res => setCustomers(res.data));
        API.get('/menu').then(res => setMenuItems(res.data));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) { alert('Please enter name and phone!'); return; }
        setAddingCustomer(true);
        try {
            const res = await API.post('/customers', newCustomer);
            await loadData();
            setSelectedCustomer(res.data.id.toString());
            setShowAddCustomer(false);
            setNewCustomer({ name: '', phone: '', email: '' });
        } finally { setAddingCustomer(false); }
    };

    const handleAddItem = () => {
        const menuItem = menuItems.find(m => m.id === parseInt(selectedMenuItem));
        if (!menuItem) return;
        const qty = parseInt(quantity);
        const existing = billItems.find(b => b.menuItemId === menuItem.id);
        if (existing) {
            setBillItems(billItems.map(b => b.menuItemId === menuItem.id ? { ...b, quantity: b.quantity + qty, totalPrice: (b.quantity + qty) * b.unitPrice } : b));
        } else {
            setBillItems([...billItems, { menuItemId: menuItem.id, name: menuItem.name, quantity: qty, unitPrice: menuItem.price, totalPrice: menuItem.price * qty }]);
        }
        setSelectedMenuItem(''); setQuantity('1');
    };

    const handleRemoveItem = (menuItemId: number) => setBillItems(billItems.filter(b => b.menuItemId !== menuItemId));

    const updateQuantity = (menuItemId: number, qty: number) => {
        if (qty <= 0) { handleRemoveItem(menuItemId); return; }
        setBillItems(billItems.map(b => b.menuItemId === menuItemId ? { ...b, quantity: qty, totalPrice: qty * b.unitPrice } : b));
    };

    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceChargeAmount = orderType === 'dine-in' ? parseFloat(serviceCharge || '0') : 0;
    const discountAmount = parseFloat(discount || '0');
    const total = subtotal + serviceChargeAmount - discountAmount;

    const handleSubmit = async () => {
        if (!selectedCustomer || billItems.length === 0) { setMessage('⚠️ Please select a customer and add items!'); return; }
        const orderData = {
            customerId: parseInt(selectedCustomer),
            tableNumber: orderType === 'takeaway' ? 0 : parseInt(tableNumber || '0'),
            paymentMethod, orderType,
            discount: discountAmount,
            serviceCharge: serviceChargeAmount,
            items: billItems.map(b => ({ menuItemId: b.menuItemId, quantity: b.quantity }))
        };
        const res = await API.post('/orders', orderData);
        setBill({ ...res.data, orderType });
        setMessage('✅ Bill created successfully!');
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const itemsHTML = billItems.map(item => `<tr><td style="padding:8px 5px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.unitPrice.toFixed(2)}</td><td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.totalPrice.toFixed(2)}</td></tr>`).join('');
        const givenAmount = parseFloat(givenMoney || '0');
        const changeAmount = givenAmount - (bill?.total || 0);
        printWindow.document.write(`<html lang="en"><head><title>Invoice #${bill?.id}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;max-width:380px;margin:0 auto;padding:20px;color:#222;font-size:13px;}.center{text-align:center;}.dashed{border-top:2px dashed #999;margin:10px 0;}.solid{border-top:2px solid #222;margin:10px 0;}.restaurant-name{font-size:20px;font-weight:bold;letter-spacing:2px;}table{width:100%;border-collapse:collapse;}th{padding:8px 5px;border-bottom:2px solid #222;border-top:2px solid #222;font-size:12px;}.row{display:flex;justify-content:space-between;padding:5px 0;}.total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:bold;}.highlight{background:#f9f9f9;padding:10px;border-radius:5px;}.footer{text-align:center;margin-top:15px;font-size:12px;color:#666;}@media print{body{padding:5px;}}</style></head><body><div class="center" style="margin-bottom:15px;"><p class="restaurant-name">🍽️ RESTAURANT</p><p class="restaurant-name">🇱🇰 SRI LANKA</p><div class="dashed"></div><p style="font-size:11px;color:#666;">Invoice / Receipt</p><p style="font-size:11px;color:#666;margin-top:3px;">📅 ${dateStr} | 🕐 ${timeStr}</p><p style="margin-top:5px;font-weight:bold;">${bill?.orderType === 'takeaway' ? '🛍️ TAKE AWAY' : '🪑 DINE IN'}</p></div><div class="highlight" style="margin-bottom:12px;"><div class="row"><span>Bill No.</span><span><b>#${bill?.id}</b></span></div><div class="row"><span>Customer</span><span><b>${bill?.customer?.name}</b></span></div>${bill?.orderType === 'takeaway' ? `<div class="row"><span>Order Type</span><span><b>🛍️ Take Away</b></span></div>` : `<div class="row"><span>Table No.</span><span><b>${bill?.tableNumber}</b></span></div>`}<div class="row"><span>Payment</span><span><b>${bill?.paymentMethod === 'cash' ? '💵 Cash' : bill?.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'}</b></span></div></div><table><thead><tr><th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead><tbody>${itemsHTML}</tbody></table><div class="dashed"></div><div class="row"><span>Subtotal</span><span>Rs. ${bill?.subtotal?.toFixed(2)}</span></div>${serviceChargeAmount > 0 ? `<div class="row" style="color:#d97706;"><span>Service Charge</span><span>Rs. ${serviceChargeAmount.toFixed(2)}</span></div>` : ''}${discountAmount > 0 ? `<div class="row" style="color:red;"><span>Discount</span><span>- Rs. ${discountAmount.toFixed(2)}</span></div>` : ''}<div class="solid"></div><div class="total-row"><span>TOTAL</span><span style="color:#16a34a;">Rs. ${bill?.total?.toFixed(2)}</span></div><div class="solid"></div>${bill?.paymentMethod === 'cash' ? `<div style="margin:10px 0;"><div class="row" style="font-size:16px;font-weight:bold;"><span>Given Amount</span><span>Rs. ${givenAmount.toFixed(2)}</span></div><div class="row" style="font-size:16px;font-weight:bold;color:#2563eb;"><span>Change</span><span>Rs. ${changeAmount.toFixed(2)}</span></div></div><div class="dashed"></div>` : ''}<div class="footer"><p style="font-size:16px;margin-bottom:5px;">🙏 Thank You!</p><p>Please Visit Again</p><p style="margin-top:5px;">⭐ We Hope You Enjoyed Your Meal ⭐</p><div class="dashed"></div><p style="font-size:10px;color:#999;">Powered by Restaurant Billing System 🇱🇰</p></div></body></html>`);
        printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close();
    };

    const cardStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden' as const, backdropFilter: 'blur(10px)' };
    const cardHeaderStyle = { background: 'rgba(201,168,76,0.1)', padding: '12px 18px', borderBottom: '1px solid rgba(201,168,76,0.2)' };
    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#fff', outline: 'none', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: '11px', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '1px', display: 'block', marginBottom: '6px' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>

            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>🧾 Create Bill</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>🇱🇰 Sri Lankan Restaurant POS</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>

                {message && (
                    <div style={{ background: message.includes('⚠️') ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${message.includes('⚠️') ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`, color: message.includes('⚠️') ? '#fbbf24' : '#4ade80', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
                        {message}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>

                    {/* Left — Order Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Order Details */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <h3 style={{ fontSize: '13px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>📋 Order Details</h3>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Customer */}
                                <div>
                                    <label style={labelStyle}>Customer</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                                            <option value="">Select Customer</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                                        </select>
                                        <button onClick={() => setShowAddCustomer(!showAddCustomer)} style={{ background: gold, color: '#000', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>+ New</button>
                                    </div>
                                </div>

                                {showAddCustomer && (
                                    <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: gold }}>➕ New Customer</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <input style={inputStyle} placeholder="Full Name *" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                                            <input style={inputStyle} placeholder="Phone *" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                                        </div>
                                        <input style={inputStyle} placeholder="Email (optional)" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={handleAddCustomer} disabled={addingCustomer} style={{ flex: 1, background: gold, color: '#000', padding: '10px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: addingCustomer ? 0.6 : 1 }}>
                                                {addingCustomer ? '⏳ Adding...' : '✅ Add Customer'}
                                            </button>
                                            <button onClick={() => setShowAddCustomer(false)} style={{ background: 'rgba(255,255,255,0.08)', color: '#888', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Order Type */}
                                <div>
                                    <label style={labelStyle}>Order Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button onClick={() => setOrderType('dine-in')} style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: `2px solid ${orderType === 'dine-in' ? '#4ade80' : 'rgba(255,255,255,0.1)'}`, background: orderType === 'dine-in' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', color: orderType === 'dine-in' ? '#4ade80' : '#888', cursor: 'pointer' }}>
                                            🪑 Dine In
                                        </button>
                                        <button onClick={() => { setOrderType('takeaway'); setServiceCharge('0'); }} style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: `2px solid ${orderType === 'takeaway' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`, background: orderType === 'takeaway' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', color: orderType === 'takeaway' ? '#fbbf24' : '#888', cursor: 'pointer' }}>
                                            🛍️ Take Away
                                        </button>
                                    </div>
                                    {orderType === 'takeaway' && (
                                        <div style={{ marginTop: '10px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                                            <p style={{ fontSize: '12px', color: '#fbbf24' }}>🛍️ Take Away — No service charge applied</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: orderType === 'dine-in' ? '1fr 1fr' : '1fr', gap: '12px' }}>
                                    {orderType === 'dine-in' && (
                                        <div>
                                            <label style={labelStyle}>Table Number</label>
                                            <input style={inputStyle} placeholder="e.g. 5" value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
                                        </div>
                                    )}
                                    <div>
                                        <label style={labelStyle}>Payment Method</label>
                                        <select style={inputStyle} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                            <option value="cash">💵 Cash</option>
                                            <option value="card">💳 Card</option>
                                            <option value="upi">📱 Online</option>
                                        </select>
                                    </div>
                                </div>

                                {orderType === 'dine-in' && (
                                    <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '16px' }}>
                                        <label style={{ ...labelStyle, color: '#4ade80' }}>🪑 Service Charge (Rs.)</label>
                                        <input style={{ ...inputStyle, borderColor: 'rgba(34,197,94,0.3)' }} placeholder="Enter service charge amount" value={serviceCharge} type="number" onChange={e => setServiceCharge(e.target.value)} />
                                        <p style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', opacity: 0.7 }}>💡 Enter the service charge amount for dine-in orders</p>
                                    </div>
                                )}

                                <div>
                                    <label style={labelStyle}>Discount (Rs.)</label>
                                    <input style={inputStyle} placeholder="0" value={discount} type="number" onChange={e => setDiscount(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Add Menu Items */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <h3 style={{ fontSize: '13px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>🍛 Add Menu Items</h3>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <select value={selectedMenuItem} onChange={e => setSelectedMenuItem(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                                        <option value="">Select Menu Item</option>
                                        {menuItems.map(m => <option key={m.id} value={m.id}>{m.name} — Rs. {m.price}</option>)}
                                    </select>
                                    <input style={{ ...inputStyle, width: '70px', textAlign: 'center' }} placeholder="Qty" value={quantity} type="number" min="1" onChange={e => setQuantity(e.target.value)} />
                                    <button onClick={handleAddItem} style={{ background: gold, color: '#000', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>+ Add</button>
                                </div>

                                {/* Quick Menu Buttons */}
                                {menuItems.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {menuItems.map(m => (
                                            <button key={m.id} onClick={() => {
                                                setBillItems(prev => {
                                                    const existing = prev.find(b => b.menuItemId === m.id);
                                                    if (existing) return prev.map(b => b.menuItemId === m.id ? { ...b, quantity: b.quantity + 1, totalPrice: (b.quantity + 1) * b.unitPrice } : b);
                                                    return [...prev, { menuItemId: m.id, name: m.name, quantity: 1, unitPrice: m.price, totalPrice: m.price }];
                                                });
                                            }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{m.name}</p>
                                                <p style={{ fontSize: '13px', fontWeight: 700, color: gold, marginTop: '4px' }}>Rs. {m.price}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right — Bill Preview */}
                    <div>
                        <div style={{ ...cardStyle, position: 'sticky', top: '80px' }}>
                            <div style={{ background: `rgba(201,168,76,0.2)`, padding: '12px 18px', borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>🧾 Bill Preview</h3>
                            </div>

                            {billItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#555' }}>
                                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</p>
                                    <p style={{ fontSize: '13px' }}>No items added yet</p>
                                    <p style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>Click menu items to add</p>
                                </div>
                            ) : (
                                <div style={{ padding: '18px' }}>
                                    <div style={{ marginBottom: '14px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: orderType === 'takeaway' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: orderType === 'takeaway' ? '#fbbf24' : '#4ade80' }}>
                                            {orderType === 'takeaway' ? '🛍️ Take Away' : `🪑 Table ${tableNumber || '?'}`}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        {billItems.map(item => (
                                            <div key={item.menuItemId} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#ddd' }}>{item.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Rs. {item.unitPrice} each</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={{ width: '28px', height: '28px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>−</button>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#ddd', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={{ width: '28px', height: '28px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>+</button>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: gold, minWidth: '72px', textAlign: 'right' }}>Rs. {item.totalPrice.toFixed(2)}</span>
                                                    <button onClick={() => handleRemoveItem(item.menuItemId)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                                            <span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span>
                                        </div>
                                        {orderType === 'dine-in' && serviceChargeAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fbbf24' }}>
                                                <span>🪑 Service Charge</span><span>Rs. {serviceChargeAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {orderType === 'takeaway' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fbbf24' }}>
                                                <span>🛍️ Service Charge</span><span>None</span>
                                            </div>
                                        )}
                                        {discountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#f87171' }}>
                                                <span>Discount</span><span>- Rs. {discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                                            <span style={{ color: '#ddd' }}>Total</span>
                                            <span style={{ color: '#4ade80' }}>Rs. {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Given Money */}
                                    {paymentMethod === 'cash' && (
                                        <div style={{ marginTop: '14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '14px' }}>
                                            <label style={{ ...labelStyle, color: '#60a5fa' }}>💵 Given Amount (Rs.)</label>
                                            <input style={{ ...inputStyle, borderColor: 'rgba(59,130,246,0.3)' }} placeholder="0" value={givenMoney} type="number" onChange={e => setGivenMoney(e.target.value)} />
                                            {parseFloat(givenMoney) > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#60a5fa', fontSize: '16px', marginTop: '10px' }}>
                                                    <span>Change</span>
                                                    <span>Rs. {(parseFloat(givenMoney) - total).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button onClick={handleSubmit} style={{ width: '100%', marginTop: '16px', background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.4)', color: '#4ade80', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
                                        ✅ Generate Bill
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Success Bill */}
                {bill && (
                    <div style={{ marginTop: '24px', background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{ background: 'rgba(34,197,94,0.15)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(34,197,94,0.2)' }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#4ade80' }}>✅ Bill Generated!</h3>
                                <p style={{ color: '#4ade80', fontSize: '13px', opacity: 0.7, marginTop: '2px' }}>Bill #{bill.id} created successfully</p>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', background: bill.orderType === 'takeaway' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)', color: bill.orderType === 'takeaway' ? '#fbbf24' : '#4ade80' }}>
                                {bill.orderType === 'takeaway' ? '🛍️ Take Away' : '🪑 Dine In'}
                            </span>
                        </div>

                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                            {/* Receipt Preview */}
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', fontFamily: "'Courier New', monospace", color: '#222', fontSize: '13px' }}>
                                <div style={{ textAlign: 'center', borderBottom: '2px dashed #999', paddingBottom: '14px', marginBottom: '14px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>🍽️ RESTAURANT</h2>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>🇱🇰 SRI LANKA</h2>
                                    <p style={{ color: '#888', fontSize: '11px', marginTop: '6px' }}>Invoice / Receipt</p>
                                    <p style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                                        📅 {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} | 🕐 {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>
                                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>
                                    {[
                                        ['Bill No.', `#${bill.id}`],
                                        ['Customer', bill.customer?.name],
                                        [bill.orderType === 'takeaway' ? 'Order Type' : 'Table No.', bill.orderType === 'takeaway' ? '🛍️ Take Away' : String(bill.tableNumber)],
                                        ['Payment', bill.paymentMethod === 'cash' ? '💵 Cash' : bill.paymentMethod === 'card' ? '💳 Card' : '📱 Online'],
                                    ].map(([l, v]) => (
                                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                            <span style={{ color: '#888' }}>{l}</span>
                                            <span style={{ fontWeight: 700 }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px' }}>
                                    <thead>
                                    <tr style={{ borderTop: '2px solid #222', borderBottom: '2px solid #222' }}>
                                        <th style={{ padding: '6px 0', textAlign: 'left' }}>Item</th>
                                        <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '6px 0', textAlign: 'right' }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {billItems.map(item => (
                                        <tr key={item.menuItemId} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '6px 0', color: '#555' }}>{item.name}</td>
                                            <td style={{ padding: '6px 0', textAlign: 'center', color: '#888' }}>{item.quantity}</td>
                                            <td style={{ padding: '6px 0', textAlign: 'right' }}>Rs. {item.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div style={{ borderTop: '2px solid #222', paddingTop: '8px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#888' }}><span>Subtotal</span><span>Rs. {bill.subtotal?.toFixed(2)}</span></div>
                                    {bill.tax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#d97706' }}><span>Service Charge</span><span>Rs. {bill.tax?.toFixed(2)}</span></div>}
                                    {bill.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: 'red' }}><span>Discount</span><span>- Rs. {bill.discount?.toFixed(2)}</span></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '2px solid #222', marginTop: '6px', paddingTop: '6px' }}>
                                        <span>TOTAL</span><span style={{ color: '#16a34a' }}>Rs. {bill.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', borderTop: '2px dashed #999', marginTop: '12px', paddingTop: '12px', fontSize: '12px', color: '#888' }}>
                                    <p style={{ fontSize: '16px', color: '#222', marginBottom: '4px' }}>🙏 Thank You!</p>
                                    <p>Please Visit Again ⭐</p>
                                </div>
                            </div>

                            {/* Summary & Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h4 style={{ fontWeight: 700, color: '#ddd', fontSize: '16px' }}>📋 Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[
                                        { label: 'Bill ID', value: `#${bill.id}`, color: gold },
                                        { label: 'Customer', value: bill.customer?.name, color: '#ddd' },
                                        { label: 'Subtotal', value: `Rs. ${bill.subtotal?.toFixed(2)}`, color: '#ddd' },
                                        { label: 'Service Charge', value: bill.tax > 0 ? `Rs. ${bill.tax?.toFixed(2)}` : 'None', color: bill.tax > 0 ? '#fbbf24' : '#555' },
                                        { label: 'Discount', value: `Rs. ${bill.discount?.toFixed(2)}`, color: '#f87171' },
                                        { label: 'Total', value: `Rs. ${bill.total?.toFixed(2)}`, color: '#4ade80' },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
                                            <p style={{ fontWeight: 700, color: item.color, marginTop: '4px' }}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handlePrint} style={{ width: '100%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                                    🖨️ Print Invoice
                                </button>
                                <button onClick={() => { setBill(null); setMessage(''); setBillItems([]); setSelectedCustomer(''); setTableNumber(''); setDiscount('0'); setGivenMoney('0'); setServiceCharge('0'); setOrderType('dine-in'); }} style={{ width: '100%', background: `rgba(201,168,76,0.15)`, border: `1px solid rgba(201,168,76,0.3)`, color: gold, padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                                    + New Bill
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}