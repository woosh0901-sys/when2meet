import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('calsync-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

// 사용자별 기본 색상 (DB에 color 컬럼 없을 때 fallback)
const DEFAULT_COLORS = ['#4c6ef5', '#20c997', '#f59f00', '#e64980', '#7950f2'];

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, pin')
      .order('created_at');
    if (error) console.error('Failed to fetch users:', error);
    const mapped = (data || []).map((u, i) => ({
      id: u.id,
      name: u.name,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      hasPin: !!u.pin,
    }));
    setUsers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setupPin = useCallback(async (userId, pin) => {
    const { error } = await supabase.from('users').update({ pin }).eq('id', userId);
    if (error) return { success: false, message: 'PIN 설정 중 오류가 발생했습니다.' };
    const found = users.find(u => u.id === userId);
    const userData = { id: userId, name: found?.name, color: found?.color };
    setUser(userData);
    sessionStorage.setItem('calsync-user', JSON.stringify(userData));
    await fetchUsers();
    return { success: true };
  }, [users, fetchUsers]);

  const login = useCallback(async (userId, pin) => {
    const { data, error } = await supabase
      .from('users').select('id, name').eq('id', userId).eq('pin', pin).single();
    if (error || !data) return { success: false, message: 'PIN 번호가 올바르지 않습니다.' };
    
    // fetchUsers와 동일하게 기본 색상 할당 (DB에 color 컬럼이 없을 때를 대비)
    const userIndex = users.findIndex(u => u.id === userId);
    const color = userIndex >= 0 ? users[userIndex].color : DEFAULT_COLORS[0];
    
    const userData = { ...data, color };
    setUser(userData);
    sessionStorage.setItem('calsync-user', JSON.stringify(userData));
    return { success: true };
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('calsync-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, logout, setupPin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
