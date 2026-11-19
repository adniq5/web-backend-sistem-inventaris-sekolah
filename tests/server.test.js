const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../model/User');
const Category = require('../model/Category');
const Item = require('../model/Item');
const Loan = require('../model/Loan');
const Return = require('../model/Return');
const ActivityLog = require('../model/ActivityLog');

describe('Server HTTP smoke tests', () => {
  let mongoServer;
  let user;
  let admin;
  let category;
  let item;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'jest-test-secret-not-production';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'inventaris_test' });
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Item.deleteMany({}),
      Loan.deleteMany({}),
      Return.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    user = await User.create({
      name: 'Test User',
      email: 'test-user@example.invalid',
      password: 'Password123',
      role: 'user'
    });
    admin = await User.create({
      name: 'Test Admin',
      email: 'test-admin@example.invalid',
      password: 'Password123',
      role: 'admin'
    });

    category = await Category.create({
      name: 'Kategori Testing',
      description: 'Kategori khusus Jest',
      created_by: admin._id,
      updated_by: admin._id
    });

    item = await Item.create({
      name: 'Barang Testing',
      description: 'Barang khusus Jest',
      category: category._id,
      stock: 5,
      created_by: admin._id,
      updated_by: admin._id
    });

    userToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('GET / mengembalikan HTTP 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Sistem Inventaris Sekolah API berjalan.'
    });
  });

  test('GET endpoint tidak dikenal mengembalikan HTTP 404', async () => {
    const response = await request(app).get('/endpoint-tidak-dikenal');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
  });

  test('POST /api/auth/login dengan body kosong mengembalikan validasi HTTP 400', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('email dan password wajib diisi.');
  });

  test('login dengan kredensial salah mengembalikan HTTP 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test-user@example.invalid',
      password: 'PasswordSalah123'
    });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
  });

  test('endpoint yang membutuhkan JWT tanpa token mengembalikan HTTP 401', async () => {
    const response = await request(app).get('/api/loans');

    expect(response.status).toBe(401);
  });

  test('akses endpoint admin menggunakan token user biasa mengembalikan HTTP 403', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  test('pengajuan peminjaman dengan stok tidak mencukupi ditolak', async () => {
    const response = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ item: item._id.toString(), quantity: 6, purpose: 'Testing stok kurang' });

    expect(response.status).toBe(400);
  });

  test('pengajuan peminjaman berhasil berstatus pending dan stok tidak berkurang', async () => {
    const stockBefore = item.stock;
    const response = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ item: item._id.toString(), quantity: 2, purpose: 'Testing peminjaman' });

    expect(response.status).toBe(201);
    expect(response.body.data.loan.status).toBe('pending');
    expect(response.body.data.loan.item_name).toBe(item.name);
    expect(response.body.data.loan.item_category_name).toBe(category.name);

    const itemAfter = await Item.findById(item._id);
    expect(itemAfter.stock).toBe(stockBefore);
  });

  test('persetujuan peminjaman berhasil dan stok berkurang', async () => {
    const loanResponse = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ item: item._id.toString(), quantity: 2, purpose: 'Testing approval' });

    const loanId = loanResponse.body.data.loan._id;
    const stockBefore = (await Item.findById(item._id)).stock;

    const response = await request(app)
      .patch(`/api/loans/${loanId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.loan.status).toBe('approved');

    const itemAfter = await Item.findById(item._id);
    expect(itemAfter.stock).toBe(stockBefore - 2);
  });

  test('persetujuan peminjaman gagal jika stok tidak mencukupi', async () => {
    const loan = await Loan.create({
      item: item._id,
      quantity: 6,
      purpose: 'Testing stok approval',
      status: 'pending',
      created_by: user._id,
      updated_by: user._id
    });

    await Item.findByIdAndUpdate(item._id, { stock: 5 });

    const response = await request(app)
      .patch(`/api/loans/${loan._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  test('pengajuan pengembalian berhasil berstatus pending', async () => {
    const loan = await Loan.create({
      item: item._id,
      quantity: 2,
      purpose: 'Testing return',
      status: 'approved',
      item_name: item.name,
      item_category_name: category.name,
      created_by: user._id,
      updated_by: user._id
    });

    const response = await request(app)
      .post('/api/returns')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ loan: loan._id.toString(), quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body.data.return.status).toBe('pending');
  });

  test('verifikasi pengembalian berhasil dan stok bertambah', async () => {
    const loan = await Loan.create({
      item: item._id,
      quantity: 2,
      purpose: 'Testing verify',
      status: 'approved',
      item_name: item.name,
      item_category_name: category.name,
      created_by: user._id,
      updated_by: user._id
    });
    const returnRecord = await Return.create({
      loan: loan._id,
      item: item._id,
      quantity: 2,
      status: 'pending',
      created_by: user._id,
      updated_by: user._id
    });
    const stockBefore = (await Item.findById(item._id)).stock;

    const response = await request(app)
      .patch(`/api/returns/${returnRecord._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.return.status).toBe('verified');

    const loanAfter = await Loan.findById(loan._id);
    expect(loanAfter.status).toBe('returned');
    expect(loanAfter.returned_at).toBeInstanceOf(Date);

    const itemAfter = await Item.findById(item._id);
    expect(itemAfter.stock).toBe(stockBefore + 2);
  });

  test('verifikasi pengembalian yang sama untuk kedua kalinya ditolak', async () => {
    const loan = await Loan.create({
      item: item._id,
      quantity: 1,
      purpose: 'Testing duplicate verify',
      status: 'approved',
      item_name: item.name,
      item_category_name: category.name,
      created_by: user._id,
      updated_by: user._id
    });
    const returnRecord = await Return.create({
      loan: loan._id,
      item: item._id,
      quantity: 1,
      status: 'pending',
      created_by: user._id,
      updated_by: user._id
    });

    const firstResponse = await request(app)
      .patch(`/api/returns/${returnRecord._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    const secondResponse = await request(app)
      .patch(`/api/returns/${returnRecord._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(409);
  });

  test('activity log dapat difilter berdasarkan tipe aktivitas, source, dan rentang tanggal', async () => {
    await ActivityLog.create({
      actor: admin._id,
      action: 'login',
      source: 'internal',
      description: 'Test filter activity log',
      created_at: new Date('2026-11-15T10:00:00.000Z')
    });
    await ActivityLog.create({
      actor: admin._id,
      action: 'external',
      activity_type: 'external_login',
      source: 'external',
      description: 'Test external activity',
      created_at: new Date('2026-11-16T10:00:00.000Z')
    });

    const response = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        action: 'login',
        source: 'internal',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        page: 1,
        limit: 20
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toBe(1);
    expect(response.body.data.activityLogs[0].action).toBe('login');
  });

  test('filter activity log menolak rentang tanggal yang tidak valid', async () => {
    const response = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2026-12-01',
        endDate: '2026-11-01'
      });

    expect(response.status).toBe(400);
  });
});
