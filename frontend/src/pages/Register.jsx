import { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
    const { isLoggedIn } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({ 
        username: '', email: '', password: '', first_name: '', last_name: '' 
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (isLoggedIn) { return <Navigate to="/dashboard" replace />; }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/v1/auth/register/', formData);
            alert('Tạo tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error('Lỗi đăng ký:', err.response?.data);
            setError('Tên đăng nhập đã tồn tại hoặc dữ liệu không hợp lệ!');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm mx-4 border border-transparent dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-3xl font-bold mb-2 text-center text-emerald-600 dark:text-emerald-400">Gia Nhập</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Bắt đầu hành trình của bạn</p>
                
                {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 text-center">{error}</p>}

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <input 
                            type="text" name="last_name" placeholder="Họ" required
                            className="w-1/2 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            onChange={handleChange}
                        />
                        <input 
                            type="text" name="first_name" placeholder="Tên" required
                            className="w-1/2 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            onChange={handleChange}
                        />
                    </div>

                    <input 
                        type="text" name="username" placeholder="Tên đăng nhập" required
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                        onChange={handleChange}
                    />
                    
                    <input 
                        type="email" name="email" placeholder="Email của bạn" required
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                        onChange={handleChange}
                    />
                    
                    <input 
                        type="password" name="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" required minLength="6"
                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                        onChange={handleChange}
                    />
                </div>
                
                <button type="submit" className="w-full mt-6 bg-emerald-600 dark:bg-emerald-500 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-md">
                    Đăng Ký
                </button>

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Đã có tài khoản? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
}