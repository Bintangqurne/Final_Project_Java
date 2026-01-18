# Back-End Java (Spring Boot)

Backend REST API untuk aplikasi FinPro DB.

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Security (JWT)
- Spring Data JPA
- MySQL
- Midtrans Snap (payment)

## Requirements

- Java 17
- Maven
- MySQL Server

## Konfigurasi

Aplikasi menggunakan `src/main/resources/application.yml` dan environment variables.

Template konfigurasi yang disediakan di repo:

- `.env.example`
- `application.example.yml`

### Environment Variables

- `PORT`
  - Default: `8081`

- `DB_URL`
  - Contoh: `jdbc:mysql://localhost:3306/finpro_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

- `DB_USERNAME`
  - Contoh: `root`

- `DB_PASSWORD`

- `DDL_AUTO`
  - Default: `update`
  - Nilai umum: `update`, `validate`, `create`, `create-drop`

- `JWT_SECRET`
  - Wajib untuk production.

- `JWT_EXP_MINUTES`
  - Default: `1440`

- `MIDTRANS_SERVER_KEY`
  - Wajib jika fitur payment Midtrans digunakan.

- `MIDTRANS_PRODUCTION`
  - Default: `false`

- `APP_FRONTEND_BASE_URL`
  - Dipakai untuk callback URL Midtrans.
  - Default: `http://localhost:3000`

- `ADMIN_BOOTSTRAP_ENABLED`
  - Default: `false`
  - Jika `true`, aplikasi akan membuat akun admin saat startup jika belum ada.

- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

## Cara Menjalankan

1. Pastikan MySQL berjalan dan database bisa diakses.
2. Set environment variables yang diperlukan.
3. Jalankan:

```bash
mvn spring-boot:run
```

Server akan berjalan di:

- `http://localhost:8081` (atau sesuai `PORT`)

## Static Files (Uploads)

Aplikasi expose file upload melalui:

- `GET /uploads/**`

Sumber file dari folder lokal:

- `uploads/`

Catatan:

- Folder `uploads/` saat ini di-`gitignore` (tidak dipush). Jika kamu butuh contoh file di repo, hapus rule `uploads/` dari `.gitignore`.

## Authentication

Aplikasi memakai JWT.

- Header:
  - `Authorization: Bearer <token>`

Endpoint auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Response auth (`AuthResponse`):

- `token`
- `tokenType` (nilai: `Bearer`)
- `userId`
- `name`
- `username`
- `email`
- `role`

## Error Format

Beberapa error menggunakan format:

```json
{ "message": "..." }
```

Contoh kasus:

- Validasi request (`400`)
- `IllegalArgumentException` (`400`)
- Not found (`404`) untuk beberapa endpoint

## API Endpoints

Base URL: `http://localhost:8081`

### Auth

- `POST /api/auth/register`
  - Body:
    - `name` (string, required)
    - `username` (string, required, 3-30)
    - `email` (string, required)
    - `password` (string, required, 6-100)

- `POST /api/auth/login`
  - Body:
    - `identifier` (username atau email)
    - `password`

### User

- `GET /api/me` (auth)
- `PUT /api/me` (auth)
  - Body (opsional, field yang diisi akan diupdate):
    - `name`
    - `username`
    - `email`

### Products (Public)

- `GET /api/products`
  - Query:
    - `page` (default `0`)
    - `size` (default `10`)
    - `q` (optional)
    - `categoryId` (optional)

### Categories (Public)

- `GET /api/categories`
  - Query:
    - `page` (default `0`)
    - `size` (default `10`)

- `GET /api/categories/{id}`

### Cart (Auth)

- `GET /api/cart`
- `POST /api/cart/items`
  - Body:
    - `productId` (number, required)
    - `quantity` (number, required, min 1)

- `PATCH /api/cart/items/{cartItemId}`
  - Body:
    - `quantity` (number, required, min 1)

- `DELETE /api/cart/items/{cartItemId}`
- `DELETE /api/cart`

### Addresses (Auth)

- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/{addressId}`
- `DELETE /api/addresses/{addressId}`
- `POST /api/addresses/{addressId}/default`

### Orders (Auth)

- `POST /api/orders/checkout`
  - Body (opsional):
    - `addressId`
    - `shippingAddress`
    - `shippingPhone`

- `GET /api/orders`
- `GET /api/orders/{orderId}`
- `GET /api/orders/by-code/{orderCode}`
- `POST /api/orders/{orderId}/confirm-received`

### Payments

- `POST /api/payments/midtrans/snap/{orderId}` (auth)
  - Response: `SnapCreateResponse`
    - `paymentId`
    - `orderId`
    - `orderCode`
    - `snapToken`
    - `redirectUrl`

- `POST /api/payments/midtrans/notification` (public)

### Admin

Butuh role `ADMIN` untuk endpoint berikut (mengikuti konfigurasi Security):

- `GET /api/admin/orders`
- `GET /api/admin/orders/{orderId}`
- `POST /api/admin/orders/{orderId}/approve`
- `POST /api/admin/orders/{orderId}/reject`
- `POST /api/admin/orders/{orderId}/deliver`
- `POST /api/admin/orders/{orderId}/delivered`
- `GET /api/admin/summary`
- `GET /api/admin/users`

Category admin:

- `GET /api/admin/categories`
- `GET /api/admin/categories/{id}`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`
- `POST /api/admin/categories/{id}/image` (multipart: `file`)

Product admin:

Catatan:

- Saat ini endpoint `products` di bawah `/api/admin/products/**` dibuat `permitAll()` di `SecurityConfig` dan controller-nya juga `@PreAuthorize("permitAll()")`, jadi **tidak membutuhkan role ADMIN**.
- Jika ini tidak diinginkan, auth rules-nya perlu diperketat.

- `GET /api/admin/products`
- `GET /api/admin/products/{id}`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`
- `POST /api/admin/products/{id}/image` (multipart: `file`)

## Notes untuk GitHub

- Jangan commit file yang berisi secret.
- Pastikan `target/` tidak ikut ke GitHub.
