// src/pages/Welcome.jsx
import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// 1. Định nghĩa dữ liệu cho 3 trang giới thiệu (Cảm hứng từ image_7.png)
const onboardingData = [
    {
        icon: 'ᶠᶸᶜᵏᵧₒᵤ!🖕',
        title: 'dmm',
        desc: 'dmm',
    },
    {
        icon: '💦🫱({})🫲👅',
        title: 'dmm',
        desc: 'dmm',
    },
    {
        icon: '({})👅',
        title: 'dmm',
        desc: 'dmm',
    }
];

export default function Welcome() {
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    // State để theo dõi trang giới thiệu hiện tại (0, 1, 2)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Check auth: Nếu có vé rồi -> Đá thẳng vào Dashboard
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    // Lấy dữ liệu của trang hiện tại
    const currentSlide = onboardingData[currentSlideIndex];

    // Hàm xử lý khi bấm nút "Tiếp theo" hoặc "Bắt đầu"
    const handleAction = () => {
        if (currentSlideIndex < onboardingData.length - 1) {
            // Nếu chưa đến trang cuối -> lướt sang trang tiếp theo
            setCurrentSlideIndex(prev => prev + 1);
        } else {
            // Nếu là trang cuối -> Chuyển sang trang chọn Login/Register
            navigate('/auth-options');
        }
    };

    return (
        // Mobile-first container: nền trắng sạch sẽ, inspired by image_7.png
        <div className="flex flex-col items-center justify-between min-h-screen bg-slate-50 px-6 py-12 text-gray-900">
            
            {/* Top Area: Nút "Bỏ qua" để đi thẳng đến AuthOption */}
            <div className="w-full text-right">
                <button 
                    onClick={() => navigate('/auth-options')}
                    className="text-gray-500 hover:text-emerald-600 font-medium text-lg"
                >
                    Bỏ qua
                </button>
            </div>

            {/* Middle Area: Phần hiển thị nội dung chính của trang giới thiệu */}
            <div className="w-full max-w-sm text-center px-4 flex-grow flex flex-col items-center justify-center">
                {/* Phần minh họa (có thể thay bằng ảnh png) */}
                <div className="text-9xl mb-12 transform transition-transform duration-500 hover:scale-105">
                    {currentSlide.icon}
                </div>
                
                <h1 className="text-3xl font-extrabold mb-4 text-gray-950 leading-tight">
                    {currentSlide.title}
                </h1>
                <p className="text-lg text-gray-600 mb-12">
                    {currentSlide.desc}
                </p>
                
                {/* Page Indicator (Mấy cái dấu chấm tròn, lấy cảm hứng từ image_7.png) */}
                <div className="flex justify-center space-x-3">
                    {onboardingData.map((_, index) => (
                        <div 
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlideIndex 
                                ? 'w-6 bg-emerald-600' // Dấu chấm trang hiện tại: dài ra và màu đậm
                                : 'bg-gray-300'       // Các dấu chấm khác: màu xám nhạt
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Area: Nút bấm chuẩn mobile-first, to, dễ bấm */}
            <div className="w-full max-w-sm px-4">
                <button 
                    onClick={handleAction}
                    className="w-full bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-emerald-700 transition text-xl"
                >
                    {currentSlideIndex < onboardingData.length - 1 ? 'Tiếp tục' : 'Bắt đầu ngay'}
                </button>
            </div>
        </div>
    );
}