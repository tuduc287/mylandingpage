# 📈 Nền Tảng Phân Tích Dữ Liệu FireAnt VIP Q2/2026

Dự án này là một ứng dụng full-stack (gồm cả frontend React và backend Express/Node.js) giúp nhà đầu tư phân tích kỹ thuật chứng khoán thời gian thực, quét chỉ báo kĩ thuật, biểu đồ đường giá và gửi yêu cầu tư vấn VIP (Lead Management).

---

## 🛑 Tại sao mở file `index.html` trực tiếp bị trắng trơn?

Ứng dụng được viết bằng **React (React 19)**, **Vite**, **TypeScript**, **Tailwind CSS**, và **Express (Node.js)**. Do đó:
* Trình duyệt không thể đọc trực tiếp các file TypeScript/JSX (`.ts`, `.tsx`) mà không qua bộ biên dịch của Vite.
* Bạn **không thể chạy** bằng cách nhấp đúp trực tiếp vào file `index.html` hoặc dùng các tiện ích mở file tĩnh truyền thống (như Live Server của VS Code trên file `index.html`).
* Bạn **phải cài đặt Node.js** và chạy máy chủ (Development Server) để biên dịch dự án.

---

## 🚀 Hướng Dẫn Chạy Dự Án Trên Máy Tính Của Bạn

Để chạy ứng dụng trên máy của bạn một cách mượt mà nhất, hãy làm theo các bước đơn giản dưới đây:

### Bước 1: Cài đặt Node.js (Nếu chưa có)
* Tải xuống và cài đặt phiên bản Node.js phù hợp (khuyến nghị phiên bản **v18 trở lên** hoặc bản **LTS - Long Term Support**) tại trang chủ: [https://nodejs.org](https://nodejs.org).
* Nhập lệnh sau vào Terminal (hoặc Command Prompt) để kiểm tra xem đã cài đặt thành công chưa:
  ```bash
  node -v
  npm -v
  ```

### Bước 2: Giải nén mã nguồn
* Giải nén thư mục dự án đã tải về máy của bạn.
* Mở thư mục này bằng trình biên soạn mã nguồn (khuyến nghị dùng **Visual Studio Code**).

### Bước 3: Cài đặt các thư viện liên quan (Dependencies)
Mở cửa sổ Terminal trong Visual Studio Code (hoặc Terminal của máy tính và trỏ đường dẫn đến thư mục dự án), sau đó chạy lệnh cài đặt:
```bash
npm install
```
*Lưu ý: Lệnh này sẽ tự động tải toàn bộ các gói thư viện được định nghĩa trong file `package.json` về thư mục `node_modules` nội bộ.*

### Bước 4: Tạo cấu hình môi trường (Không bắt buộc)
Để sử dụng tính năng phân tích bằng trí tuệ nhân tạo Gemini AI thực tế từ Google, hãy tạo một file mang tên `.env` ở thư mục gốc của dự án (hoặc sao chép từ file `.env.example`) và phân bổ API Key của bạn:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Nếu bạn không thiết lập API Key này, hệ thống sẽ tự động kích hoạt chế độ **Offline Tech Analysis Fallback** mô phỏng để giúp trải nghiệm phần mềm không bị gián đoạn).*

### Bước 5: Chạy ứng dụng ở chế độ Phát triển (Development)
Sau khi đã cài đặt xong các thư viện ở Bước 3, hãy chạy lệnh khởi động máy chủ:
```bash
npm run dev
```

* Ứng dụng sẽ biên dịch cực nhanh và khởi chạy máy chủ tích hợp tại địa chỉ: **`http://localhost:3000`**
* Hãy mở trình duyệt lên và truy cập đường dẫn trên để trải nghiệm ứng dụng với đầy đủ tính năng đồng bộ dữ liệu, biểu đồ kỹ thuật tự động 30 phiên và form đăng ký!

---

## 📦 Bản dựng Chạy Sản xuất (Production)

Trong trường hợp bạn muốn gom gọn toàn bộ mã nguồn và tối ưu hóa tốc độ tải trang cao nhất, hãy dùng các lệnh sau:

1. **Biên dịch tối ưu hóa:**
   ```bash
   npm run build
   ```
   *(Lệnh này sẽ biên dịch React sang tĩnh trong thư mục `dist/` và đóng gói server thành file `dist/server.cjs` cực kỳ nhẹ nhàng)*.

2. **Chạy bản dựng chính thức:**
   ```bash
   npm run start
   ```
   *Ứng dụng của bạn hiện tại đã ở trạng thái tối ưu nhất và chạy ổn định tại cổng mạng `3000`!*

