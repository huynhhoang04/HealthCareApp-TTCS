// src/pages/SetupProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SetupProfile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); // Thêm state loading để UX mượt hơn
    
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
        activity_level: '1.2',
        fitness_goal: 'Duy trì',
        target_weight: ''
    });

    // BƯỚC MỚI: Gọi API để kéo data cũ về khi vừa vào trang
    useEffect(() => {
        const fetchExistingProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://127.0.0.1:8000/api/v1/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Nếu gọi thành công (đã có profile), đổ dữ liệu vào form
                // Dùng || '' để tránh lỗi Uncontrolled Input trong React khi giá trị bị null
                const data = res.data;
                setFormData({
                    gender: data.gender || 'Nam',
                    dob: data.dob || '',
                    height: data.height || '',
                    weight: data.weight || '',
                    body_fat_percentage: data.body_fat_percentage || '',
                    waist_circumference: data.waist_circumference || '',
                    hip_circumference: data.hip_circumference || '',
                    neck_circumference: data.neck_circumference || '',
                    chest_circumference: data.chest_circumference || '',
                    activity_level: data.activity_level?.toString() || '1.2',
                    fitness_goal: data.fitness_goal || 'Duy trì',
                    target_weight: data.target_weight || ''
                });
            } catch (error) {
                // Nếu lỗi 404 (người dùng mới tinh chưa có profile), kệ nó, dùng state mặc định
                console.log("Đây là người dùng mới, chưa có profile.");
            } finally {
                // Tắt trạng thái loading để hiện form
                setIsLoading(false);
            }
        };

        fetchExistingProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const cleanData = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '' && v !== null)
            );

            await axios.post('http://127.0.0.1:8000/api/v1/profile/', cleanData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Lưu hồ sơ thành công! Bắt đầu hành trình thôi.');
            // Lưu xong thì quay lại trang Profile thay vì ra thẳng Dashboard
            navigate('/profile'); 
            
        } catch (error) {
            console.error('Lỗi lưu profile:', error.response?.data);
            alert('Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập!');
        }
    };

    // Hiệu ứng loading lúc mới vào trang để chờ API kéo data
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-10 px-4 flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md p-8 relative">
                
                {/* Nút Back để quay về trang Profile nếu đang chỉnh sửa dở mà đổi ý */}
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition">←</button>

                <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 text-center">Hồ Sơ Thể Chất</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Hãy cung cấp chi tiết để có lộ trình tốt nhất</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- PHẦN 1: CHỈ SỐ CƠ BẢN --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">1. Chỉ số cơ bản</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Giới tính *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Ngày sinh *</label>
                                <input type="date" name="dob" value={formData.dob} required onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Chiều cao (cm) *</label>
                                <input type="number" name="height" value={formData.height} required onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Cân nặng (kg) *</label>
                                <input type="number" name="weight" value={formData.weight} step="0.1" required onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* --- PHẦN 2: CHỈ SỐ NÂNG CAO --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">2. Số đo chi tiết (Tùy chọn)</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">% Mỡ cơ thể</label>
                                <input type="number" name="body_fat_percentage" value={formData.body_fat_percentage} step="0.1" onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Vòng eo (cm)</label>
                                <input type="number" name="waist_circumference" value={formData.waist_circumference} step="0.1" onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Hông (cm)</label>
                                <input type="number" name="hip_circumference" value={formData.hip_circumference} step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Cổ (cm)</label>
                                <input type="number" name="neck_circumference" value={formData.neck_circumference} step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Ngực (cm)</label>
                                <input type="number" name="chest_circumference" value={formData.chest_circumference} step="0.1" onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* --- PHẦN 3: LỐI SỐNG & MỤC TIÊU --- */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">3. Lối sống & Mục tiêu</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Mức độ vận động</label>
                            <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                <option value="1.2">Ít vận động (Việc văn phòng, không tập)</option>
                                <option value="1.375">Vận động nhẹ (Tập 1-3 ngày/tuần)</option>
                                <option value="1.55">Vận động vừa (Tập 3-5 ngày/tuần)</option>
                                <option value="1.725">Vận động nhiều (Tập 6-7 ngày/tuần)</option>
                                <option value="1.9">Vận động nặng (VĐV, lao động tay chân)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Mục tiêu chính *</label>
                                <select name="fitness_goal" value={formData.fitness_goal} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                                    <option value="Giảm cân">Giảm cân</option>
                                    <option value="Tăng cơ">Tăng cơ</option>
                                    <option value="Duy trì">Duy trì vóc dáng</option>
                                    <option value="Cải thiện sức bền">Cải thiện sức bền</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Cân nặng mục tiêu</label>
                                <input type="number" name="target_weight" value={formData.target_weight} step="0.1" onChange={handleChange} placeholder="Ví dụ: 60" className="w-full p-3 bg-slate-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 dark:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-700 transition mt-6 text-lg">
                        Lưu hồ sơ & Bắt đầu
                    </button>
                </form>
            </div>
        </div>
    );
}