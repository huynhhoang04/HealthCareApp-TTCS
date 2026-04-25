import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GeneratePlan() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        days: 7,
        goal: 'Tăng cơ',
        location: 'Home'
    });

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://127.0.0.1:8000/api/v1/ai/plan/generate-hybrid/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Lỗi gen plan:", error);
            alert("AI đang bận tính toán, thử lại sau ít phút nhé!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">AI đang thiết kế lộ trình...</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chúng tôi đang tính toán Calo và lựa chọn bài tập tối ưu nhất dựa trên mục tiêu của bạn.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen shadow-lg p-6">
                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="text-2xl text-gray-800 dark:text-white">←</button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Thiết lập lộ trình AI</h1>
                </header>

                <div className="space-y-6">
                    {/* Số ngày */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Bạn muốn tập luyện trong bao nhiêu ngày?</label>
                        <input 
                            type="number" min="1" max="30"
                            value={formData.days}
                            onChange={(e) => setFormData({...formData, days: e.target.value})}
                            className="w-full p-4 bg-slate-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Mục tiêu */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Mục tiêu của bạn là gì?</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Tăng cơ', 'Giảm mỡ', 'Duy trì', 'Cải thiện sức bền'].map((g) => (
                                <button 
                                    key={g}
                                    onClick={() => setFormData({...formData, goal: g})}
                                    className={`p-4 rounded-2xl font-bold text-sm transition ${formData.goal === g ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Địa điểm */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Bạn tập luyện ở đâu?</label>
                        <div className="flex gap-3">
                            {['Home', 'Gym'].map((l) => (
                                <button 
                                    key={l}
                                    onClick={() => setFormData({...formData, location: l})}
                                    className={`flex-1 p-4 rounded-2xl font-bold transition ${formData.location === l ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10">
                        <button 
                            onClick={handleGenerate}
                            className="w-full p-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 active:scale-95 transition"
                        >
                            ✦ Bắt đầu tạo lộ trình
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}