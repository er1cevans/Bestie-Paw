/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Pets Module Integration Tests', () => {
  const user1 = { username: 'user1', email: 'user1@example.com', password: 'Password123!' };
  const user2 = { username: 'user2', email: 'user2@example.com', password: 'Password123!' };
  
  let token1: string;
  let token2: string;
  let petId: string;

  beforeEach(async () => {
    // Cleanup DB
    await prisma.user.deleteMany();

    // Setup users
    const r1 = await request(app).post('/api/auth/register').send(user1);
    if (!r1.body.success) throw new Error('Register user1 failed: ' + JSON.stringify(r1.body));
    const r2 = await request(app).post('/api/auth/register').send(user2);
    if (!r2.body.success) throw new Error('Register user2 failed: ' + JSON.stringify(r2.body));

    const login1 = await request(app).post('/api/auth/login').send({ email: user1.email, password: user1.password });
    if (!login1.body.success) throw new Error('Login user1 failed: ' + JSON.stringify(login1.body));
    token1 = login1.body.data.accessToken;

    const login2 = await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password });
    token2 = login2.body.data.accessToken;
  });

  const petPayload = {
    name: 'Buddy',
    type: 'DOG',
    gender: 'MALE',
    breed: 'Golden Retriever',
    weightKg: 30.5
  };

  it('should create a pet and return uppercase enums', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token1}`)
      .send(petPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Buddy');
    expect(res.body.data.type).toBe('DOG'); // Assert uppercase enum
    expect(res.body.data.gender).toBe('MALE'); // Assert uppercase enum

    petId = res.body.data.id;
  });

  it('should list pets for current user', async () => {
    // Create pet first
    await request(app).post('/api/pets').set('Authorization', `Bearer ${token1}`).send(petPayload);

    const res = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Buddy');
    expect(res.body.data[0].type).toBe('DOG');
  });

  it('should get pet by id', async () => {
    const createRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token1}`).send(petPayload);
    const id = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/pets/${id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.type).toBe('DOG');
  });

  it('should patch pet profile', async () => {
    const createRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token1}`).send(petPayload);
    const id = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/pets/${id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Max' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Max');
  });

  it('should delete pet profile', async () => {
    const createRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token1}`).send(petPayload);
    const id = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/pets/${id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const getRes = await request(app)
      .get(`/api/pets/${id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(getRes.status).toBe(404);
  });

  it('should return FORBIDDEN when accessing another users pet', async () => {
    const createRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token1}`).send(petPayload);
    const id = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/pets/${id}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return NOT_FOUND for non-existent pet', async () => {
    const res = await request(app)
      .get('/api/pets/non-existent-id')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return BAD_REQUEST when creating pet with missing fields or invalid enum', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Buddy',
        type: 'INVALID_TYPE', // Invalid enum
        // missing gender
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
