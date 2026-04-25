import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPass, setShowPass] = useState(false); // Ẩn/hiện mật khẩu

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.new_password !== formData.confirm_password) {
            return setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
        }

        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://127.0.0.1:8000/api/v1/auth/change-password/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => navigate('/profile'), 2000); // Thành công thì về Profile
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra!' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex justify-center py-10 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative h-fit">
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition">←</button>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Đổi Mật Khẩu</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật mật khẩu thường xuyên để bảo mật</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">Mật khẩu hiện tại</label>
                        <input 
                            type={showPass ? "text" : "password"} 
                            name="old_password" 
                            required 
                            onChange={handleChange}
                            className="w-full p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                        <input 
                            type={showPass ? "text" : "password"} 
                            name="new_password" 
                            required 
                            onChange={handleChange}
                            className="w-full p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Tối thiểu 8 ký tự"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới</label>
                        <input 
                            type={showPass ? "text" : "password"} 
                            name="confirm_password" 
                            required 
                            onChange={handleChange}
                            className="w-full p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <input type="checkbox" id="show" onChange={() => setShowPass(!showPass)} className="w-4 h-4 accent-orange-500" />
                        <label htmlFor="show" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">Hiện mật khẩu</label>
                    </div>

                    <button type="submit" className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white font-black rounded-2xl shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 active:scale-95 transition-all mt-4">
                        CẬP NHẬT MẬT KHẨU
                    </button>
                </form>
            </div>
        </div>
    );
}