---

## 🐙 Hướng Dẫn Upload Lên GitHub Thủ Công

Bạn có thể up mã nguồn lên GitHub theo **2 cách**: Sử dụng dòng lệnh Git **hoặc** thực hiện trực tiếp trên Web trình duyệt **không cần cài đặt bất kỳ phần mềm nào (không cần Git-SCM)**.

---

### CÁCH 1: Tải lên trực tiếp qua Web (Dành cho ai KHÔNG muốn cài đặt Git-SCM)

Đây là cách đơn giản nhất, thực hiện hoàn toàn trên trình duyệt trình duyệt web của bạn:

1. **Chuẩn bị file nén:** 
   * Trên máy tính của bạn, hãy nén thư mục dự án chứa mã nguồn này lại thành file `.zip`.
2. **Tạo Repository trên GitHub:**
   * Truy cập [https://github.com](https://github.com) và đăng nhập tài khoản.
   * Click vào nút màu xanh **New** để tạo kho chứa mới.
   * Đặt tên (ví dụ: `fireant-analysis-vip`) rồi chọn **Create repository** (giữ nguyên không tích bất kì tùy chọn khởi tạo nào khác).
3. **Kéo thả để tải lên:**
   * Ngay sau khi tạo xong, ở trang cấu hình trống đầu tiên, bạn hãy nhìn dòng chữ nhỏ ở dưới:
     > *"Get-started by creating a new file or **uploading an existing file**."*
   * Hãy nhấp chuột vào chữ **uploading an existing file**.
   * Tiếp theo, kéo toàn bộ các thư mục và file cấu hình chính (khoảng vài chục file nhỏ như `src`, `package.json`, `.gitignore`, `README.md`, v.v... từ thư mục đã giải nén trên máy của bạn) và thả thẳng vào khung hiển thị trên trình duyệt.
   * *⚠️ Lưu ý cực kỳ quan trọng: **KHÔNG kéo thư mục `node_modules`** lên web vì nó chứa hàng chục nghìn file rác nặng nề. Bạn chỉ cần kéo các file gốc của dự án.*
4. **Xác nhận:**
   * Sau khi tài liệu đã tải lên đầy đủ, kéo xuống cuối cùng và bấm nút màu xanh **Commit changes**.
   * Vậy là hoàn tất tải lên mà hoàn toàn không cần cài đặt phần mềm bên thứ ba!

---

### CÁCH 2: Dùng dòng lệnh (Nếu bạn đã cài sẵn Git trên máy tính)

### Bước 1: Cài đặt Git trên máy tính
* Kiểm tra xem máy đã cài Git chưa: `git --version`.
* Nếu chưa có, tải và cài đặt tại đây: [https://git-scm.com](https://git-scm.com).

### Bước 2: Tạo Repo trống trên GitHub
1. Truy cập [https://github.com](https://github.com) và đăng nhập tài khoản.
2. Click vào nút **New** (hoặc dấu cộng góc trên cùng bên phải -> **New repository**).
3. Đặt tên Kho chứa (ví dụ: `fireant-analysis-vip`).
4. **Không** chọn tích bất kì tùy chọn nào như *Add a README file*, *Add .gitignore*, *Choose a license* (vì dự án của bạn đã có sẵn các file này).
5. Nhấn **Create repository**.
6. Sao chép đường dẫn Git URL của repo đó (có dạng: `https://github.com/ten-tai-khoan/ten-repo.git`).

### Bước 3: Chạy các lệnh Git tại thư mục dự án
Mở Terminal trên máy của bạn (tại đúng thư mục mã nguồn vừa giải nén) và chạy tuần tự các lệnh sau:

```bash
# 1. Khởi tạo Git cục bộ máy tính
git init

# 2. Thêm toàn bộ các file vào khu vực chuẩn bị (Staging area)
# (.gitignore đã có sẵn để loại bỏ thư mục nặng node_modules và build đè)
git add .

# 3. Tạo một bản commit đầu tiên
git commit -m "initial commit: Nền Tảng Phân Tích FireAnt VIP"

# 4. Tạo nhánh mặc định là main
git branch -M main

# 5. Liên kết kho chứa cục bộ này với Repo trống vừa tạo trên GitHub
# Thay thế URL bên dưới bằng URL thực tế bạn vừa copy ở Bước 2
git remote add origin https://github.com/ten-tai-khoan/ten-repo.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

Hãy làm mới (Refresh) lại trang GitHub của bạn, toàn bộ source code đã được tải lên an toàn tuyệt đối!

---

## 🚫 LÝ DO KHI XEM TRÊN GITHUB (HOẶC GITHUB PAGES) BỊ TRẮNG TRƠN & CÁCH GIẢI QUYẾT

Khi bạn upload toàn bộ mã nguồn lên GitHub thành công nhưng khi mở hoặc bật tính năng **GitHub Pages** lại chỉ thấy trang trắng tinh (blank screen), đây là hiện tượng hoàn toàn bình thường do các nguyên nhân kỹ thuật sau:

### 1. Tại sao bị trắng trơn?
* **Lý do 1: Bản chất là Mã nguồn thô (Raw Source Code):** Mã nguồn bạn vừa tải lên GitHub là mã nguồn thô dành cho lập trình viên (viết bằng React, TypeScript, các file đuôi `.tsx`). Trình duyệt web thông thường **hoàn toàn không hiểu** được các đoạn code React này nếu chưa được build (biên dịch) sang HTML/CSS/JS thuần túy.
* **Lý do 2: Bản chất của GitHub Pages:** GitHub Pages chỉ hỗ trợ hosting static website (web tĩnh chỉ có HTML, CSS, JS thuần). Nó không có máy chủ để biên dịch React cho bạn, và cũng không thể chạy được backend Node.js (`server.ts`).
* **Lý do 3: Lỗi đường dẫn tương đối (Path Error):** Nếu bạn bấm trực tiếp vào file `index.html` trong mã nguồn, trình duyệt sẽ báo lỗi `Failed to load module script` vì không tìm thấy tập tin `/src/main.tsx` biên dịch.

---

### 2. Cách giải quyết để hiển thị trang web lên mạng (Online) cực nhanh

Vì dự án phân tích này là một nền tảng sử dụng một máy chủ backend nhỏ (Node.js/Express) để xử lý Form đăng ký lead và gọi API Gemini một cách an toàn nhất, bạn nên deploy (triển khai) lên các dịch vụ Cloud miễn phí hỗ trợ Web Full-Stack thay vì GitHub Pages.

#### 👉 Cách 2.1: Triển khai lên Render.com (Khuyên dùng - Hoàn toàn Miễn phí & Cực dễ)
Render là nền tảng máy chủ hỗ trợ chạy cực tốt cả Frontend React và Backend Node.js từ kho GitHub của bạn.

> 💡 **Cập nhật khắc phục lỗi build:** Lỗi `"Exited with status 1 while building your code"` xảy ra là do file cấu hình `package.json` trước đó thiếu hai gói thư viện biên dịch là `esbuild` và `tsx` ở môi trường production của Render.
> 
> **Chúng tôi đã cài đặt bổ sung đầy đủ các gói này trực tiếp vào `package.json` của bạn.** Khi bạn tải hoặc cập nhật lại code lên GitHub/Render, sự cố này sẽ được khắc phục 100%!

1. Truy cập [https://render.com](https://render.com) và đăng ký/nhập bằng tài khoản **GitHub** của bạn.
2. Tại màn hình Dashboard, bấm nút **New +** -> Chọn **Web Service**.
3. Chọn repo GitHub chứa dự án bạn vừa upload lên (`fireant-analysis-vip`).
4. Điền các thông số cấu hình siêu đơn giản sau:
   * **Name:** `fireant-vip-analysis` (hoặc tên tùy thích)
   * **Language / Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start`
5. Nhấn **Create Web Service**. 
6. Đợi khoảng 2-3 phút để Render tự động tải thư viện, biên dịch React và chạy Server Node.js. Khi hoàn tất, Render sẽ cấp cho bạn một đường dẫn URL chứa web thực tế (`https://ten-du-an.onrender.com`) chạy online mượt mà!

#### 👉 Cách 2.2: Chỉ triển khai Frontend (giao diện) lên Vercel / Netlify
Nếu bạn chỉ muốn upload phần giao diện (Frontend) lên để đối tác/khách hàng xem nhanh trước trực tiếp mà không cần backend xử lý lưu trữ database:
1. Đăng nhập [https://vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Nhấn **Add New** -> Chọn **Project**.
3. Import repository dự án của bạn từ danh sách.
4. Ở phần Framework Preset, Vercel sẽ tự động phát hiện dự án sử dụng **Vite**. Hãy giữ nguyên tất cả cấu hình mặc định.
5. Nhấp **Deploy** và trang web của bạn sẽ hoạt động trực tiếp sau 30 giây!

