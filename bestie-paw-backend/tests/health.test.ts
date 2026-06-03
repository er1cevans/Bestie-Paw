/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Health Module Integration Tests', () => {
  const user = { username: 'healthuser', email: 'healthuser@example.com', password: 'Password123!' };
  const user2 = { username: 'healthuser2', email: 'healthuser2@example.com', password: 'Password123!' };
  const petPayload = { name: 'HealthPet', type: 'CAT', gender: 'FEMALE' };
  
  let token: string;
  let token2: string;
  let petId: string;

  beforeEach(async () => {
    // Cleanup DB
    await prisma.user.deleteMany();

    // Setup user
    await request(app).post('/api/auth/register').send(user);
    const loginRes = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    token = loginRes.body.data.accessToken;

    await request(app).post('/api/auth/register').send(user2);
    const loginRes2 = await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password });
    token2 = loginRes2.body.data.accessToken;

    // Setup pet
    const petRes = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`).send(petPayload);
    petId = petRes.body.data.id;
  });

  const healthPayload = {
    type: 'VACCINE',
    title: 'Rabies Vaccine',
    date: new Date().toISOString(),
    description: 'Annual rabies shot',
    vetName: 'Dr. Smith',
    clinic: 'Happy Paws Clinic'
  };

  it('should create a health record and return uppercase enum', async () => {
    const res = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(healthPayload.title);
    expect(res.body.data.type).toBe('VACCINE'); // Assert uppercase enum
  });

  it('should list health records with pagination envelope', async () => {
    // Create record first
    await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);

    const res = await request(app)
      .get(`/api/pets/${petId}/health?page=1&limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Assert pagination envelope
    expect(res.body.data.items).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.total).toBeDefined();
    expect(res.body.data.page).toBeDefined();
    expect(res.body.data.limit).toBeDefined();

    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(10);
    expect(res.body.data.items[0].title).toBe(healthPayload.title);
    expect(res.body.data.items[0].type).toBe('VACCINE');
  });

  it('should delete a health record', async () => {
    // Create record first
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    
    const recordId = createRes.body.data.id;

    // Delete record
    const deleteRes = await request(app)
      .delete(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify deletion
    const getRes = await request(app)
      .get(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error.code).toBe('NOT_FOUND');
  });

  it('should return FORBIDDEN when creating health record for another users pet', async () => {
    const res = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token2}`)
      .send(healthPayload);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return BAD_REQUEST for invalid health type enum', async () => {
    const res = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...healthPayload,
        type: 'INVALID_ENUM'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get a single health record', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(recordId);
  });

  it('should patch a health record', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/pets/${petId}/health/${recordId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated title');
  });

  it('should upload health attachments', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/pets/${petId}/health/${recordId}/attachments`)
      .set('Authorization', `Bearer ${token}`)
      .attach('files', Buffer.from('fake pdf data'), 'doc.pdf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should handle upload health attachments with no files', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/pets/${petId}/health/${recordId}/attachments`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('No files uploaded');
  });

  it('should remove a health attachment', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const uploadRes = await request(app)
      .post(`/api/pets/${petId}/health/${recordId}/attachments`)
      .set('Authorization', `Bearer ${token}`)
      .attach('files', Buffer.from('fake pdf data'), 'doc.pdf');
    const attachmentUrl = uploadRes.body.data.attachments[0];

    const res = await request(app)
      .delete(`/api/pets/${petId}/health/${recordId}/attachments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ url: attachmentUrl });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  it('should fail to remove non-existent health attachment', async () => {
    const createRes = await request(app)
      .post(`/api/pets/${petId}/health`)
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);
    const recordId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/pets/${petId}/health/${recordId}/attachments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'http://localhost:3000/uploads/nonexistent.pdf' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
