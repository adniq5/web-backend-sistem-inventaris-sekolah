# Sistem Inventaris Sekolah API

## Deskripsi dan Tujuan

Sistem Inventaris Sekolah API merupakan backend REST API yang dikembangkan untuk mengelola data pengguna, kategori, barang, peminjaman, pengembalian, activity log, serta callback aktivitas eksternal.

Proyek ini bertujuan menyediakan layanan backend terautentikasi untuk membantu proses pencatatan dan pengelolaan inventaris sekolah. Sistem juga mendukung alur peminjaman dan pengembalian barang yang melibatkan verifikasi oleh admin agar perubahan data dan stok inventaris dapat dikelola dengan baik.

## Teknologi yang Digunakan

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv

## Instalasi

### Prasyarat

Pastikan perangkat telah memiliki:

- Node.js versi 18 atau lebih baru.
- MongoDB yang dapat diakses oleh aplikasi.
- Git untuk mengunduh repository.

### Langkah Instalasi

1. Clone repository:

   ```bash
   git clone https://github.com/adniq5/web-backend-sistem-inventaris-sekolah.git
   ```

2. Masuk ke direktori proyek:

   ```bash
   cd web-backend-sistem-inventaris-sekolah
   ```

3. Instal dependency:

   ```bash
   npm ci
   ```

4. Salin file `.env.example` menjadi `.env`.

5. Sesuaikan nilai konfigurasi environment pada file `.env` dengan lingkungan lokal.

   **Catatan:** Jangan mengunggah file `.env` ke repository atau membagikan nilai rahasia yang terdapat di dalamnya.

## Konfigurasi Environment

Berikut contoh konfigurasi environment yang digunakan:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=ganti_dengan_rahasia_jwt
JWT_EXPIRES_IN=1d
EXTERNAL_API_KEY=ganti_dengan_api_key_eksternal
NODE_ENV=development
```

Keterangan:

- `PORT`: Port yang digunakan oleh server.
- `MONGODB_URI`: Alamat koneksi MongoDB. Aplikasi menggunakan database `school_inventory`.
- `JWT_SECRET`: Secret key untuk proses autentikasi JWT.
- `JWT_EXPIRES_IN`: Masa berlaku token JWT.
- `EXTERNAL_API_KEY`: API key untuk melindungi endpoint callback eksternal.
- `NODE_ENV`: Menentukan environment aplikasi.

## Menjalankan Server

### Mode Normal

```bash
npm start
```

### Mode Development

```bash
npm run dev
```

Setelah server berjalan, API dapat diakses melalui:

```text
http://localhost:3000
```

Port dapat disesuaikan melalui konfigurasi `PORT` pada file `.env`.

### Dokumentasi Swagger

Setelah server berjalan, buka dokumentasi API interaktif pada:

```text
http://localhost:3000/api-docs
```

Gunakan tombol **Authorize** untuk memasukkan:

- Bearer JWT pada endpoint yang dilindungi autentikasi.
- API Key pada header `x-api-key` untuk callback eksternal.

## Role Pengguna

Sistem memiliki dua role pengguna dengan hak akses yang berbeda:

### 1. User

Pengguna dengan role `user` memiliki akses untuk:

- Melakukan login dan melihat profil.
- Membuat pengajuan peminjaman barang.
- Melihat data peminjaman miliknya.
- Mengajukan pengembalian barang.
- Melihat riwayat pengembalian miliknya.

### 2. Admin

Pengguna dengan role `admin` memiliki akses untuk:

- Mengelola kategori barang.
- Mengelola data barang.
- Melihat seluruh data peminjaman.
- Menyetujui atau menolak pengajuan peminjaman.
- Melihat seluruh data pengembalian.
- Memverifikasi pengembalian barang.
- Melihat activity logs.

## Dokumentasi Endpoint API

Endpoint yang membutuhkan autentikasi menggunakan JWT melalui HTTP header berikut:

```http
Authorization: Bearer JWT_TOKEN
```

### 1. Auth

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/auth/register` | Publik |
| POST | `/api/auth/login` | Publik |
| GET | `/api/auth/me` | User/Admin |

### 2. Categories

Seluruh endpoint kategori membutuhkan autentikasi JWT dengan role `admin`.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/categories` | Membuat kategori |
| GET | `/api/categories` | Melihat kategori aktif |
| GET | `/api/categories/:id` | Melihat detail kategori |
| PATCH | `/api/categories/:id` | Memperbarui kategori |
| DELETE | `/api/categories/:id` | Mengarsipkan kategori |

### 3. Items

Seluruh endpoint barang membutuhkan autentikasi JWT dengan role `admin`.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/items` | Membuat barang |
| GET | `/api/items` | Melihat barang aktif dengan filter dan pagination |
| GET | `/api/items/:id` | Melihat detail barang |
| PATCH | `/api/items/:id` | Memperbarui barang |
| DELETE | `/api/items/:id` | Mengarsipkan barang |

### 4. Loans

