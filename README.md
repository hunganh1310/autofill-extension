# HƯỚNG DẪN SỬ DỤNG - Auto-fill Tìm hiểu Pháp luật kỳ 20251

## Bước 0: Tải mã nguồn từ GitHub

### Cách A: Dùng Git (khuyến nghị)
1. Cài Git (nếu chưa có): https://git-scm.com/downloads
2. Mở Command Prompt (cmd) và chạy:
   ```cmd
   git clone https://github.com/hunganh1310/autofill-extension
   cd autofill-extension
   ```

### Cách B: Tải ZIP và giải nén
1. Trên trang GitHub của dự án, bấm nút “Code” → “Download ZIP”
2. Giải nén file ZIP vừa tải về
3. Mở thư mục dự án đã giải nén

## Bước 1: Cài đặt Extension

### Trên Chrome/Edge/Brave:
1. Mở trình duyệt và vào `chrome://extensions/` (hoặc `edge://extensions/`, `brave://extensions/`)
2. Bật **"Developer mode"** (Chế độ nhà phát triển) ở góc trên bên phải
3. Click **"Load unpacked"** (Tải tiện ích đã giải nén)
4. Chọn thư mục `autofill extension` vừa giải nén hoặc clone về
5. Extension xuất hiện trong danh sách!

### Trên Firefox:
1. Vào `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Chọn file `manifest.json` trong thư mục extension
4. Extension được tải!

---

## Bước 2: Sử dụng Extension

### Cách 1: TỰ ĐỘNG điền khi load trang (ĐỀ XUẤT)
1. Mở link Microsoft Forms khảo sát:
   ```
   https://forms.office.com/pages/responsepage.aspx?id=...
   ```
2. **Đợi 3 giây** - Extension sẽ TỰ ĐỘNG điền luôn!
3. Thấy thông báo màu xanh: "Đã điền X/Y câu trả lời"
4. Kiểm tra lại và **Submit**!

### Cách 2: Điền thủ công qua Popup
1. Mở link Microsoft Forms
2. Click vào **icon extension** trên thanh toolbar
3. Click nút **"Điền form ngay"**
4. Đợi extension điền
5. Hoàn thành!

