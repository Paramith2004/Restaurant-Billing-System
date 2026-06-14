'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(''); setSuccess('');
        if (!form.email || !form.password) { setError('Please fill in all fields!'); return; }
        if (!isLogin && !form.name) { setError('Please enter your name!'); return; }
        if (!isLogin && form.password !== form.confirmPassword) { setError('Passwords do not match!'); return; }
        if (!isLogin && form.password.length < 6) { setError('Password must be at least 6 characters!'); return; }
        setLoading(true);
        try {
            if (!isLogin) {
                await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
                setSuccess('Account created! Please sign in now.');
                setIsLogin(true);
                setForm({ name: '', email: form.email, password: '', confirmPassword: '' });
            } else {
                const res = await API.post('/auth/login', { email: form.email, password: form.password });
                const { id, token, name, email, role } = res.data;
                localStorage.setItem('id', id);
                localStorage.setItem('token', token);
                localStorage.setItem('name', name);
                localStorage.setItem('email', email);
                localStorage.setItem('role', role);
                router.push('/');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: string } };
            setError(error.response?.data || 'Something went wrong!');
        } finally { setLoading(false); }
    };

    const gold = '#c9a84c';
    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px',
        padding: '12px 16px', fontSize: '14px', color: '#fff',
        outline: 'none', boxSizing: 'border-box' as const,
    };
    const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '1px', display: 'block', marginBottom: '8px' };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

            {/* Background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'brightness(0.12)'
            }} />

            {/* Left branding */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', padding: '60px', position: 'relative', zIndex: 1,
            }}>
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🍽️</div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, color: gold, letterSpacing: '2px', marginBottom: '12px' }}>
                        Restaurant Billing
                    </h1>
                    <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px' }}>
                        Professional POS & Billing System
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                        {['Fast & Easy Billing', 'Customer Management', 'Real-time Reports', 'Print Invoices'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontSize: '14px', flexShrink: 0 }}>✓</div>
                                <span style={{ color: '#aaa', fontSize: '15px' }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div style={{
                width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px', position: 'relative', zIndex: 1,
                background: 'rgba(255,255,255,0.03)',
                borderLeft: '1px solid rgba(201,168,76,0.2)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            {isLogin ? 'Sign in to continue' : 'Register to get started'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid rgba(201,168,76,0.2)' }}>
                        {['Sign Up', 'Sign In'].map((tab, i) => (
                            <button key={tab} onClick={() => { setIsLogin(i === 1); setError(''); setSuccess(''); }} style={{
                                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: (i === 0 ? !isLogin : isLogin) ? gold : 'transparent',
                                color: (i === 0 ? !isLogin : isLogin) ? '#000' : '#666',
                            }}>{tab}</button>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                            ✅ {success}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input style={inputStyle} type="text" placeholder="Paramith Kavisha" value={form.name}
                                       onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input style={inputStyle} type="email" placeholder="user@example.com" value={form.email}
                                   onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input style={inputStyle} type="password" placeholder="••••••••" value={form.password}
                                   onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <input style={inputStyle} type="password" placeholder="••••••••" value={form.confirmPassword}
                                       onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                            </div>
                        )}
                        <button onClick={handleSubmit} disabled={loading} style={{
                            width: '100%', background: loading ? 'rgba(201,168,76,0.5)' : gold,
                            color: '#000', padding: '14px', borderRadius: '12px',
                            fontWeight: 700, fontSize: '15px', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
                            transition: 'all 0.2s',
                        }}>
                            {loading ? '⏳ Please wait...' : isLogin ? '🔐 Sign In' : '✅ Create Account'}
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <p style={{ fontSize: '13px', color: '#666' }}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                                    style={{ color: gold, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}