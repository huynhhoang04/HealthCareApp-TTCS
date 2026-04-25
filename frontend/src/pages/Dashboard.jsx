import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentTime, setCurrentTime] = useState(new Date());

    // Effect đếm giây liên tục (Mỗi 1000ms = 1 giây update 1 lần)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        // Clean up: Hủy bộ đếm khi người dùng chuyển sang trang khác để không bị rò rỉ bộ nhớ (Memory Leak)
        return () => clearInterval(timer);
    }, []);

    const getGreeting = (hour) => {
        if (hour >= 5 && hour < 12) return { title: 'Chào buổi sáng!', sub: 'Hôm nay là một ngày tuyệt vời để bứt phá.' };
        if (hour >= 12 && hour < 18) return { title: 'Chào buổi chiều!', sub: 'Giữ vững năng lượng cho nửa ngày còn lại nhé.' };
        if (hour >= 18 && hour < 23) return { title: 'Chào buổi tối!', sub: 'Đã đến lúc thư giãn và phục hồi cơ thể.' };
        return { title: 'Chào buổi đêm!', sub: 'Ngủ sớm đi, thức khuya mất cơ đấy ông giáo!' };
    };

    const { title: greetingTitle, sub: greetingSub } = getGreeting(currentTime.getHours());
    
    // State chứa dữ liệu từ 3 API
    const [dashboardData, setDashboardData] = useState(null);
    const [nutritionData, setNutritionData] = useState(null);
    const [workoutData, setWorkoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [planInfo, setPlanInfo] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

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

    useEffect(() => {
        const fetchPlanStatus = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://127.0.0.1:8000/api/v1/ai/plan/current/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPlanInfo(res.data);
            } catch (e) { console.error("Chưa có plan"); }
        };
        fetchPlanStatus();
    }, []);

    const getVisibleDays = (current, total) => {
        let start = Math.max(1, current - 2);
        let end = Math.min(total, start + 4);
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        const days = [];
        for (let i = start; i <= end; i++) {
            days.push(i);
        }
        return days;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const toggleTheme = () => {
        const htmlElement = document.documentElement;
        // Kiểm tra xem hiện tại đang là Dark hay Light
        const isDark = htmlElement.classList.contains('dark');
        
        if (isDark) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('app_dark_mode', 'false'); // Đồng bộ với Settings
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('app_dark_mode', 'true'); // Đồng bộ với Settings
        }
    };

    return (
        // Wrapper chuẩn Mobile: Căn giữa, max-w-md (tương đương màn hình điện thoại)
        <div className="min-h-screen bg-slate-100 dark:bg-gray-950 pb-20">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-lg">
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-lg drop-shadow-2xl pt-2 pb-2 flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-emerald-600 p-3 pr-4 rounded-r-full shadow-lg drop-shadow-2xl">
                        <Link to="/profile" className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-xl hover:scale-105 transition">
                            {dashboardData?.user_metrics.gender === 'Nam' ? '👦🏻' : '👱🏻‍♀️'}
                        </Link>
                        <div className="flex flex-col leading-tight">
                            <p className="text-xs text-gray-800 dark:text-gray-200 font-bold">
                                {currentTime.getHours().toString().padStart(2, '0')}:
                                {currentTime.getMinutes().toString().padStart(2, '0')}:
                                {currentTime.getSeconds().toString().padStart(2, '0')}
                            </p>
                            <span className="font-extrabold text-gray-800 dark:text-white">
                                {dashboardData?.user_metrics.full_name || "Thành viên"}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center pr-3 ">
                        <button onClick={toggleTheme} className="bg-transparent drop-shadow-[0_0px_3px_rgba(0,0,0,0.7)] text-3xl text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition">☀︎</button>
                        <button onClick={() => navigate('/contact')} className="bg-transparent drop-shadow-[0_0px_3px_rgba(0,0,0,0.7)] text-3xl text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition">✆</button>
                        <button onClick={logout} className="bg-transparent drop-shadow-[0_0px_3px_rgba(0,0,0,0.7)] text-3xl text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition">
                            <span className="text-xl"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </header>
                {/* --- HEADER: LỜI CHÀO & BMI --- */}
                <div className="bg-emerald-600 text-white p-6 rounded-b-3xl shadow-md drop-shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">{greetingTitle}</h1>
                            <p className="text-emerald-100 text-sm">{greetingSub}</p>
                        </div>
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
                {/* --- LỘ TRÌNH AI --- */}
                <div className="px-5 mt-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">Lộ trình AI của bạn</h2>
                        {/* Luôn cho phép tạo lộ trình mới nếu muốn đổi ý */}
                        <button 
                            onClick={() => navigate('/generate-plan')}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                        >
                            + Lộ trình mới
                        </button>
                    </div>

                    {planInfo?.has_plan ? (
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-5 shadow-lg">
                            <h3 className="text-white text-xl font-bold mb-4">
                                {planInfo.is_all_completed ? "🏆 Đã xong lộ trình!" : `Ngày ${planInfo.current_day}/${planInfo.total_days}`}
                            </h3>
                            
                            <div className="border border-gray-700 dark:border-gray-600 rounded-xl p-5 flex flex-col items-center">
                                <div className="w-full flex justify-between items-center relative mb-8 mt-4">
                                    {getVisibleDays(planInfo.current_day, planInfo.total_days).map((day, index, arr) => {
                                        // Logic màu sắc: 
                                        // Nếu ngày < current_day: Xanh (đã xong)
                                        // Nếu ngày == current_day VÀ hôm nay đã xong: Xanh (vừa xong)
                                        const isDone = day < planInfo.current_day || (day === planInfo.current_day && planInfo.is_today_done);
                                        const isCurrent = day === planInfo.current_day && !planInfo.is_today_done;

                                        return (
                                            <div key={day} className="flex-1 flex justify-center relative">
                                                {index < arr.length - 1 && (
                                                    <div className="absolute top-1/2 left-[50%] right-[-50%] h-[1px] bg-gray-600 z-0" />
                                                )}
                                                <div className="relative z-10 flex flex-col items-center">
                                                    {day === planInfo.current_day && (
                                                        <div className="absolute -top-6 text-emerald-400 text-[10px] animate-bounce">▼</div>
                                                    )}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                                                        isDone 
                                                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                            : isCurrent
                                                            ? 'bg-gray-900 border-emerald-500 text-white' 
                                                            : 'bg-gray-900 border-gray-500 text-gray-500' 
                                                    }`}>
                                                        {isDone ? '✓' : day}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* NÚT BẤM CÓ LOCK */}
                                {planInfo.is_today_done ? (
                                    <button disabled className="w-full p-3 bg-gray-800 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold border border-gray-700 dark:border-gray-600 cursor-not-allowed">
                                        Hẹn gặp lại vào ngày mai!
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => navigate(`/workout-plan-list/${planInfo.plan_id}/${planInfo.current_day}`)}
                                        className="w-full p-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 transition shadow-lg"
                                    >
                                        Bắt đầu tập luyện ngay
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* UI khi chưa có Plan (giữ nguyên) */
                        <div onClick={() => navigate('/generate-plan')} className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-3xl mb-2 text-emerald-600 dark:text-emerald-400">✦</span>
                            <p className="font-bold text-gray-800 dark:text-gray-200">Tạo lộ trình với AI</p>
                        </div>
                    )}
                </div>

                {/* --- BIỂU ĐỒ 7 NGÀY --- */}
                <div className="p-5 mt-2">
                    <h2 className="text-lg font-extrabold text-gray-800 dark:text-white mb-4">Biến động Calo (7 ngày)</h2>
                    <div className="h-64 bg-slate-50 dark:bg-gray-800 rounded-2xl p-2 border border-slate-100 dark:border-gray-700">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData?.chart_data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day_label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                                <Line type="monotone" name="Nạp vào" dataKey="calo_in" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                                <Line type="monotone" name="Đốt ra" dataKey="calo_out" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="px-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">Dinh dưỡng hôm nay</h2>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {nutritionData?.summary.total_calo_in} / {nutritionData?.summary.target_calo_in} kcal
                        </span>
                    </div>
                    <div className="space-y-3">
                        {nutritionData?.logs.length === 0 ? (
                            <p className="text-center text-gray-400 dark:text-gray-400 py-4 italic bg-slate-50 dark:bg-gray-800 rounded-xl">Chưa có bữa ăn nào được ghi nhận.</p>
                        ) : (
                            nutritionData?.logs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        {log.image ? (
                                            <img src={log.image} alt={log.food_name} className="w-12 h-12 rounded-xl object-cover bg-slate-50 dark:bg-gray-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">𓌉◯𓇋</div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">{log.food_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{log.meal_type} • {log.weight_in_grams ? `${log.weight_in_grams}g` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-extrabold text-orange-500">+{log.calories}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-400">{log.logged_time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <button onClick={() => navigate('/add-nutrition')} className="w-full py-3 mt-2 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl hover:bg-emerald-50 dark:hover:bg-gray-800 transition">
                            + Thêm bữa ăn
                        </button>
                    </div>
                </div>

                {/* --- KHỐI TẬP LUYỆN --- */}
                <div className="px-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">Tập luyện hôm nay</h2>
                        <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                            {workoutData?.summary.total_calo_out} / {workoutData?.summary.target_calo_out} kcal
                        </span>
                    </div>
                    <div className="space-y-3">
                        {workoutData?.logs.length === 0 ? (
                            <p className="text-center text-gray-400 dark:text-gray-400 py-4 italic bg-slate-50 dark:bg-gray-800 rounded-xl">Bạn chưa tập bài nào hôm nay.</p>
                        ) : (
                            workoutData?.logs.map((log) => (
                                <div key={log.log_id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        {log.image ? (
                                            <img src={log.image} alt={log.exercise_name} className="w-12 h-12 rounded-xl object-cover bg-slate-50 dark:bg-gray-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">⚡︎</div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">{log.exercise_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{Math.ceil((log.duration_seconds || 0) / 60)} phút</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-extrabold text-rose-500">-{Math.round(log.calories_burned)}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-400">{log.logged_at ? new Date(log.logged_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <button onClick={() => navigate('/add-workout')} className="w-full py-3 mt-2 border-2 border-dashed border-rose-300 dark:border-rose-700 text-rose-500 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-50 dark:hover:bg-gray-800 transition">
                            + Thêm bài tập
                        </button>
                    </div>
                </div>
                <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex justify-around items-center px-6 z-50 rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.5)]">
                    <Link to="/profile" className="flex flex-col items-center">
                        <span className="text-2xl text-gray-400 hover:text-emerald-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </span>
                    </Link>

                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <button onClick={() => navigate('/chat')} className="w-14 h-14 bg-gray-900 dark:bg-gray-800 text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white active:scale-95 transition">
                            ✦
                        </button>
                    </div>

                    <button onClick={() => navigate('/settings')} className="flex flex-col items-center group">
                        <span className="text-2xl text-gray-400 group-hover:text-emerald-600 group-hover:rotate-90 transition-all duration-300">⚙︎</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}