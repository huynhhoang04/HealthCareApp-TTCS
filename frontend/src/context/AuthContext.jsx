import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 1. Thêm cái khóa: Mặc định là đang bận kiểm tra
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); 

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
        }
        // 2. Lục két sắt xong rồi thì mở khóa
        setIsCheckingAuth(false); 
    }, []);

    const login = (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
    };

    // 3. Nếu đang bận check két sắt thì cấm hệ thống render bất cứ trang nào!
    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-emerald-600 font-bold">Đang kiểm tra bảo mật...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};