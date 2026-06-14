'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout, isLoggedIn, isAdmin, isAdminOrOwner } from '@/lib/auth';
import API from '@/lib/api';

interface UserProfile { id: string; name: string; email: string; role: string; }
interface StaffMember { id: number; name: string; email: string; role: string; }

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const gold = '#c9a84c';

    const loadStaff = useCallback(async () => {
        try { const res = await API.get('/auth/staff'); setStaffList(res.data); } catch { console.error('Failed to load staff'); }
    }, []);

    useEffect(() => {
        if (!isLoggedIn()) { router.push('/login'); return; }
        const userData = getUser();
        setUser(userData as UserProfile);
        if (isAdminOrOwner()) loadStaff();
    }, [router, loadStaff]);

    const handleAddStaff = async () => {
        if (!newStaff.name || !newStaff.email || !newStaff.password) { setMessage('⚠️ Please fill all fields!'); return; }
        setLoading(true);
        try {
            await API.post('/auth/register', newStaff);
            setMessage('✅ Staff added successfully!');
            setNewStaff({ name: '', email: '', password: '', role: 'staff' });
            setShowAddStaff(false);
            loadStaff();
        } catch (err: unknown) {
            const error = err as { response?: { data?: string } };
            setMessage('❌ ' + (error.response?.data || 'Failed!'));
        } finally { setLoading(false); }
    };

    const handleDeleteStaff = async (id: number, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        try { await API.delete(`/auth/staff/${id}`); setMessage('🗑️ Staff deleted!'); loadStaff(); }
        catch { setMessage('❌ Failed to delete!'); }
    };

    const handleUpdateRole = async (id: number, role: string) => {
        try { await API.put(`/auth/staff/${id}/role`, { role }); setMessage('✅ Role updated!'); loadStaff(); }
        catch { setMessage('❌ Failed to update role!'); }
    };

    const handleLogout = () => { logout(); router.push('/login'); };

    const getRoleIcon = (role: string) => role === 'admin' ? '👨‍💻' : role === 'owner' ? '👑' : '👤';
    const getRoleColor = (role: string) => role === 'admin' ? '#f87171' : role === 'owner' ? '#fbbf24' : '#60a5fa';

    const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' as const };

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url('https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1920&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />

            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)', padding: '16px 32px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: gold }}>{getRoleIcon(user.role)} Profile</h1>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Manage your account & users</p>
                    </div>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {message && (
                    <div style={{ background: message.includes('⚠️') || message.includes('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${message.includes('⚠️') || message.includes('❌') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, color: message.includes('⚠️') || message.includes('❌') ? '#f87171' : '#4ade80', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' }}>
                        {message}
                    </div>
                )}

                {/* Profile Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '14px 20px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>My Profile</h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
                                {getRoleIcon(user.role)}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{user.name}</h2>
                                <p style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>{user.email}</p>
                                <span style={{ display: 'inline-block', marginTop: '8px', background: `rgba(${user.role === 'admin' ? '239,68,68' : user.role === 'owner' ? '234,179,8' : '59,130,246'},0.15)`, color: getRoleColor(user.role), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {getRoleIcon(user.role)} {user.role}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { label: 'Full Name', value: user.name },
                                { label: 'Email', value: user.email },
                                { label: 'Role', value: user.role },
                                { label: 'Status', value: '✅ Active' },
                            ].map(item => (
                                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
                                    <p style={{ fontWeight: 600, color: '#ddd', marginTop: '4px', textTransform: 'capitalize' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Management */}
                {isAdminOrOwner() && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                        <div style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 600, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>👥 User Management</h3>
                            <button onClick={() => setShowAddStaff(!showAddStaff)} style={{ background: gold, color: '#000', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>+ Add User</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {showAddStaff && (
                                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: gold, marginBottom: '14px' }}>➕ Add New User</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                        <input style={inputStyle} placeholder="Full Name *" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />
                                        <input style={inputStyle} placeholder="Email *" type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                                    </div>
                                    <input style={{ ...inputStyle, marginBottom: '10px' }} placeholder="Password *" type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} />
                                    <select style={{ ...inputStyle, marginBottom: '14px' }} value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}>
                                        <option value="staff">👤 Staff</option>
                                        <option value="owner">👑 Owner</option>
                                        {isAdmin() && <option value="admin">👨‍💻 Admin</option>}
                                    </select>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={handleAddStaff} disabled={loading} style={{ flex: 1, background: gold, color: '#000', padding: '10px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                                            {loading ? '⏳ Adding...' : '✅ Add User'}
                                        </button>
                                        <button onClick={() => setShowAddStaff(false)} style={{ background: 'rgba(255,255,255,0.08)', color: '#888', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            {staffList.length === 0 ? (
                                <p style={{ color: '#555', textAlign: 'center', padding: '24px', fontSize: '13px' }}>No users yet</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {staffList.map(staff => (
                                        <div key={staff.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                                    {getRoleIcon(staff.role)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: '#ddd', fontSize: '14px' }}>
                                                        {staff.name}
                                                        {staff.email === user.email && <span style={{ marginLeft: '8px', fontSize: '11px', color: gold }}>(You)</span>}
                                                    </p>
                                                    <p style={{ color: '#555', fontSize: '12px' }}>{staff.email}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ background: `rgba(${staff.role === 'admin' ? '239,68,68' : staff.role === 'owner' ? '234,179,8' : '59,130,246'},0.15)`, color: getRoleColor(staff.role), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {getRoleIcon(staff.role)} {staff.role}
                                                </span>
                                                {isAdmin() && staff.email !== user.email && (
                                                    <select value={staff.role} onChange={e => handleUpdateRole(staff.id, e.target.value)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 8px', color: '#aaa', fontSize: '12px', outline: 'none' }}>
                                                        <option value="staff">👤 Staff</option>
                                                        <option value="owner">👑 Owner</option>
                                                        <option value="admin">👨‍💻 Admin</option>
                                                    </select>
                                                )}
                                                {staff.email !== user.email && (
                                                    <button onClick={() => handleDeleteStaff(staff.id, staff.name)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}