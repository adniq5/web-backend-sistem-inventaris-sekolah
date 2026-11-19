const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sistem Inventaris Sekolah API',
      version: '1.0.0',
      description: 'Dokumentasi API REST untuk autentikasi, inventaris, peminjaman, pengembalian, activity log, dan callback eksternal.'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Server development lokal' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Pesan error.' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] }
          }
        },
        CategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            description: { type: 'string', maxLength: 500 }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            created_by: { type: 'string' },
            updated_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            archived: { type: 'boolean' }
          }
        },
        ItemRequest: {
          type: 'object',
          required: ['name', 'category', 'stock'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 150 },
            description: { type: 'string' },
            category: { type: 'string' },
            stock: { type: 'integer', minimum: 0 }
          }
        },
        ItemUpdateRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 150 },
            description: { type: 'string' },
            category: { type: 'string' },
            stock: { type: 'integer', minimum: 0 }
          }
        },
        Item: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Category' }] },
            stock: { type: 'integer' },
            created_by: { type: 'string' },
            updated_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            archived: { type: 'boolean' }
          }
        },
        LoanRequest: {
          type: 'object',
          required: ['item', 'quantity'],
          properties: {
            item: { type: 'string', description: 'ObjectId barang aktif' },
            quantity: { type: 'integer', minimum: 1 },
            purpose: { type: 'string', maxLength: 500 }
          }
        },
        RejectionRequest: {
          type: 'object',
          properties: {
            reason: { type: 'string', maxLength: 500 }
          }
        },
        BorrowRequest: {
          type: 'object',
          required: ['due_date'],
          properties: {
            due_date: { type: 'string', format: 'date', example: '2026-12-31' }
          }
        },
        Loan: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            item: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Item' }] },
            quantity: { type: 'integer' },
            purpose: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'borrowed', 'returned', 'rejected', 'overdue'] },
            rejection_reason: { type: 'string' },
            borrowed_at: { type: 'string', format: 'date-time' },
            due_date: { type: 'string', format: 'date-time' },
            returned_at: { type: 'string', format: 'date-time' },
            overdue_at: { type: 'string', format: 'date-time' },
            item_name: { type: 'string' },
            item_category_name: { type: 'string' },
            created_by: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/User' }] },
            updated_by: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/User' }] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            archived: { type: 'boolean' }
          }
        },
        ReturnRequest: {
          type: 'object',
          required: ['loan', 'quantity'],
          properties: {
            loan: { type: 'string', description: 'ObjectId loan' },
            quantity: { type: 'integer', minimum: 1 }
          }
        },
        Return: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            loan: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Loan' }] },
            item: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Item' }] },
            quantity: { type: 'integer' },
            status: { type: 'string', enum: ['pending', 'verified'] },
            created_by: { type: 'string' },
            updated_by: { type: 'string' },
            verified_by: { type: 'string' },
            verified_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            archived: { type: 'boolean' }
          }
        },
        ExternalActivityRequest: {
          type: 'object',
          required: ['userId', 'activityType', 'description'],
          properties: {
            userId: { type: 'string', description: 'ObjectId user' },
            activityType: { type: 'string', maxLength: 100 },
            description: { type: 'string', maxLength: 500 }
          }
        },
        ActivityLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            actor: { oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/User' }] },
            action: { type: 'string', enum: ['login', 'create_category', 'create_item', 'submit_loan', 'approve_loan', 'reject_loan', 'submit_return', 'verify_return', 'external'] },
            activity_type: { type: 'string' },
            source: { type: 'string', enum: ['internal', 'external'] },
            description: { type: 'string' },
            metadata: { type: 'object', additionalProperties: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrasi user',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            '201': { description: 'Registrasi berhasil', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            '400': { description: 'Validasi gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '409': { description: 'Email sudah terdaftar', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user atau admin',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            '200': { description: 'Login berhasil', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            '400': { description: 'Validasi gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Email atau password salah', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Melihat profil user aktif',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Berhasil', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            '401': { description: 'Token tidak ada atau tidak valid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Melihat kategori aktif',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Daftar kategori' },
            '401': { description: 'Token tidak valid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Bukan admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        post: {
          tags: ['Categories'],
          summary: 'Membuat kategori',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } } } },
          responses: {
            '201': { description: 'Kategori berhasil dibuat' },
            '400': { description: 'Validasi gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Token tidak valid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Bukan admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '409': { description: 'Nama kategori sudah ada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Melihat detail kategori',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Berhasil' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Kategori tidak ditemukan' } }
        },
        patch: {
          tags: ['Categories'],
          summary: 'Memperbarui kategori',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } } } },
          responses: { '200': { description: 'Berhasil diperbarui' }, '400': { description: 'Validasi gagal' }, '404': { description: 'Kategori tidak ditemukan' } }
        },
        delete: {
          tags: ['Categories'],
          summary: 'Mengarsipkan kategori',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Kategori diarsipkan' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Kategori tidak ditemukan' } }
        }
      },
      '/api/items': {
        get: {
          tags: ['Items'],
          summary: 'Melihat daftar barang',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Pencarian nama barang' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'ObjectId kategori' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['name', 'stock', 'created_at'], default: 'name' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
          ],
          responses: { '200': { description: 'Daftar barang beserta pagination' }, '400': { description: 'Parameter kategori tidak valid' } }
        },
        post: {
          tags: ['Items'],
          summary: 'Membuat barang',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemRequest' } } } },
          responses: { '201': { description: 'Barang berhasil dibuat' }, '400': { description: 'Validasi atau kategori tidak aktif' }, '403': { description: 'Bukan admin' } }
        }
      },
      '/api/items/{id}': {
        get: {
          tags: ['Items'],
          summary: 'Melihat detail barang',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Berhasil' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Barang tidak ditemukan' } }
        },
        patch: {
          tags: ['Items'],
          summary: 'Memperbarui barang',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemUpdateRequest' } } } },
          responses: { '200': { description: 'Berhasil diperbarui' }, '400': { description: 'Validasi gagal' }, '404': { description: 'Barang tidak ditemukan' } }
        },
        delete: {
          tags: ['Items'],
          summary: 'Mengarsipkan barang',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Barang diarsipkan' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Barang tidak ditemukan' } }
        }
      },
      '/api/loans': {
        get: {
          tags: ['Loans'],
          summary: 'Melihat loan milik user atau seluruh loan untuk admin',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Daftar loan' }, '401': { description: 'Token tidak valid' } }
        },
        post: {
          tags: ['Loans'],
          summary: 'Membuat pengajuan peminjaman',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoanRequest' } } } },
          responses: { '201': { description: 'Pengajuan pending dibuat' }, '400': { description: 'Stok atau data tidak valid' }, '403': { description: 'Bukan user' }, '404': { description: 'Barang tidak ditemukan' } }
        }
      },
      '/api/loans/my': {
        get: {
          tags: ['Loans'],
          summary: 'Melihat riwayat peminjaman user',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Riwayat loan milik user' }, '401': { description: 'Token tidak valid' }, '403': { description: 'Bukan user' } }
        }
      },
      '/api/loans/{id}': {
        get: {
          tags: ['Loans'],
          summary: 'Melihat detail loan',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Berhasil' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Loan tidak ditemukan atau bukan milik user' } }
        }
      },
      '/api/loans/{id}/approve': {
        patch: {
          tags: ['Loans'],
          summary: 'Admin menyetujui loan pending',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Loan approved dan stok dikurangi' }, '400': { description: 'Stok tidak cukup' }, '403': { description: 'Bukan admin' }, '404': { description: 'Loan pending tidak ditemukan' }, '409': { description: 'Loan sudah diproses' } }
        }
      },
      '/api/loans/{id}/reject': {
        patch: {
          tags: ['Loans'],
          summary: 'Admin menolak loan pending',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/RejectionRequest' } } } },
          responses: { '200': { description: 'Loan rejected' }, '400': { description: 'Validasi gagal' }, '403': { description: 'Bukan admin' }, '404': { description: 'Loan pending tidak ditemukan' } }
        }
      },
      '/api/loans/{id}/borrow': {
        patch: {
          tags: ['Loans'],
          summary: 'Admin mengubah loan approved menjadi borrowed',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BorrowRequest' } } } },
          responses: { '200': { description: 'Loan borrowed' }, '400': { description: 'Tanggal jatuh tempo tidak valid' }, '403': { description: 'Bukan admin' }, '404': { description: 'Loan approved tidak ditemukan' } }
        }
      },
      '/api/loans/{id}/mark-overdue': {
        patch: {
          tags: ['Loans'],
          summary: 'Admin menandai loan borrowed sebagai overdue',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Loan overdue' }, '400': { description: 'Due date belum ada atau belum terlewati' }, '403': { description: 'Bukan admin' }, '404': { description: 'Loan borrowed tidak ditemukan' }, '409': { description: 'Status loan sudah berubah' } }
        }
      },
      '/api/returns': {
        get: {
          tags: ['Returns'],
          summary: 'Admin melihat seluruh pengembalian',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Daftar pengembalian' }, '401': { description: 'Token tidak valid' }, '403': { description: 'Bukan admin' } }
        },
        post: {
          tags: ['Returns'],
          summary: 'User mengajukan pengembalian',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReturnRequest' } } } },
          responses: { '201': { description: 'Pengajuan pending dibuat' }, '400': { description: 'Validasi atau jumlah pengembalian tidak valid' }, '403': { description: 'Bukan user' }, '404': { description: 'Loan aktif milik user tidak ditemukan' }, '409': { description: 'Loan sudah memiliki pengajuan' } }
        }
      },
      '/api/returns/my': {
        get: {
          tags: ['Returns'],
          summary: 'User melihat riwayat pengembaliannya',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Riwayat pengembalian user' }, '401': { description: 'Token tidak valid' }, '403': { description: 'Bukan user' } }
        }
      },
      '/api/returns/{id}': {
        get: {
          tags: ['Returns'],
          summary: 'Melihat detail pengembalian',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Berhasil' }, '400': { description: 'ID tidak valid' }, '404': { description: 'Pengembalian tidak ditemukan atau bukan milik user' } }
        }
      },
      '/api/returns/{id}/verify': {
        patch: {
          tags: ['Returns'],
          summary: 'Admin memverifikasi pengembalian',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Pengembalian diverifikasi, stok bertambah, loan returned' }, '400': { description: 'Status loan tidak mendukung verifikasi' }, '403': { description: 'Bukan admin' }, '404': { description: 'Pengembalian atau barang tidak ditemukan' }, '409': { description: 'Pengembalian sudah diproses' } }
        }
      },
      '/api/activity-logs': {
        get: {
          tags: ['Activity Logs'],
          summary: 'Melihat activity log',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'action', in: 'query', schema: { type: 'string' }, description: 'Jenis aktivitas' },
            { name: 'actor', in: 'query', schema: { type: 'string' }, description: 'ObjectId pelaku' },
            { name: 'source', in: 'query', schema: { type: 'string', enum: ['internal', 'external'] }, description: 'Sumber aktivitas' },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Batas awal rentang aktivitas (ISO 8601)' },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Batas akhir rentang aktivitas (ISO 8601)' },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
          ],
          responses: { '200': { description: 'Daftar activity log beserta pagination' }, '400': { description: 'Parameter filter tidak valid' }, '401': { description: 'Token tidak valid' }, '403': { description: 'Bukan admin' } }
        }
      },
      '/api/external/activity': {
        post: {
          tags: ['External Callback'],
          summary: 'Mencatat aktivitas eksternal',
          security: [{ apiKeyAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExternalActivityRequest' } } } },
          responses: { '201': { description: 'Activity log eksternal berhasil dibuat' }, '400': { description: 'Payload tidak valid' }, '401': { description: 'API key tidak ada' }, '403': { description: 'API key tidak valid' }, '404': { description: 'User tidak ditemukan' }, '500': { description: 'EXTERNAL_API_KEY belum dikonfigurasi' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
