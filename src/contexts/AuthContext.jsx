import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('schedule-sync-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 전체 사용자 목록 로드 (pin 존재 여부 포함)
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, pin')
      .order('name');
    
    if (error) {
      console.error('Failed to fetch users:', error);
    }
    // pin 값 자체는 노출하지 않고, 설정 여부만 전달
    const mapped = (data || []).map(u => ({
      id: u.id,
      name: u.name,
      hasPin: !!u.pin,
    }));
    setUsers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // PIN 설정 (최초 1회)
  const setupPin = useCallback(async (userId, pin) => {
    const { error } = await supabase
      .from('users')
      .update({ pin })
      .eq('id', userId);

    if (error) {
      console.error('Failed to set PIN:', error);
      return { success: false, message: 'PIN 설정 중 오류가 발생했습니다.' };
    }

    const userData = { id: userId, name: users.find(u => u.id === userId)?.name };
    setUser(userData);
    sessionStorage.setItem('schedule-sync-user', JSON.stringify(userData));
    await fetchUsers(); // hasPin 갱신
    return { success: true };
  }, [users, fetchUsers]);

  // PIN 로그인 (검증)
  const login = useCallback(async (userId, pin) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', userId)
      .eq('pin', pin)
      .single();

    if (error || !data) {
      return { success: false, message: 'PIN 번호가 올바르지 않습니다.' };
    }

    setUser(data);
    sessionStorage.setItem('schedule-sync-user', JSON.stringify(data));
    return { success: true };
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('schedule-sync-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, logout, setupPin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
