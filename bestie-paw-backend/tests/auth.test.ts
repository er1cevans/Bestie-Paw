/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Auth Module Integration Tests', () => {
  const registerPayload = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    phone: '12345678901'
  };

  beforeEach(async () => {
    // Cleanup DB
    await prisma.user.deleteMany();
  });

  let accessToken: string;
  let refreshToken: string;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(registerPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(registerPayload.email);
  });

  it('should fail to register with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(registerPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should login and get tokens', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: registerPayload.email,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should access protected endpoint with token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(registerPayload);
    if (!registerRes.body.success) throw new Error('Register failed: ' + JSON.stringify(registerRes.body));

    const loginRes = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    if (!loginRes.body.success) throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(registerPayload.email);
  });

  it('should fail to access protected endpoint without token', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should refresh access token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(registerPayload);
    if (!registerRes.body.success) throw new Error('Register failed: ' + JSON.stringify(registerRes.body));

    const loginRes = await request(app).post('/api/auth/login').send({
      email: registerPayload.email,
      password: registerPayload.password
    });
    if (!loginRes.body.success) throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
    const currentRefreshToken = loginRes.body.data.refreshToken;

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: currentRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should fail to refresh access token with invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-refresh-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail to register with invalid payload', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test',
        // missing email and password
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
