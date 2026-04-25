import { useNavigate } from 'react-router-dom';

export default function Contact() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 flex justify-center py-10 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative h-fit border border-transparent dark:border-gray-700">
                
                {/* Nút quay lại */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 text-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                    ←
                </button>
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 transition-colors">
                        📬
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Liên Hệ</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kết nối & Hỗ trợ khách hàng</p>
                </div>

                <div className="space-y-6">
                    {/* KHỐI 1: LIÊN HỆ TRỰC TIẾP */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kênh hỗ trợ</h3>
                        <div className="space-y-3">
                            {/* Gọi điện thoại - Thay số của ông vào chỗ tel: và phần hiển thị */}
                            <a 
                                href="tel:0867994416" 
                                className="flex items-center p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl hover:scale-[1.02] hover:border-emerald-500 border border-transparent transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition">📞</div>
                                <div className="ml-4">
                                    <p className="font-bold text-gray-800 dark:text-white">Hotline CSKH</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">0867.994.416</p>
                                </div>
                            </a>

                            {/* Gửi Email */}
                            <a 
                                href="mailto:huynh696k@gmail.com" 
                                className="flex items-center p-4 bg-slate-50 dark:bg-gray-700/50 rounded-2xl hover:scale-[1.02] hover:border-blue-500 border border-transparent transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition">✉️</div>
                                <div className="ml-4">
                                    <p className="font-bold text-gray-800 dark:text-white">Email Hỗ trợ</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">huynh696k@gmail.com</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* KHỐI 2: ĐỘI NGŨ PHÁT TRIỂN (Nơi ông thể hiện) */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-8">Đội ngũ phát triển</h3>
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-slate-200 dark:border-gray-600 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full z-0"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-900 dark:bg-black rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-emerald-500">
                                    👨‍💻
                                </div>
                                <div>
                                    <p className="font-black text-lg text-gray-800 dark:text-white">Solo Developer</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                        Được thiết kế và lập trình bằng tất cả đam mê để mang lại trải nghiệm sức khỏe tốt nhất bằng AI. Huynh Hoàng 2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* KHỐI 3: THÔNG TIN DỊCH VỤ */}
                    <div className="pt-6 border-t border-slate-100 dark:border-gray-700 text-center">
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Healthcare AI System</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Phiên bản 1.0.0 • Hoạt động ổn định</p>
                    </div>

                </div>
            </div>
        </div>
    );
}