import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Community Module', () => {
  const user1 = {
    username: 'comuser1',
    email: 'comuser1@example.com',
    password: 'Password123!'
  };

  const user2 = {
    username: 'comuser2',
    email: 'comuser2@example.com',
    password: 'Password123!'
  };

  let token1: string;
  let token2: string;

  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/api/auth/register').send(user1);
    token1 = (
      await request(app).post('/api/auth/login').send({ email: user1.email, password: user1.password })
    ).body.data.accessToken;

    await request(app).post('/api/auth/register').send(user2);
    token2 = (
      await request(app).post('/api/auth/login').send({ email: user2.email, password: user2.password })
    ).body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create and list posts with pagination envelope', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Hello Community!' });
    
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.content).toBe('Hello Community!');

    const listRes = await request(app)
      .get('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`);
    
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data.items)).toBe(true);
    expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.total).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.page).toBe(1);
  });

  it('should get post details', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post for details' });
    const postId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(postId);
  });

  it('should reject deleting a post not authored by the user (403)', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'My private post' });
    const postId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token2}`);
    
    expect(delRes.status).toBe(403);
    expect(delRes.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow author to delete post', async () => {
    const createRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'My post to delete' });
    const postId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  it('should create and delete comments', async () => {
    const postRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post for comment' });
    const postId = postRes.body.data.id;

    const commentRes = await request(app)
      .post(`/api/community/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Nice post!' });
    
    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.content).toBe('Nice post!');
    const commentId = commentRes.body.data.id;

    // Delete comment
    const delRes = await request(app)
      .delete(`/api/community/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(delRes.status).toBe(200);
  });

  it('should like and unlike post idempotently', async () => {
    const postRes = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Post to like' });
    const postId = postRes.body.data.id;

    // Like
    const like1 = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(like1.status).toBe(200);
    expect(like1.body.data.liked).toBe(true);

    // Like again (idempotent)
    const like2 = await request(app)
      .post(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(like2.status).toBe(200);
    expect(like2.body.data.liked).toBe(false); // Service returns { liked: false } on unique constraint error

    // Unlike
    const unlike1 = await request(app)
      .delete(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(unlike1.status).toBe(200);
    expect(unlike1.body.data.liked).toBe(false);

    // Unlike again (idempotent)
    const unlike2 = await request(app)
      .delete(`/api/community/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token2}`);
    expect(unlike2.status).toBe(200);
    expect(unlike2.body.data.liked).toBe(false);
  });
});
