Health & Train App - Ứng dụng Theo dõi Sức khỏe và Tập luyện
Dự án thuộc học phần Thực tập cơ sở tại Học viện Công nghệ Bưu chính Viễn thông (PTIT). Ứng dụng cung cấp giải pháp toàn diện giúp người dùng quản lý chỉ số cơ thể (BMI, BMR, TDEE), nhật ký dinh dưỡng và lộ trình tập luyện hàng ngày.

🏗 Cấu trúc dự án
Dự án được xây dựng theo kiến trúc Decoupled (Tách biệt) giữa Backend và Frontend:

backend/: Xây dựng dựa trên Framework Django (Python), cung cấp các API xử lý logic và quản lý Cơ sở dữ liệu PostgreSQL.

frontend/: Xây dựng bằng ReactJS (Vite), sử dụng Tailwind CSS để phát triển giao diện người dùng mượt mà và trực quan.

🛠 Công nghệ sử dụng
Backend
Ngôn ngữ: Python.

Framework: Django & Django REST Framework (DRF).

Database: PostgreSQL.

Thư viện chính: django-cors-headers, psycopg2-binary.

Frontend
Thư viện chính: ReactJS.

Build Tool: Vite.

Styling: Tailwind CSS.

Kiến trúc: Component-based.

🚀 Hướng dẫn cài đặt
1. Thiết lập Backend
Di chuyển vào thư mục backend: cd backend.

Kích hoạt môi trường ảo: .\MoiTruongChuaThuVienBackEnd\Scripts\activate.

Cài đặt các thư viện: pip install -r requirements.txt (nếu có) hoặc cài đặt thủ công các gói cần thiết.

Khởi chạy server: python manage.py runserver.

2. Thiết lập Frontend
Di chuyển vào thư mục frontend: cd frontend.

Cài đặt các gói thư viện: npm install.

Chạy ứng dụng ở chế độ phát triển: npm run dev.

Truy cập giao diện tại: http://localhost:5173.

📌 Tính năng chính (Đang phát triển)
Quản lý hồ sơ cá nhân và tính toán các chỉ số sức khỏe.

Theo dõi lượng calo nạp vào qua nhật ký ăn uống.

Ghi chép và đánh giá hiệu quả quá trình tập luyện.

Tác giả: Huynh Hoàng
