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

  // 전체 사용자 목록 로드
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Failed to fetch users:', error);
      }
      setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // 이름 선택으로 바로 로그인
  const login = useCallback((selectedUser) => {
    setUser(selectedUser);
    sessionStorage.setItem('schedule-sync-user', JSON.stringify(selectedUser));
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('schedule-sync-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, logout, loading }}>
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
