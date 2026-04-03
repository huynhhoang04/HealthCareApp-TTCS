import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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

    // 1. Phải chắc chắn có biến "e" ở đây
    const handleLogin = async (e) => {
        e.preventDefault(); // LỆNH NÀY PHẢI NẰM DÒNG ĐẦU TIÊN để chặn trình duyệt reload!

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/login/', {
                username,
                password
            });
            
            // Lưu token vào Context
            login(response.data.access, response.data.refresh);
            
            // Tạm thời TẮT cái alert() đi. Đôi khi alert() làm treo luồng chuyển trang của React Router
            // alert('Đăng nhập thành công mượt mà!'); 
            
            // Thêm option { replace: true } để xóa lịch sử trang Login, chống ấn nút Back quay lại
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            console.error('Lỗi rồi:', error);
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            {/* 2. SỰ KIỆN PHẢI NẰM Ở THẺ FORM (onSubmit), TUYỆT ĐỐI KHÔNG DÙNG onClick Ở NÚT */}
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm px-6 mx-4">
                <h2 className="text-3xl font-bold mb-6 text-center text-emerald-600">Đăng Nhập</h2>
                
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* 3. NÚT PHẢI CÓ type="submit" */}
                <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
                    Vào việc!
                </button>
            </form>
        </div>
    );
}