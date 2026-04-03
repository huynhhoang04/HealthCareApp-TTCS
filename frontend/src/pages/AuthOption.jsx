// src/pages/AuthOption.jsx
import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AuthOption() {
    const { isLoggedIn } = useContext(AuthContext);

    // Vẫn phải check: Nếu có vé rồi -> Đá thẳng vào Dashboard
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        // Mobile-first container: tràn đầy màn hình, dùng tone tím làm nền
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-500 to-purple-800 px-4 text-white">
            
            {/* Form container: chuẩn mobile-first */}
            <div className="w-full max-w-sm text-center px-4">
                
                {/* Một cái icon hoặc hình ảnh minh họa nhỏ */}
                <div className="text-8xl mb-8 transform hover:scale-110 transition">NİG🤞🏾GER</div>
                
                <h1 className="text-3xl font-extrabold mb-4 leading-tight">Sẵn sàng để thay đổi?</h1>
                <p className="text-purple-100 mb-12 text-lg">dmm</p>
                
                <div className="space-y-4">
                    {/* Nút Đăng nhập: Tone tím đậm */}
                    <Link to="/login" className="block w-full bg-purple-950 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-black transition text-lg">
                        Đăng Nhập
                    </Link>
                    
                    {/* Nút Đăng ký: Tone tím nhạt hoặc outline */}
                    <Link to="/register" className="block w-full bg-white text-purple-800 font-bold py-4 rounded-xl shadow-lg hover:bg-purple-100 transition text-lg border border-purple-200">
                        Tạo Tài Khoản Mới
                    </Link>
                </div>
            </div>
        </div>
    );
}