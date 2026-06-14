'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUser, logout } from '@/lib/auth';
import API from '@/lib/api';

interface User { id: string; name: string; email: string; role: string; }
interface Stats { totalOrders: number; totalRevenue: number; totalCustomers: number; totalMenuItems: number; }

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        if (!isLoggedIn()) { router.push('/login'); return; }
        const userData = getUser();
        setUser(userData as User);
        API.get('/reports/summary').then(res => setStats(res.data));
    }, [router]);

    const handleLogout = () => { logout(); router.push('/login'); };

    if (!user) return null;

    const navLinks = [
        { href: '/menu', label: 'Menu', icon: '🍛', roles: ['admin', 'owner', 'staff'] },
        { href: '/customers', label: 'Customers', icon: '👥', roles: ['admin', 'owner', 'staff'] },
        { href: '/billing', label: 'Billing', icon: '🧾', roles: ['admin', 'owner', 'staff'] },
        { href: '/orders', label: 'Orders', icon: '📋', roles: ['admin', 'owner'] },
        { href: '/reports', label: 'Reports', icon: '📊', roles: ['admin', 'owner'] },
        { href: '/profile', label: 'Profile', icon: '👤', roles: ['admin', 'owner', 'staff'] },
    ];

    const cards = [
        { href: '/billing', icon: '🧾', label: 'Create Bill', desc: 'Generate invoices & bills', roles: ['admin', 'owner', 'staff'] },
        { href: '/menu', icon: '🍛', label: 'Menu', desc: 'Manage food items', roles: ['admin', 'owner', 'staff'] },
        { href: '/customers', icon: '👥', label: 'Customers', desc: 'Manage customer records', roles: ['admin', 'owner', 'staff'] },
        { href: '/orders', icon: '📋', label: 'Order History', desc: 'View all previous bills', roles: ['admin', 'owner'] },
        { href: '/reports', icon: '📊', label: 'Reports', desc: 'Sales analytics & insights', roles: ['admin', 'owner'] },
        { href: '/profile', icon: '👤', label: 'Profile', desc: 'Staff & profile settings', roles: ['admin', 'owner', 'staff'] },
    ];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return '👨‍💻';
            case 'owner': return '👑';
            default: return '👤';
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#fff' }}>

            {/* Background Image with overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'brightness(0.15)'
            }} />

            {/* Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(10,10,10,0.95)',
                borderBottom: '1px solid rgba(201,168,76,0.3)',
                backdropFilter: 'blur(12px)',
                padding: '14px 32px',
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>🍽️</span>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '16px', color: '#c9a84c', letterSpacing: '1px' }}>Restaurant Billing</p>
                            <p style={{ fontSize: '11px', color: '#666' }}>🇱🇰 Sri Lankan POS</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {navLinks.filter(l => l.roles.includes(user.role)).map(link => (
                            <Link key={link.href} href={link.href} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '8px',
                                fontSize: '13px', fontWeight: 500,
                                color: '#aaa', textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLElement).style.color = '#c9a84c'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                                <span>{link.icon}</span><span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{user.name}</p>
                            <p style={{ fontSize: '12px', color: '#c9a84c', textTransform: 'capitalize' }}>
                                {getRoleIcon(user.role)} {user.role}
                            </p>
                        </div>
                        <button onClick={handleLogout} style={{
                            background: 'rgba(201,168,76,0.15)',
                            border: '1px solid rgba(201,168,76,0.4)',
                            color: '#c9a84c', padding: '8px 18px',
                            borderRadius: '8px', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#c9a84c'; (e.currentTarget as HTMLElement).style.color = '#000'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLElement).style.color = '#c9a84c'; }}>
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>

                {/* Welcome Banner */}
                <div style={{
                    borderRadius: '20px', padding: '32px',
                    marginBottom: '28px',
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                    border: '1px solid rgba(201,168,76,0.4)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Glow effect */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '-60px',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, rgba(201,168,76,0.2), transparent)',
                        borderRadius: '50%', pointerEvents: 'none',
                    }} />
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
                            <span style={{ color: '#c9a84c' }}>{user.name}!</span> 👋
                        </h1>
                        <p style={{ color: '#888', fontSize: '14px' }}>
                            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Role</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#c9a84c', marginTop: '4px', textTransform: 'capitalize' }}>
                            {getRoleIcon(user.role)} {user.role}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                {stats && user.role !== 'staff' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                        {[
                            { label: 'Total Orders', value: stats.totalOrders, sub: 'All time', color: '#c9a84c' },
                            { label: 'Revenue', value: `Rs. ${stats.totalRevenue?.toFixed(0)}`, sub: 'Total earned', color: '#4caf79' },
                            { label: 'Customers', value: stats.totalCustomers, sub: 'Registered', color: '#4c9ac9' },
                            { label: 'Menu Items', value: stats.totalMenuItems, sub: 'Available', color: '#c94c7a' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px', padding: '22px',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s',
                            }}
                                 onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                                 onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                                <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</p>
                                <p style={{ fontSize: '30px', fontWeight: 700, color: stat.color, margin: '8px 0 4px' }}>{stat.value}</p>
                                <p style={{ fontSize: '12px', color: '#555' }}>{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Staff welcome */}
                {user.role === 'staff' && (
                    <div style={{
                        background: 'rgba(76,154,201,0.1)',
                        border: '1px solid rgba(76,154,201,0.3)',
                        borderRadius: '14px', padding: '18px',
                        marginBottom: '28px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <span style={{ fontSize: '28px' }}>👋</span>
                        <div>
                            <p style={{ fontWeight: 600, color: '#4c9ac9' }}>Welcome, {user.name}!</p>
                            <p style={{ color: '#4c9ac9', fontSize: '13px', opacity: 0.8 }}>You can create bills and manage customers.</p>
                        </div>
                    </div>
                )}

                {/* Quick Access */}
                <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '16px' }}>
                    Quick Access
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {cards.filter(c => c.roles.includes(user.role)).map(card => (
                        <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '18px', padding: '24px',
                                display: 'flex', alignItems: 'center', gap: '18px',
                                cursor: 'pointer', transition: 'all 0.25s',
                                backdropFilter: 'blur(10px)',
                            }}
                                 onMouseEnter={e => {
                                     const el = e.currentTarget as HTMLElement;
                                     el.style.border = '1px solid rgba(201,168,76,0.6)';
                                     el.style.background = 'rgba(201,168,76,0.08)';
                                     el.style.transform = 'translateY(-4px)';
                                     el.style.boxShadow = '0 12px 32px rgba(201,168,76,0.1)';
                                 }}
                                 onMouseLeave={e => {
                                     const el = e.currentTarget as HTMLElement;
                                     el.style.border = '1px solid rgba(255,255,255,0.08)';
                                     el.style.background = 'rgba(255,255,255,0.04)';
                                     el.style.transform = 'translateY(0)';
                                     el.style.boxShadow = 'none';
                                 }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: 'rgba(201,168,76,0.15)',
                                    border: '1px solid rgba(201,168,76,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', flexShrink: 0,
                                }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '15px', color: '#ddd' }}>{card.label}</p>
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{card.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}