# Sistem Inventaris Sekolah API

## Deskripsi dan tujuan

Backend REST API untuk mengelola pengguna, kategori, barang, peminjaman, pengembalian, activity log, dan callback aktivitas eksternal. Proyek ini bertujuan menyediakan backend terautentikasi untuk pencatatan inventaris sekolah dan alur peminjaman/pengembalian yang dapat diverifikasi admin.

## Teknologi

- Node.js
- Express 5
- MongoDB dan Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv

## Instalasi

Prasyarat:

- Node.js 18 atau lebih baru
- MongoDB yang dapat diakses aplikasi

Instal dependency:

```bash
npm install
# Untuk instalasi reproducible berdasarkan package-lock.json:
npm ci
```

Salin `.env.example` menjadi `.env`, lalu isi nilainya pada environment lokal. Jangan commit `.env` atau membagikan nilai rahasia.

## Konfigurasi environment

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=ganti_dengan_rahasia_jwt
JWT_EXPIRES_IN=1d
EXTERNAL_API_KEY=ganti_dengan_api_key_eksternal
NODE_ENV=development
```

`MONGODB_URI` digunakan dengan database `school_inventory`. `JWT_SECRET` diperlukan untuk register/login. `EXTERNAL_API_KEY` diperlukan oleh endpoint callback eksternal.

## Menjalankan server

Mode normal:

```bash
npm start
```

Mode development:

```bash
npm run dev
```

Server tersedia di `http://localhost:3000` atau port yang diatur melalui `PORT`.

## Role pengguna

- `user`: login, melihat profil, membuat peminjaman, dan mengajukan pengembalian miliknya.
- `admin`: mengelola kategori/barang, menyetujui atau menolak peminjaman, memverifikasi pengembalian, dan melihat activity logs serta seluruh data pengembalian.

## Endpoint

Semua endpoint yang membutuhkan JWT menggunakan header:

```http
Authorization: Bearer JWT_TOKEN
```

### Auth

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/auth/register` | Publik |
| POST | `/api/auth/login` | Publik |
| GET | `/api/auth/me` | User/Admin |

### Categories

Semua endpoint kategori membutuhkan JWT admin.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/categories` | Membuat kategori |
| GET | `/api/categories` | Melihat kategori aktif |
| GET | `/api/categories/:id` | Melihat detail kategori |
| PATCH | `/api/categories/:id` | Memperbarui kategori |
| DELETE | `/api/categories/:id` | Mengarsipkan kategori |

### Items

Semua endpoint barang membutuhkan JWT admin.

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/items` | Membuat barang |
| GET | `/api/items` | Melihat barang aktif, dengan filter/paginasi |
| GET | `/api/items/:id` | Melihat detail barang |
| PATCH | `/api/items/:id` | Memperbarui barang |
| DELETE | `/api/items/:id` | Mengarsipkan barang |

### Loans

Semua endpoint peminjaman membutuhkan JWT.

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/loans` | User membuat pengajuan |
| GET | `/api/loans` | User melihat miliknya; admin melihat semua |
| GET | `/api/loans/:id` | User melihat miliknya; admin dapat melihat semua |
| PATCH | `/api/loans/:id/approve` | Admin |
| PATCH | `/api/loans/:id/reject` | Admin |

### Returns

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/returns` | User mengajukan pengembalian loan miliknya |
| GET | `/api/returns/my` | User melihat riwayat pengembaliannya |
| GET | `/api/returns` | Admin melihat seluruh pengembalian |
| GET | `/api/returns/:id` | User melihat miliknya; admin dapat melihat semua |
| PATCH | `/api/returns/:id/verify` | Admin memverifikasi pengembalian |

Pengajuan pengembalian berstatus `pending` dan belum menambah stok. Saat admin memverifikasi, status Return menjadi `verified`, status Loan menjadi `returned`, dan stok bertambah sesuai jumlah pengembalian.

### Activity Logs

Membutuhkan JWT admin.

```http
GET /api/activity-logs
GET /api/activity-logs?action=login&actor=USER_ID&page=1&limit=20
```

Log internal mencakup login, pembuatan kategori/barang, peminjaman, keputusan peminjaman, dan proses pengembalian. Log disimpan pada collection `activity_logs`.

### External Callback

Endpoint ini tidak menggunakan JWT, tetapi wajib menggunakan API key:

```http
POST /api/external/activity
x-api-key: EXTERNAL_API_KEY
Content-Type: application/json
```

Body:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "activityType": "external_login",
  "description": "Aktivitas dari sistem eksternal"
}
```

Log callback disimpan pada collection `activity_logs` dengan `source: "external"`.

## Seed data

Seed bersifat idempotent: data yang sudah ada tidak dihapus atau digandakan.

```bash
npm run seed:inventory
```

Seed menggunakan user admin yang tersedia sebagai `created_by` dan `updated_by`. Database harus memiliki minimal satu user.

Data minimum yang diverifikasi:

- 4 kategori aktif
- Setiap kategori minimal 5 barang
- Setiap barang memiliki relasi kategori yang valid

## Pengujian dengan Postman

1. `POST /api/auth/login` untuk memperoleh JWT user atau admin.
2. Gunakan JWT pada header `Authorization` untuk endpoint yang dilindungi.
3. Buat pengajuan loan menggunakan `POST /api/loans`.
4. Admin menyetujui loan melalui `PATCH /api/loans/:id/approve`.
5. User membuat pengajuan return melalui `POST /api/returns`.
6. Admin memeriksa daftar melalui `GET /api/returns`.
7. Admin memverifikasi melalui `PATCH /api/returns/:id/verify`.
8. Periksa log melalui `GET /api/activity-logs`.
9. Uji callback eksternal menggunakan `POST /api/external/activity` dengan header `x-api-key`.
10. Uji kasus negatif: tanpa JWT, role tidak sesuai, API key tidak ada/salah, ID tidak valid, dan payload tidak lengkap.

Contoh body login:

```json
{
  "email": "user@example.com",
  "password": "password_minimal_8"
}
```

## Catatan audit

Implementasi saat ini menggunakan middleware autentikasi dan validasi berbasis controller/validator. Repository belum menyediakan test runner otomatis atau dokumen TODO berfase Pre-Production, Production Stage 1, Production Stage 2, dan Post-Production; status audit item yang tidak dapat diverifikasi dari source harus dikonfirmasi melalui acceptance test atau checklist proyek resmi.
