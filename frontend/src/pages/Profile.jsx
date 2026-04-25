import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://127.0.0.1:8000/api/v1/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (error) {
                // Nếu lỗi 404 (chưa có profile) thì tự động đá sang trang Setup
                if (error.response?.status === 404) {
                    navigate('/setup-profile');
                } else {
                    console.error("Lỗi lấy hồ sơ:", error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const calculateBMI = (weight, height) => {
        if (!weight || !height) return 0;
        return (weight / Math.pow(height / 100, 2)).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex justify-center pb-10">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen shadow-lg flex flex-col">
                
                {/* HEADER PROFLIE */}
                <header className="bg-emerald-600 text-white p-6 rounded-b-3xl shadow-md drop-shadow-xl relative">
                    <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 text-2xl font-bold hover:scale-110 transition">←</button>
                    <div className="flex flex-col items-center mt-4">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-3 shadow-lg border-4 border-white/30 backdrop-blur-sm">
                            {profile?.gender === 'Nam' ? '👦🏻' : '👱🏻‍♀️'}
                        </div>
                        <h1 className="text-2xl font-bold">Hồ sơ của bạn</h1>
                        <p className="text-emerald-100 font-semibold mt-1 tracking-widest uppercase text-sm">{profile?.fitness_goal}</p>
                    </div>
                </header>

                <div className="p-6">
                    {/* KHỐI CHỈ SỐ CƠ THỂ */}
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Chỉ số hiện tại</h2>
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded-2xl border border-slate-100 dark:border-gray-600 text-center shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-400 font-bold mb-1">Chiều cao</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white">{profile?.height} <span className="text-xs text-gray-500 dark:text-gray-400">cm</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded-2xl border border-slate-100 dark:border-gray-600 text-center shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-400 font-bold mb-1">Cân nặng</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white">{profile?.weight} <span className="text-xs text-gray-500 dark:text-gray-400">kg</span></p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-700 text-center shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-1">BMI</p>
                            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{calculateBMI(profile?.weight, profile?.height)}</p>
                        </div>
                    </div>

                    {/* KHỐI QUẢN LÝ TÀI KHOẢN */}
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quản lý tài khoản</h2>
                    <div className="space-y-3">
                        {/* Nút 1: Chỉnh sửa hồ sơ */}
                        <button 
                            onClick={() => navigate('/setup-profile')}
                            className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 transition-all shadow-sm group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition">📝</div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-700 dark:text-gray-200">Chỉnh sửa hồ sơ</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-400">Cập nhật chiều cao, cân nặng...</p>
                                </div>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600 font-bold text-xl">→</span>
                        </button>

                        {/* Nút 2: Đổi mật khẩu */}
                        <button 
                            onClick={() => navigate('/change-password')}
                            className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl hover:border-orange-500 transition-all shadow-sm group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition">🔒</div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-700 dark:text-gray-200">Đổi mật khẩu</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-400">Bảo vệ tài khoản của bạn</p>
                                </div>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600 font-bold text-xl">→</span>
                        </button>

                        {/* Nút 3: Cài đặt chung (Tạm thời để trống link) */}
                        <button 
                            onClick={() => navigate('/settings')}
                            className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl hover:border-slate-500 transition-all shadow-sm group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 rounded-xl flex items-center justify-center text-xl group-hover:rotate-90 transition duration-300">⚙️</div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-700 dark:text-gray-200">Cài đặt</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-400">Giao diện, thông báo...</p>
                                </div>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600 font-bold text-xl">→</span>
                        </button>
                    </div>

                    {/* Nút Đăng xuất ở cuối */}
                    <div className="mt-8">
                        <button 
                            onClick={logout}
                            className="w-full p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-500 dark:hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-800"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}