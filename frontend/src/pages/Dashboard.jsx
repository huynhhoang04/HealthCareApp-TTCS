import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const showtime = new Date();
    
    // State chứa dữ liệu từ 3 API
    const [dashboardData, setDashboardData] = useState(null);
    const [nutritionData, setNutritionData] = useState(null);
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Dùng Promise.all để bắn 3 API cùng 1 lúc (tối ưu tốc độ tải)
                const [chartRes, nutritionRes, workoutRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/v1/dashboard/chart-7-days/', config),
                    axios.get('http://127.0.0.1:8000/api/v1/dashboard/nutrition/today/', config),
                    axios.get('http://127.0.0.1:8000/api/v1/dashboard/workout/today/', config)
                ]);

                setDashboardData(chartRes.data);
                setNutritionData(nutritionRes.data);
                setWorkoutData(workoutRes.data);
                setIsLoading(false);
                
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 404) {
                    navigate('/setup-profile');
                } else {
                    console.error("Lỗi lấy dữ liệu:", error);
                }
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        // Wrapper chuẩn Mobile: Căn giữa, max-w-md (tương đương màn hình điện thoại)
        <div className="min-h-screen bg-slate-100 pb-20">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
                <header className="sticky top-0 z-40 bg-white shadow-lg drop-shadow-2xl pt-2 pb-2 flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-emerald-600 p-3 pr-4 rounded-r-full shadow-lg drop-shadow-2xl">
                        <Link to="/setup-profile" className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl hover:scale-105 transition">
                            {dashboardData?.user_metrics.gender === 'Nam' ? '👦🏻' : '👱🏻‍♀️'}
                        </Link>
                        <div className="flex flex-col leading-tight">
                            <p className="text-xs text-gray-800 font-bold">{showtime.getHours()}:{showtime.getMinutes().toString().padStart(2, '0')}:{showtime.getSeconds().toString().padStart(2, '0')}</p>
                            <span className="font-extrabold text-gray-800">
                                {dashboardData?.user_metrics.full_name || "Thành viên"}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center pr-3 ">
                        <button className="bg-transparent drop-shadow-[0_0px_3px_rgba(0,0,0,0.7)] text-3xl text-gray-700 hover:text-emerald-600 transition">🌗</button>
                        <button className="bg-transparent drop-shadow-[0_0px_3px_rgba(0,0,0,0.7)] text-3xl text-gray-700 hover:text-emerald-600 transition"> 𖦤 </button>
                    </div>
                </header>
                {/* --- HEADER: LỜI CHÀO & BMI --- */}
                <div className="bg-emerald-600 text-white p-6 rounded-b-3xl shadow-md drop-shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Chào buổi sáng!</h1>
                            <p className="text-emerald-100 text-sm">Hôm nay là một ngày tuyệt vời để bứt phá.</p>
                        </div>
                        {/* Nút đăng xuất tạm thời ở góc phải */}
                        <button onClick={logout} className="p-2 bg-emerald-700 rounded-full hover:bg-emerald-800 transition">
                            <span className="text-xl">⍈</span>
                        </button>
                    </div>
                    
                    {/* Thẻ BMI */}
                    <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">Chỉ số BMI</p>
                            <p className="text-2xl font-black">{dashboardData?.user_metrics.bmi}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">Trạng thái</p>
                            <span className="bg-white text-emerald-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                {dashboardData?.user_metrics.bmi_status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- BIỂU ĐỒ 7 NGÀY --- */}
                <div className="p-5 mt-2">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-4">Biến động Calo (7 ngày)</h2>
                    <div className="h-64 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData?.chart_data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day_label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                                {/* Đường màu xanh lá cho Nạp vào, màu cam đỏ cho Đốt ra */}
                                <Line type="monotone" name="Nạp vào" dataKey="calo_in" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                                <Line type="monotone" name="Đốt ra" dataKey="calo_out" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- KHỐI DINH DƯỠNG --- */}
                <div className="px-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-extrabold text-gray-800">Dinh dưỡng hôm nay</h2>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {nutritionData?.summary.total_calo_in} / {nutritionData?.summary.target_calo_in} kcal
                        </span>
                    </div>
                    <div className="space-y-3">
                        {nutritionData?.logs.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 italic bg-slate-50 rounded-xl">Chưa có bữa ăn nào được ghi nhận.</p>
                        ) : (
                            nutritionData?.logs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">🍲</div>
                                        <div>
                                            <p className="font-bold text-gray-800">{log.food_name}</p>
                                            <p className="text-xs text-gray-500">{log.meal_type} • {log.weight_in_grams}g</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-extrabold text-orange-500">+{log.calories}</p>
                                        <p className="text-xs text-gray-400">{log.logged_at}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full py-3 mt-2 border-2 border-dashed border-emerald-300 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition">
                            + Thêm bữa ăn
                        </button>
                    </div>
                </div>

                {/* --- KHỐI TẬP LUYỆN --- */}
                <div className="px-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-extrabold text-gray-800">Tập luyện hôm nay</h2>
                        <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                            {workoutData?.summary.total_calo_out} / {workoutData?.summary.target_calo_out} kcal
                        </span>
                    </div>
                    <div className="space-y-3">
                        {workoutData?.logs.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 italic bg-slate-50 rounded-xl">Bạn chưa tập bài nào hôm nay.</p>
                        ) : (
                            workoutData?.logs.map((log) => (
                                <div key={log.log_id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">🔥</div>
                                        <div>
                                            <p className="font-bold text-gray-800">{log.exercise_name}</p>
                                            <p className="text-xs text-gray-500">{log.duration_minutes} phút</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-extrabold text-rose-500">-{Math.round(log.calories_burned)}</p>
                                        <p className="text-xs text-gray-400">{log.logged_time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full py-3 mt-2 border-2 border-dashed border-rose-300 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition">
                            + Thêm bài tập
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}