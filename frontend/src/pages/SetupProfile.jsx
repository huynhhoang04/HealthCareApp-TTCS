// src/pages/SetupProfile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SetupProfile() {
    const navigate = useNavigate();
    
    // Đã bổ sung full 12 trường y hệt file models.py của ông
    const [formData, setFormData] = useState({
        gender: 'Nam',
        dob: '',
        height: '',
        weight: '',
        body_fat_percentage: '',
        waist_circumference: '',
        hip_circumference: '',
        neck_circumference: '',
        chest_circumference: '',
        activity_level: '1.2', // Mặc định là ít vận động
        fitness_goal: 'Duy trì', // Khớp với GOAL_CHOICES
        target_weight: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            // Lọc bỏ các trường rỗng (những số đo người dùng chưa muốn nhập) để không bị lỗi số thực
            const cleanData = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '')
            );

            await axios.post('http://127.0.0.1:8000/api/v1/profile/', cleanData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Lưu hồ sơ thành công! Bắt đầu hành trình thôi.');
            navigate('/dashboard'); 
            
        } catch (error) {
            console.error('Lỗi lưu profile:', error.response?.data);
            alert('Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập!');
        }
    };

    return (
        // Dùng bg-slate-50 và căn giữa
        <div className="min-h-screen bg-slate-50 py-10 px-4 flex justify-center">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
                <h2 className="text-3xl font-extrabold text-emerald-600 mb-2 text-center">Hồ Sơ Thể Chất</h2>
                <p className="text-sm text-gray-500 text-center mb-8">Hãy cung cấp chi tiết để có lộ trình tốt nhất</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- PHẦN 1: CHỈ SỐ CƠ BẢN --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">1. Chỉ số cơ bản</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính *</label>
                                <select name="gender" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh *</label>
                                <input type="date" name="dob" required onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Chiều cao (cm) *</label>
                                <input type="number" name="height" required onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cân nặng (kg) *</label>
                                <input type="number" name="weight" step="0.1" required onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* --- PHẦN 2: CHỈ SỐ NÂNG CAO (Không bắt buộc) --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">2. Số đo chi tiết (Tùy chọn)</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">% Mỡ cơ thể</label>
                                <input type="number" name="body_fat_percentage" step="0.1" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Vòng eo (cm)</label>
                                <input type="number" name="waist_circumference" step="0.1" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Hông (cm)</label>
                                <input type="number" name="hip_circumference" step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Cổ (cm)</label>
                                <input type="number" name="neck_circumference" step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngực (cm)</label>
                                <input type="number" name="chest_circumference" step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* --- PHẦN 3: LỐI SỐNG & MỤC TIÊU --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">3. Lối sống & Mục tiêu</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mức độ vận động</label>
                            <select name="activity_level" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                <option value="1.2">Ít vận động (Việc văn phòng, không tập)</option>
                                <option value="1.375">Vận động nhẹ (Tập 1-3 ngày/tuần)</option>
                                <option value="1.55">Vận động vừa (Tập 3-5 ngày/tuần)</option>
                                <option value="1.725">Vận động nhiều (Tập 6-7 ngày/tuần)</option>
                                <option value="1.9">Vận động nặng (VĐV, lao động tay chân)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mục tiêu chính *</label>
                                <select name="fitness_goal" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                    <option value="Giảm cân">Giảm cân</option>
                                    <option value="Tăng cơ">Tăng cơ</option>
                                    <option value="Duy trì">Duy trì vóc dáng</option>
                                    <option value="Cải thiện sức bền">Cải thiện sức bền</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cân nặng mục tiêu</label>
                                <input type="number" name="target_weight" step="0.1" onChange={handleChange} placeholder="Ví dụ: 60" className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition mt-6 text-lg">
                        Lưu hồ sơ & Bắt đầu
                    </button>
                </form>
            </div>
        </div>
    );
}