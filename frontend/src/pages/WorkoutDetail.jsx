import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function WorkoutDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const videoRef = useRef(null);
    
    // LOGIC GỐC: Kiểm tra chế độ tập
    const targetDuration = location.state?.targetDuration || 0; 
    const isPlanMode = targetDuration > 0;

    const [exercise, setExercise] = useState(null);
    const [seconds, setSeconds] = useState(isPlanMode ? targetDuration : 0);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Lấy chi tiết bài tập từ API
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get(`http://127.0.0.1:8000/api/v1/dashboard/workout/exercises/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExercise(res.data);
                setIsLoading(false);
            } catch (e) {
                console.error("Lỗi fetch detail:", e);
                navigate('/dashboard');
            }
        };
        fetchDetail();
    }, [id, navigate]);

    // 2. Logic điều khiển Video (Tách biệt để mượt mà)
    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
            }
        }
    }, [isActive]);

    // 3. Bộ đếm thời gian (Tiến hoặc Lùi)
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(prev => {
                    if (isPlanMode) {
                        return prev > 0 ? prev - 1 : 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, isPlanMode]);

    // 4. Tự động dừng khi hết giờ (Chỉ cho Plan Mode)
    useEffect(() => {
        if (isPlanMode && seconds === 0 && isActive) {
            handleStop();
        }
    }, [seconds, isPlanMode, isActive]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStop = async () => {
        setIsActive(false);
        try {
            const token = localStorage.getItem('access_token');
            // Tính thời gian thực tế đã tập
            const finalDuration = isPlanMode ? targetDuration - seconds : seconds;
            
            await axios.post('http://127.0.0.1:8000/api/v1/dashboard/workout/log/create/', {
                exercise: id,
                duration_seconds: finalDuration,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            navigate('/dashboard');
        } catch (e) {
            alert("Lỗi lưu kết quả!");
        }
    };

    if (isLoading || !exercise) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">
            LOADING...
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 bg-slate-900/40 flex justify-between items-center backdrop-blur-md">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-400">✕</button>
                <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        {isPlanMode ? "Theo lộ trình" : "Tập tự do"}
                    </p>
                    <h2 className="font-black text-sm uppercase">{exercise.name}</h2>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Vùng Video */}
            <div className="w-full aspect-video bg-slate-900 relative">
                <video 
                    ref={videoRef}
                    src={exercise.video_url} 
                    loop muted playsInline
                    className="w-full h-full object-cover"
                />
                {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                            <span className="text-white text-3xl">▶︎</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-around p-10">
                {/* Thông tin phụ */}
                <div className="text-center">
                    <p className="text-emerald-400 font-black text-xl italic uppercase tracking-tighter">
                        {exercise.muscle_group || "Toàn thân"}
                    </p>
                    <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">
                        {isPlanMode ? `Mục tiêu: ${formatTime(targetDuration)}` : "Đang ghi nhận thời gian"}
                    </p>
                </div>

                {/* Đồng hồ đếm */}
                <div className={`text-[120px] font-mono font-black leading-none tracking-tighter transition-all duration-300 ${
                    isPlanMode && seconds <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'
                }`}>
                    {formatTime(seconds)}
                </div>

                {/* Hệ thống nút bấm theo Flow */}
                <div className="w-full max-w-xs space-y-4">
                    {!isPlanMode ? (
                        // Flow A: Tự do (Có nút Kết thúc riêng)
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => setIsActive(!isActive)}
                                className={`w-full py-6 rounded-[35px] font-black text-xl transition-all active:scale-95 shadow-2xl ${
                                    isActive ? 'bg-white text-black' : 'bg-emerald-500 text-black shadow-emerald-500/30'
                                }`}
                            >
                                {isActive ? 'TẠM DỪNG' : 'BẮT ĐẦU'}
                            </button>
                            <button 
                                onClick={handleStop}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg"
                            >
                                Kết thúc & Lưu
                            </button>
                        </div>
                    ) : (
                        // Flow B: Theo Plan (Nút bấm thông minh)
                        <button 
                            onClick={() => setIsActive(!isActive)}
                            className={`w-full py-6 rounded-[35px] font-black text-xl transition-all active:scale-95 shadow-2xl ${
                                isActive ? 'bg-white text-black' : 'bg-blue-600 text-white shadow-blue-600/30'
                            }`}
                        >
                            {isActive ? 'TẠM DỪNG' : (seconds === targetDuration ? 'BẮT ĐẦU TẬP' : 'TIẾP TỤC')}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-full py-4 text-gray-600 font-bold text-xs tracking-[0.3em] hover:text-white transition"
                    >
                        HUỶ BỎ
                    </button>
                </div>
            </div>
        </div>
    );
}