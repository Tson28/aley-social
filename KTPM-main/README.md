# Aley Social Media Platform

<p align="center">
  <img src="https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=ALEY" alt="Aley Logo" width="150" height="150">
</p>

> Nền tảng mạng xã hội thông minh với tích hợp AI - Xây dựng bởi Nhóm KTPM

---

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Nhóm Phát Triển](#nhóm-phát-triển)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Tính Năng](#tính-năng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [API Endpoints](#api-endpoints)
- [Cấu Hình Môi Trường](#cấu-hình-môi-trường)
- [Bảo Mật](#bảo-mật)
- [Đóng Góp](#đóng-góp)
- [License](#license)

---

## Giới Thiệu

**Aley Social Media** là nền tảng mạng xã hội hiện đại, được phát triển như một dự án học tập trong môn Công Nghệ Phần Mềm. Dự án tích hợp các tính năng cơ bản của mạng xã hội cùng với trí tuệ nhân tạo (AI) thông qua mô hình **Llama 3** của Meta AI, mang đến trải nghiệm người dùng thông minh và tương tác.

### Điểm Nổi Bật

- 🤖 **Tích hợp AI Llama 3** - Trợ lý ảo thông minh hỗ trợ người dùng
- 💬 **Nhắn tin real-time** - Giao tiếp tức thì với Socket.IO
- 📝 **Đăng bài & Chia sẻ** - Chia sẻ nội dung với cộng đồng
- 👥 **Kết bạn & Theo dõi** - Mở rộng mạng lưới xã hội
- 🔔 **Thông báo thông minh** - Cập nhật hoạt động liên tục
- 🎨 **Giao diện hiện đại** - Thiết kế responsive và thân thiện

---

## Nhóm Phát Triển

| Họ tên | Vai trò | Mô tả |
|--------|---------|-------|
| **Nguyễn Thái Sơn** | **Leader** | Quản lý dự án, kiến trúc hệ thống, điều phối team |
| Thành viên 1 | Frontend Developer | Phát triển giao diện Angular |
| Thành viên 2 | Backend Developer | Phát triển API và database |
| Thành viên 3 | Full-stack Developer | Tích hợp AI và tính năng real-time |
| Thành viên 4 | QA Engineer | Kiểm thử và đảm bảo chất lượng |

---

## Công Nghệ Sử Dụng

### Frontend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Angular | 19.x | Framework frontend chính |
| TypeScript | ~5.6 | Ngôn ngữ lập trình |
| RxJS | ^7.x | Thư viện reactive programming |
| Socket.IO Client | ^4.x | Real-time communication |
| ngx-toastr | ^19.x | Thông báo toast |
| Angular CLI | 19.x | Công cụ command line |

### Backend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | ^4.18 | Web framework |
| MongoDB | 6+ | Database NoSQL |
| Mongoose | ^8.2 | MongoDB ODM |
| Socket.IO | ^4.8 | Real-time engine |
| JWT | ^9.0 | Xác thực token |
| bcryptjs | ^2.4 | Mã hóa mật khẩu |
| Multer | ^1.4 | Xử lý upload file |
| Sharp | ^0.34 | Xử lý hình ảnh |

### AI Integration

| Dịch vụ | Mô hình | Mô tả |
|---------|---------|-------|
| Groq API | Llama 3.3-70B | API AI từ Groq |

---

## Tính Năng

### 🔐 Xác Thực & Tài Khoản
- Đăng ký tài khoản với xác thực email
- Đăng nhập/Đăng xuất an toàn
- Quên mật khẩu với đặt lại qua email
- Xác thực JWT với access token
- Bảo mật mật khẩu với bcrypt

### 👤 Hồ Sơ Người Dùng
- Tạo và chỉnh sửa hồ sơ cá nhân
- Upload avatar với xử lý hình ảnh
- Xem hồ sơ của người khác
- Cài đặt tài khoản cá nhân

### 👥 Mạng Xã Hội
- Gửi/yêu cầu kết bạn
- Chấp nhận/từ chối lời mời kết bạn
- Danh sách bạn bè
- Tìm kiếm người dùng
- Chặn người dùng

### 📝 Bài Đăng
- Tạo bài đăng với nội dung
- Like bài đăng
- Bình luận bài đăng
- Báo cáo bài đăng vi phạm
- Xóa bài đăng của mình

### 💬 Nhắn Tin
- Nhắn tin real-time với Socket.IO
- Hỗ trợ đa thiết bị (multi-tab)
- Lịch sử tin nhắn
- Giao tiếp 1-1

### 🔔 Thông Báo
- Thông báo kết bạn
- Thông báo tin nhắn mới
- Thông báo bài đăng mới
- Thông báo real-time

### 🤖 AI Assistant - Aley Ask
- Tích hợp Llama 3.3-70B
- Trả lời câu hỏi thông minh
- Hỗ trợ viết nội dung
- Gợi ý câu hỏi

### 💰 Gây Quỹ
- Tạo chiến dịch gây quỹ
- Ủng hộ chiến dịch
- Theo dõi tiến độ

### 🛡️ Quản Trị
- Dashboard quản trị
- Quản lý người dùng
- Quản lý báo cáo
- Thống kê hệ thống

---

## Cấu Trúc Dự Án

```
KTPM-main/
├── 📁 KTPM-main/                    # Thư mục gốc dự án (có thể trùng tên)
│   │
│   ├── 📁 src/                      # Frontend (Angular)
│   │   ├── 📁 app/
│   │   │   ├── 📁 auth/             # Module xác thực
│   │   │   │   ├── 📁 forgot-password/
│   │   │   │   ├── 📁 login/
│   │   │   │   ├── 📁 register/
│   │   │   │   ├── 📁 reset-password/
│   │   │   │   └── 📁 verify-email/
│   │   │   ├── 📁 core/            # Core services
│   │   │   │   └── 📁 services/
│   │   │   │       ├── llama.service.ts
│   │   │   │       └── socket.service.ts
│   │   │   ├── 📁 dashboard/        # Dashboard module
│   │   │   │   ├── 📁 pages/
│   │   │   │   │   ├── 📁 aley-ask/    # AI Chat page
│   │   │   │   │   ├── 📁 friends/
│   │   │   │   │   ├── 📁 home/
│   │   │   │   │   ├── 📁 search/
│   │   │   │   │   ├── 📁 settings/
│   │   │   │   │   └── 📁 user-profile/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.module.ts
│   │   │   ├── 📁 interceptors/    # HTTP interceptors
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── 📁 guards/          # Route guards
│   │   │   ├── 📁 models/          # Data models
│   │   │   └── 📁 services/        # Services
│   │   ├── 📁 assets/              # Static assets
│   │   └── 📁 environments/       # Environment configs
│   │
│   ├── 📁 backend/                 # Backend (Node.js)
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/     # Business logic
│   │   │   ├── 📁 models/          # Mongoose models
│   │   │   ├── 📁 routes/          # API routes
│   │   │   │   ├── admin.routes.js
│   │   │   │   ├── ai.routes.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── block.routes.js
│   │   │   │   ├── friends.routes.js
│   │   │   │   ├── fundraising.routes.js
│   │   │   │   ├── messages.routes.js
│   │   │   │   ├── notifications.routes.js
│   │   │   │   ├── posts.routes.js
│   │   │   │   ├── profile.routes.js
│   │   │   │   ├── reports.routes.js
│   │   │   │   ├── search.routes.js
│   │   │   │   └── user-reports.routes.js
│   │   │   ├── 📁 middleware/      # Custom middleware
│   │   │   └── server.js           # Entry point
│   │   ├── 📁 uploads/             # Uploaded files
│   │   ├── .env                    # Environment variables
│   │   └── package.json
│   │
│   ├── 📁 ADMIN/                   # Admin dashboard (static)
│   │
│   └── 📁 Ask_AI.py               # Python AI service (FastAPI)
│
├── 📁 node_modules/                # Dependencies
├── package-lock.json              # NPM lock file
└── README.md                      # This file
```

---

## Yêu Cầu Hệ Thống

### Phần cứng tối thiểu

| Thành phần | Yêu cầu |
|------------|---------|
| CPU | Intel Core i3 / AMD Ryzen 3 |
| RAM | 4 GB |
| Ổ cứng | 2 GB trống |
| Mạng | Kết nối Internet ổn định |

### Phần mềm

| Phần mềm | Phiên bản tối thiểu |
|----------|---------------------|
| Node.js | 18.x LTS |
| npm | 9.x |
| MongoDB | 6.0 |
| Python | 3.10+ (cho AI service) |
| Angular CLI | 19.x |

---

## Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd KTPM-main
```

### 2. Cài Đặt Backend Dependencies

```bash
cd backend
npm install
```

### 3. Cài Đặt Frontend Dependencies

```bash
cd ../src
npm install
```

### 4. Cài Đặt Python Dependencies (cho AI Service)

```bash
cd ..
pip install fastapi uvicorn groq pydantic
```

### 5. Cấu Hình Environment

Tạo file `.env` trong thư mục `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/aley_social_media

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Groq API (AI)
GROQ_API_KEY=your-groq-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

---

## Chạy Ứng Dụng

### Chế độ Development

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Server:**

```bash
cd src
ng serve
```

**Terminal 3 - AI Service (Optional):**

```bash
python Ask_AI.py
```

### Truy Cập Ứng Dụng

| Dịch vụ | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5000/api |
| Admin Dashboard | http://localhost:5000/admin |
| AI Service | http://localhost:8000 (nếu chạy riêng) |
| Health Check | http://localhost:5000/api/health |

### Chế độ Production

**Build Frontend:**

```bash
cd src
ng build --configuration=production
```

**Start Backend:**

```bash
cd backend
npm start
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/register` | Đăng ký tài khoản mới |
| POST | `/login` | Đăng nhập |
| POST | `/logout` | Đăng xuất |
| GET | `/verify-email/:token` | Xác thực email |
| POST | `/forgot-password` | Yêu cầu đặt lại mật khẩu |
| POST | `/reset-password/:token` | Đặt lại mật khẩu |
| POST | `/refresh-token` | Làm mới token |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy thông tin profile hiện tại |
| PUT | `/` | Cập nhật profile |
| PUT | `/avatar` | Cập nhật avatar |
| GET | `/:userId` | Lấy profile của user khác |

### Friends Routes (`/api/friends`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách bạn bè |
| POST | `/request/:userId` | Gửi yêu cầu kết bạn |
| PUT | `/accept/:requestId` | Chấp nhận yêu cầu |
| PUT | `/reject/:requestId` | Từ chối yêu cầu |
| DELETE | `/:friendId` | Xóa bạn bè |

### Posts Routes (`/api/posts`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách bài đăng |
| POST | `/` | Tạo bài đăng mới |
| GET | `/:postId` | Lấy chi tiết bài đăng |
| PUT | `/:postId` | Cập nhật bài đăng |
| DELETE | `/:postId` | Xóa bài đăng |
| POST | `/:postId/like` | Like bài đăng |
| DELETE | `/:postId/like` | Unlike bài đăng |
| POST | `/:postId/comment` | Bình luận bài đăng |

### Messages Routes (`/api/messages`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/conversations` | Lấy danh sách cuộc trò chuyện |
| GET | `/:userId` | Lấy tin nhắn với user |
| POST | `/:userId` | Gửi tin nhắn |

### Search Routes (`/api/search`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/?q=query` | Tìm kiếm người dùng/bài đăng |

### AI Routes (`/api/ai`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/chat` | Chat với Llama 3 |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/stats` | Thống kê hệ thống |
| GET | `/users` | Danh sách người dùng |
| DELETE | `/users/:userId` | Xóa người dùng |
| GET | `/reports` | Danh sách báo cáo |
| PUT | `/reports/:reportId` | Xử lý báo cáo |

---

## Cấu Hình Môi Trường

### Biến Môi Trường Backend

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `PORT` | Cổng server | `5000` |
| `NODE_ENV` | Môi trường | `development` / `production` |
| `MONGODB_URI` | Connection string MongoDB | `mongodb://localhost:27017/aley` |
| `JWT_SECRET` | Secret key cho JWT | `your-secret-key` |
| `JWT_EXPIRES_IN` | Thời gian hết hạn JWT | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email gửi | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | App password | `xxxx xxxx xxxx xxxx` |
| `GROQ_API_KEY` | API key Groq | `gsk_...` |

---

## Bảo Mật

Dự án được triển khai với các biện pháp bảo mật sau:

### Xác Thực & Ủy Quyền

- ✅ JWT (JSON Web Token) cho xác thực
- ✅ Bcrypt mã hóa mật khẩu (salt rounds: 10)
- ✅ HTTP Interceptor cho auto-attach token
- ✅ Auth Guard bảo vệ routes
- ✅ Token expiration

### Bảo Mật API

- ✅ CORS configuration
- ✅ Rate limiting (có thể thêm)
- ✅ Input validation với express-validator
- ✅ XSS protection
- ✅ Helmet.js (khuyến nghị thêm)

### Bảo Mật Dữ Liệu

- ✅ Không lưu mật khẩu plain text
- ✅ HTTPS recommended cho production
- ✅ Environment variables cho secrets
- ✅ File upload validation

### Khuyến Nghị Bổ Sung

```bash
# Thêm helmet cho bảo mật HTTP headers
npm install helmet

# Thêm rate limiting
npm install express-rate-limit
```

---

## Socket.IO Events

### Client → Server

| Event | Payload | Mô tả |
|-------|---------|-------|
| `authenticate` | `{ userId }` | Xác thực socket connection |
| `sendMessage` | `{ recipientId, message }` | Gửi tin nhắn |
| `sendNotification` | `{ recipientId, notification }` | Gửi thông báo |
| `ping` | `{ timestamp }` | Heartbeat |

### Server → Client

| Event | Payload | Mô tả |
|-------|---------|-------|
| `receiveMessage` | `{ message }` | Nhận tin nhắn |
| `receiveNotification` | `{ notification }` | Nhận thông báo |
| `pong` | `{ timestamp }` | Heartbeat response |
| `messageSent` | `{ success }` | Xác nhận gửi tin nhắn |

---

## Đóng Góp

Chúng tôi chào đón sự đóng góp từ cộng đồng!

### Quy Trình Đóng Góp

1. **Fork** repository này
2. Tạo **branch** mới cho tính năng của bạn
3. **Commit** các thay đổi
4. **Push** lên branch của bạn
5. Tạo **Pull Request**

### Hướng Dẫn

- Tuân thủ code style của dự án
- Viết commit message rõ ràng
- Thêm unit tests nếu có thể
- Cập nhật documentation nếu cần

---

## Giấy Phép

Dự án này được phát triển cho mục đích học tập trong môn **Công Nghệ Phần Mềm**.

© 2026 - Nhóm KTPM - Đại học [Tên trường]

---

## Liên Hệ

| Thông tin | Chi tiết |
|-----------|----------|
| **Leader** | Nguyễn Thái Sơn |
| **Email** | [email@example.com] |
| **GitHub** | [github.com/yourusername] |

---

<div align="center">
  <p>Made with ❤️ by <strong>Nhóm KTPM</strong></p>
  <p>Leader: <strong>Nguyễn Thái Sơn</strong></p>
  <p>© 2026 - Aley Social Media Platform</p>
</div>