Seluruh endpoint peminjaman membutuhkan autentikasi JWT.

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/loans` | User membuat pengajuan |
| GET | `/api/loans` | User melihat miliknya; admin melihat semua |
| GET | `/api/loans/my` | User melihat riwayat peminjaman miliknya |
| GET | `/api/loans/:id` | User melihat miliknya; admin dapat melihat semua |
| PATCH | `/api/loans/:id/approve` | Admin |
| PATCH | `/api/loans/:id/reject` | Admin |
| PATCH | `/api/loans/:id/borrow` | Admin mengubah approved menjadi borrowed |
| PATCH | `/api/loans/:id/mark-overdue` | Admin menandai borrowed sebagai overdue |

### 5. Returns

Seluruh endpoint pengembalian membutuhkan autentikasi JWT.

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/returns` | User mengajukan pengembalian atas peminjaman miliknya |
| GET | `/api/returns/my` | User melihat riwayat pengembaliannya |
| GET | `/api/returns` | Admin melihat seluruh pengembalian |
| GET | `/api/returns/:id` | User melihat miliknya; admin dapat melihat semua |
| PATCH | `/api/returns/:id/verify` | Admin memverifikasi pengembalian |

**Alur Pengembalian Barang:**

1. User mengajukan pengembalian barang melalui endpoint `POST /api/returns`.
2. Pengajuan pengembalian disimpan dengan status `pending`.
3. Stok barang belum bertambah selama pengajuan belum diverifikasi.
4. Admin memeriksa pengajuan dan melakukan verifikasi.
5. Setelah berhasil diverifikasi, status Return berubah menjadi `verified`, status Loan menjadi `returned`, dan stok barang bertambah sesuai jumlah pengembalian.

### 6. Activity Logs

Endpoint Activity Logs membutuhkan autentikasi JWT dengan role `admin`.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/activity-logs` | Melihat daftar aktivitas |
 
Contoh penggunaan filter:

```http
GET /api/activity-logs?action=login&actor=USER_ID&source=internal&startDate=2026-11-01&endDate=2026-11-30&page=1&limit=20
```

Activity Logs digunakan untuk mencatat aktivitas yang terjadi di dalam sistem, antara lain:

- Login pengguna.
- Pembuatan kategori dan barang.
- Pengajuan peminjaman.
- Persetujuan atau penolakan peminjaman.
- Proses pengembalian barang.

Data aktivitas disimpan dalam collection `activity_logs`.

### 7. External Callback

Endpoint External Callback digunakan untuk menerima aktivitas dari sistem eksternal.

Endpoint ini tidak menggunakan JWT, tetapi wajib menyertakan API key melalui header `x-api-key`.

**Endpoint:**

```http
POST /api/external/activity
```

**Header:**

```http
x-api-key: EXTERNAL_API_KEY
Content-Type: application/json
```

**Contoh Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "activityType": "external_login",
  "description": "Aktivitas dari sistem eksternal"
}
```

Callback yang berhasil diterima akan dicatat dalam collection `activity_logs` dengan nilai `source: "external"`.

## Seed Data

Proyek menyediakan seed data untuk mengisi data awal inventaris.

Jalankan perintah berikut:

```bash
npm run seed:inventory
```

Proses seed bersifat idempotent, yaitu data yang sudah tersedia tidak dihapus atau digandakan ketika proses dijalankan kembali.

Seed menggunakan user admin yang tersedia sebagai nilai `created_by` dan `updated_by`. Oleh karena itu, database harus memiliki minimal satu user admin sebelum proses seed dijalankan.

Data minimum yang diverifikasi:

- 4 kategori aktif.
- Setiap kategori memiliki minimal 5 barang.
- Setiap barang memiliki relasi kategori yang valid.

## Pengujian API dengan Postman

Pengujian API dilakukan menggunakan Postman untuk memastikan setiap endpoint dapat berjalan sesuai fungsi dan hak aksesnya.

Berikut tahapan pengujian utama:

1. Melakukan login melalui `POST /api/auth/login` untuk memperoleh JWT user atau admin.
2. Menggunakan JWT pada header `Authorization` untuk mengakses endpoint yang membutuhkan autentikasi.
3. Membuat pengajuan peminjaman melalui `POST /api/loans`.
4. Admin menyetujui pengajuan melalui `PATCH /api/loans/:id/approve`.
5. User mengajukan pengembalian melalui `POST /api/returns`.
6. Admin melihat daftar pengembalian melalui `GET /api/returns`.
7. Admin memverifikasi pengembalian melalui `PATCH /api/returns/:id/verify`.
8. Memeriksa catatan aktivitas melalui `GET /api/activity-logs`.
9. Menguji callback eksternal melalui `POST /api/external/activity` dengan header `x-api-key`.
10. Melakukan pengujian negatif, seperti akses tanpa JWT, role yang tidak sesuai, API key tidak valid, ID tidak valid, dan payload tidak lengkap.

### Contoh Request Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password_minimal_8"
}
```

## Catatan Implementasi

- API menggunakan autentikasi JWT untuk endpoint yang membutuhkan akses pengguna.
- Hak akses dibedakan berdasarkan role `user` dan `admin`.
- Validasi input diterapkan untuk membantu menjaga konsistensi data.
- Validasi input menggunakan middleware `express-validator` beserta aturan pada validator proyek.
- Penghapusan kategori dan barang dilakukan melalui mekanisme arsip (*soft delete*).
- Pengembalian barang harus diverifikasi oleh admin sebelum stok inventaris diperbarui.
- Aktivitas pengguna dan callback eksternal dicatat dalam collection `activity_logs`.
- Pengujian API dilakukan menggunakan Postman melalui pengujian endpoint berhasil maupun skenario negatif.