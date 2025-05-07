# Hướng dẫn triển khai ứng dụng Next.js Standalone

## Giới thiệu

Tài liệu này hướng dẫn cách triển khai ứng dụng Next.js sử dụng chế độ `output: "standalone"`. Chế độ này tạo ra một gói triển khai độc lập, không cần cài đặt lại các dependencies khi triển khai.

## Các bước triển khai

### 1. Build ứng dụng

```bash
pnpm run build
```

hoặc

```bash
next build
```

Lệnh này sẽ tạo ra thư mục `.next` chứa phiên bản standalone của ứng dụng.

### 2. Cấu trúc thư mục sau khi build

Sau khi build, thư mục `.next` sẽ có cấu trúc như sau:

```
.next/
├── cache/
├── server/
├── static/
└── standalone/
    ├── node_modules/
    ├── server.js
    └── package.json
```

### 3. Chạy ứng dụng standalone

Để chạy ứng dụng standalone, sử dụng lệnh:

```bash
pnpm run start:standalone
```

Hoặc trực tiếp:

```bash
node .next/standalone/server.js
```

### 4. Triển khai lên server

Khi triển khai lên server (như cPanel), bạn cần sao chép các thư mục và tệp sau:

1. Toàn bộ thư mục `.next/standalone`
2. Thư mục `.next/static` vào trong `.next/standalone/.next/static`
3. Thư mục `public` vào trong `.next/standalone/`

Cấu trúc thư mục trên server nên như sau:

```
your_deployment_folder/
├── .next/
│   └── static/
├── node_modules/
├── public/
├── server.js
└── package.json
```

### 5. Cấu hình môi trường

Đảm bảo tệp `.env` chứa các biến môi trường cần thiết đã được sao chép vào thư mục triển khai.

### 6. Khởi động ứng dụng trên server

```bash
node server.js
```

## Khắc phục sự cố

### Vấn đề mất CSS

Nếu ứng dụng bị mất CSS sau khi triển khai, hãy kiểm tra:

1. Thư mục `.next/static` đã được sao chép vào thư mục `.next/standalone/.next/static`
2. Thư mục `public` đã được sao chép vào thư mục `.next/standalone/`

### Lỗi khi chạy `npm start` hoặc `pnpm start`

Không sử dụng lệnh `npm start` hoặc `pnpm start` với cấu hình standalone. Thay vào đó, sử dụng `node server.js`.

## Lưu ý

- Không cần chạy `npm install` hoặc `pnpm install` khi triển khai phiên bản standalone
- Đảm bảo Node.js trên server có phiên bản tương thích với ứng dụng của bạn
