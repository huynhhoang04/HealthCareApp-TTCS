import { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom'; // Bổ sung import Link
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const { isLoggedIn, login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault(); 
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/login/', {
                username,
                password
            });
            login(response.data.access, response.data.refresh);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Lỗi rồi:', error);
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm px-6 mx-4 border border-transparent dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-3xl font-bold mb-6 text-center text-emerald-600 dark:text-emerald-400">Đăng Nhập</h2>
                
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full mb-4 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full mb-6 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                <button type="submit" className="w-full bg-emerald-600 dark:bg-emerald-500 text-white p-3 rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-md">
                    Vào việc!
                </button>

                {/* ĐÃ THÊM DÒNG NÀY ĐỂ ĐIỀU HƯỚNG SANG ĐĂNG KÝ */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
}