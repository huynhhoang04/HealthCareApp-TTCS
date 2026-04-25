import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RestScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { ex, nextSet, planId, dayNumber } = location.state || {};
    const isFinishedAllSets = nextSet > (ex?.sets || 0);
    const handleExit = async () => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://127.0.0.1:8000/api/v1/ai/plan/exercise/complete/', {
                // Gửi lên tọa độ kép: ID ngày và ID bài tập
                plan_detail_id: ex.plan_detail_id, 
                exercise_id: ex.exercise || ex.exercise_id || ex.id 
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái bài tập:", error);
        }

        if (planId && dayNumber) {
            navigate(`/workout-plan-list/${planId}/${dayNumber}`);
        } else {
            navigate('/dashboard');
        }
    };

    const [restTimer, setRestTimer] = useState(30); // Nghỉ 30s mặc định

    useEffect(() => {
        if (!ex) {
            navigate('/dashboard');
            return;
        }
        const timer = setInterval(() => {
            setRestTimer(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [ex, navigate]);

    if (!ex) return null;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-sans">
            {/* Hiển thị Calo ảo dựa trên duration */}
            <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-xs">
                Vừa đốt ~{Math.round(ex.duration * 0.15)} calo
            </p>
            <h2 className="text-5xl font-black mb-12 text-emerald-500 italic">NGHỈ NGƠI</h2>

            {/* Vòng tròn tiếp tục */}
            <div className="relative mb-12">
                {!isFinishedAllSets ? (
                    <button 
                        onClick={() => navigate(`/plan-session/${ex.id}/${planId}/${dayNumber}`, { 
                            state: { ex, currentSet: nextSet } 
                        })}
                        className="w-52 h-52 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-500/5 hover:bg-emerald-500/20 active:scale-90 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                    >
                        <span className="text-gray-500 font-black text-[10px] uppercase mb-1">Hiệp {nextSet}</span>
                        <span className="text-4xl font-black uppercase italic">Tiếp tục</span>
                        <span className="text-emerald-500 font-mono mt-2">{restTimer}s</span>
                    </button>
                ) : (
                    <div className="w-52 h-52 rounded-full bg-emerald-600 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                        <span className="text-5xl mb-2">🏆</span>
                        <span className="font-black uppercase text-sm">Xong bài!</span>
                    </div>
                )}
            </div>

            <div className="w-full max-w-xs space-y-4">
                <button 
                    onClick={handleExit} // QUAN TRỌNG: Lùi 2 bước để về trang danh sách bài tập
                    className="w-full py-5 border-2 border-white/10 rounded-[30px] font-black text-gray-400 hover:text-white transition uppercase text-sm tracking-widest"
                >
                    Kết thúc bài tập
                </button>
                
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2 text-gray-600 font-bold text-[10px] uppercase tracking-[0.4em]"
                >
                    Về Dashboard
                </button>
            </div>
        </div>
    );
}