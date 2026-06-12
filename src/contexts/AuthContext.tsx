import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export type UserRole = 'guest' | 'member' | 'admin';

export interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ username: 'Guest', role: 'guest' });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化 Admin 帳號 (若不存在) 並檢查本地登入狀態
  useEffect(() => {
    const initAuth = async () => {
      try {
        const adminRef = doc(db, 'users', 'william0818');
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          // 建立預設管理員帳號
          await setDoc(adminRef, {
            password: '0000',
            role: 'admin',
            createdAt: new Date().toISOString()
          });
        }

        // 檢查 localStorage
        const savedUser = localStorage.getItem('alphaFlow_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser) as User;
          // 重新驗證資料庫中的使用者是否存在
          const userRef = doc(db, 'users', parsedUser.username);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const dbUser = userSnap.data();
            setUser({ username: parsedUser.username, role: dbUser.role });
          } else {
            localStorage.removeItem('alphaFlow_user');
          }
        }
      } catch (err) {
        console.error('Auth initialization error', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const dbData = userSnap.data();
        if (dbData.password === password) {
          const loggedInUser: User = { username, role: dbData.role };
          setUser(loggedInUser);
          localStorage.setItem('alphaFlow_user', JSON.stringify(loggedInUser));
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const logout = () => {
    setUser({ username: 'Guest', role: 'guest' });
    localStorage.removeItem('alphaFlow_user');
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (user.role === 'guest') return false;
    try {
      const userRef = doc(db, 'users', user.username);
      await updateDoc(userRef, {
        password: newPassword
      });
      return true;
    } catch (e) {
      console.error('Change password error', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
