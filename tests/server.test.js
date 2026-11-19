const request = require('supertest');
const app = require('../server');

describe('Server HTTP smoke tests', () => {
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
});
