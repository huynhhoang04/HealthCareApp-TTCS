import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function WorkoutPlanList() {
    const { planId, dayNumber } = useParams(); 
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Đưa hàm này lên trên cùng để gọi được ở mọi nơi
    const handleCompleteDay = async (planDetailId, token) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/v1/ai/plan/day/complete/', {
                plan_detail_id: planDetailId
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Gọi xong API chốt ngày thì văng ra Dashboard (Timeline sẽ xanh!)
            navigate('/dashboard');
        } catch (error) {
            console.error("Lỗi kết thúc ngày:", error);
            setIsLoading(false);
            alert("Lưu tiến độ thất bại, hãy thử lại!");
        }
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get(`http://127.0.0.1:8000/api/v1/ai/plan/${planId}/day/${dayNumber}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = res.data;
                setExercises(data);

                // Kiểm tra xem tất cả bài tập đã xanh hết chưa
                const isAllCompleted = data.length > 0 && data.every(ex => ex.is_completed === true);
                
                if (isAllCompleted) {
                    // TRƯỜNG HỢP 1: TỰ ĐỘNG CHỐT NGÀY KHI ĐÃ TẬP XONG HẾT BÀI
                    await handleCompleteDay(data[0].plan_detail_id, token);
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("Lỗi lấy danh sách bài tập:", e);
                setIsLoading(false);
            }
        };
        fetchExercises();
    }, [planId, dayNumber]);

    if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">Đang tải bài tập...</div>;

    // Biến phụ để biết màn hình có đang dở dang bài tập nào không
    const hasUnfinishedExercises = exercises.length > 0 && !exercises.every(ex => ex.is_completed);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-5 pb-10 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/dashboard')} className="text-2xl">←</button>
                <h1 className="text-xl font-bold">Bài tập Ngày {dayNumber}</h1>
            </div>

            <div className="space-y-4 flex-1">
                {exercises.length > 0 ? exercises.map((ex) => (
                    <div key={ex.id} className={`p-4 rounded-2xl flex items-center gap-4 shadow-lg border transition-all mb-4 ${
                        ex.is_completed ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-800 border-slate-700'
                    }`}>
                        {ex.image ? (
                            <img 
                                src={ex.image} 
                                alt={ex.name} 
                                className={`w-16 h-16 rounded-xl object-cover shadow-md ${ex.is_completed ? 'opacity-50 grayscale' : ''}`} 
                            />
                        ) : (
                            <div className={`w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-2xl shadow-md ${ex.is_completed ? 'opacity-50' : ''}`}>
                                ⚡︎
                            </div>
                        )}
                        
                        <div className="flex-1">
                            <p className={`font-bold text-lg ${ex.is_completed ? 'text-emerald-400 line-through opacity-80' : 'text-white'}`}>
                                {ex.name}
                            </p>
                            <p className="text-sm text-slate-400">{ex.muscle} • {ex.sets} Sets x {ex.reps} Reps</p>
                        </div>

                        {ex.is_completed ? (
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl font-black">
                                ✓
                            </div>
                        ) : (
                            <button 
                                onClick={() => navigate(`/plan-session/${ex.id}/${planId}/${dayNumber}`, { 
                                    state: { ex: ex, currentSet: 1 } 
                                })}
                                className="bg-emerald-500 w-12 h-12 flex items-center justify-center rounded-full hover:scale-110 transition active:scale-95 pl-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                            </button>
                        )}
                    </div>
                )) : (
                    <p className="text-center text-slate-500 italic">Hôm nay không có bài tập nào.</p>
                )}
            </div>

            <div className="mt-8 space-y-3">
                {/* TRƯỜNG HỢP 2: NÚT CHỐT NGÀY THỦ CÔNG (Chỉ hiện khi chưa tập xong hết) */}
                {hasUnfinishedExercises && (
                    <button 
                        onClick={() => {
                            const token = localStorage.getItem('access_token');
                            handleCompleteDay(exercises[0].plan_detail_id, token);
                        }}
                        className="w-full p-4 bg-emerald-600 rounded-2xl font-bold text-white hover:bg-emerald-500 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.4)] active:scale-95"
                    >
                        ✓ KẾT THÚC NGÀY TẬP SỚM
                    </button>
                )}

                {/* Nút thoát an toàn không chốt ngày */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full p-4 bg-slate-800 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                >
                    Thoát ra Dashboard
                </button>
            </div>
        </div>
    );
}