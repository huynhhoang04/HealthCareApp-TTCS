import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DarkModeContext } from '../context/DarkModeContext';

export default function Settings() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
    
    // Chỉ giữ lại Sáng/Tối và Thông báo (nếu cần)
    const [settings, setSettings] = useState({
        notifications: JSON.parse(localStorage.getItem('app_notifications') ?? 'true'),
    });

    useEffect(() => {
        // Lưu lựa chọn notification vào máy
        localStorage.setItem('app_notifications', settings.notifications);
    }, [settings]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 flex justify-center py-10 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative h-fit border border-transparent dark:border-gray-700">
                
                {/* Nút quay lại Profile */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 text-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition"
                >
                    ←
                </button>
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚙️</div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Cài Đặt</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tùy chỉnh ứng dụng của bạn</p>
                </div>

                <div className="space-y-4">
                    {/* 1. CHẾ ĐỘ SÁNG / TỐI */}
                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white">Chế độ tối</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tiết kiệm pin & dịu mắt</p>
                        </div>
                        <button 
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* 2. THÔNG BÁO (Nếu làm được) */}
                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white">Thông báo</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Nhắc nhở giờ tập và ăn</p>
                        </div>
                        <button 
                            onClick={() => setSettings(prev => ({...prev, notifications: !prev.notifications}))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${settings.notifications ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* 3. LIÊN HỆ HỖ TRỢ */}
                    <button 
                        onClick={() => navigate('/contact')}
                        className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl hover:scale-[1.02] transition group"
                    >
                        <div className="text-left">
                            <p className="font-bold text-gray-800 dark:text-white">Liên hệ & Giới thiệu</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Đội ngũ PT, Gọi điện, Email</p>
                        </div>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    {/* 4. ĐĂNG XUẤT */}
                    <button 
                        onClick={logout}
                        className="w-full flex justify-between items-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl hover:bg-rose-500 group transition-all"
                    >
                        <p className="font-bold text-rose-600 group-hover:text-white transition">Đăng xuất</p>
                        <span className="text-xl group-hover:translate-x-1 transition">🚪</span>
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Healthcare AI v1.0.0</p>
                </div>
            </div>
        </div>
    );
}