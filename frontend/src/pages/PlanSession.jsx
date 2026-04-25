import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function PlanSession() {
    const { id, planId, dayNumber } = useParams(); // Lấy cả 3 ID từ URL để không bao giờ mất
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    
    const [ex, setEx] = useState(location.state?.ex || null);
    const [currentSet, setCurrentSet] = useState(location.state?.currentSet || 1);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(!ex);

    // Fetch dữ liệu bài tập (Giữ nguyên logic cũ của ông nhưng dùng ID từ params)
    useEffect(() => {
        const fetchExercise = async () => {
            if (!ex) {
                try {
                    const token = localStorage.getItem('access_token');
                    const res = await axios.get(`http://127.0.0.1:8000/api/v1/dashboard/workout/exercises/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = { ...res.data, duration: res.data.duration || 60, sets: 3, reps: 12 };
                    setEx(data);
                    setSeconds(data.duration);
                    setIsLoading(false);
                } catch (error) { navigate('/dashboard'); }
            } else {
                setSeconds(ex.duration);
                setIsLoading(false);
            }
        };
        fetchExercise();
    }, [id, ex, navigate]);

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => setSeconds(s => s - 1), 1000);
            if (videoRef.current) videoRef.current.play();
        } else {
            clearInterval(interval);
            if (videoRef.current) videoRef.current.pause();
            if (seconds === 0 && isActive) handleSetComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const handleSetComplete = async () => {
        setIsActive(false);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://127.0.0.1:8000/api/v1/ai/workout/log/create/', {
                exercise_id: ex.exercise_id || ex.exercise || ex.id, 
                duration_seconds: ex.duration_seconds || ex.duration || 60, 
                reps: ex.suggested_reps || ex.reps || 12,
                sets: ex.suggested_sets || ex.sets || 3
            }, { headers: { Authorization: `Bearer ${token}` } });

            navigate('/rest-screen', { 
                state: { 
                    ex, 
                    nextSet: currentSet + 1,
                    planId: planId,   
                    dayNumber: dayNumber
                    } 
                });
        } catch (e) {
            console.error("Lỗi tạo log:", e.response?.data || e);
            navigate('/rest-screen', { state: { ex, nextSet: currentSet + 1, planId, dayNumber } });
        }
    };

    if (isLoading || !ex) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">ĐANG TẢI...</div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header thông tin bài tập */}
            <div className="p-4 bg-slate-900/50 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-400">✕</button>
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Đang tập</p>
                    <h2 className="font-bold text-sm truncate max-w-[150px]">{ex.name}</h2>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Vùng Video tập luyện */}
            <div className="w-full aspect-video bg-slate-900 relative border-y border-white/5">
                <video 
                    ref={videoRef}
                    src={ex.video_url} 
                    loop muted playsInline
                    className="w-full h-full object-cover"
                />
                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                            <span className="text-3xl text-white">▶︎</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-around p-8">
                <div className="text-center">
                    <p className="text-emerald-400 font-black text-lg tracking-tighter">
                        HIỆP {currentSet} <span className="text-gray-600">/ {ex.sets}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1 font-bold">{ex.reps} LẦN TẬP</p>
                </div>

                {/* Đồng hồ hiển thị chính */}
                <div className="relative">
                    <div className={`text-[120px] font-mono font-black leading-none tracking-tighter ${seconds <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Hệ thống nút bấm */}
                <div className="w-full max-w-xs space-y-4">
                    <button 
                        onClick={() => setIsActive(!isActive)} 
                        className={`w-full py-6 rounded-[32px] font-black text-xl transition-all active:scale-95 shadow-2xl ${
                            isActive 
                            ? 'bg-white text-black shadow-white/10' 
                            : 'bg-emerald-500 text-black shadow-emerald-500/20'
                        }`}
                    >
                        {isActive ? 'TẠM DỪNG' : (seconds === ex.duration ? 'BẮT ĐẦU NGAY' : 'TIẾP TỤC')}
                    </button>
                    
                    <button 
                        onClick={handleSetComplete} 
                        className="w-full py-4 text-gray-500 font-bold text-sm tracking-widest hover:text-white transition"
                    >
                        BỎ QUA BÀI TẬP
                    </button>
                </div>
            </div>
        </div>
    );
}