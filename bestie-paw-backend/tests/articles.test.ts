import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Articles Module', () => {
  const adminCreds = {
    username: 'artadmin',
    email: 'artadmin@example.com',
    password: 'Password123!'
  };

  const userCreds = {
    username: 'artuser',
    email: 'artuser@example.com',
    password: 'Password123!'
  };

  let adminToken: string;
  let userToken: string;

  // Helpers ------------------------------------------------------------------
  const createArticle = (
    token: string,
    overrides: Record<string, unknown> = {}
  ) =>
    request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Sample title',
        content: 'Sample content body',
        authorName: 'Editor',
        category: 'Health',
        ...overrides
      });

  beforeEach(async () => {
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();

    // ADMIN user: register, then promote in DB (role is read from the DB by
    // requireAdmin, so the registration token immediately gains admin rights).
    const regAdmin = await request(app).post('/api/auth/register').send(adminCreds);
    adminToken = regAdmin.body.data.accessToken;
    await prisma.user.update({
      where: { id: regAdmin.body.data.user.id },
      data: { role: 'ADMIN' }
    });

    const regUser = await request(app).post('/api/auth/register').send(userCreds);
    userToken = regUser.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
  });

  // Auth response ------------------------------------------------------------
  it('exposes role on the authenticated user (USER by default, ADMIN after promotion)', async () => {
    const me = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.role).toBe('ADMIN');

    const meUser = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(meUser.body.data.role).toBe('USER');
  });

  // Permissions --------------------------------------------------------------
  it('rejects write operations from a non-admin user with 403 FORBIDDEN', async () => {
    const created = await createArticle(adminToken);
    const id = created.body.data.id;

    const createRes = await createArticle(userToken);
    expect(createRes.status).toBe(403);
    expect(createRes.body.error.code).toBe('FORBIDDEN');

    const patchRes = await request(app)
      .patch(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Hacked' });
    expect(patchRes.status).toBe(403);
    expect(patchRes.body.error.code).toBe('FORBIDDEN');

    const deleteRes = await request(app)
      .delete(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.error.code).toBe('FORBIDDEN');
  });

  it('lets an admin create, update and delete an article', async () => {
    const createRes = await createArticle(adminToken, { title: 'Original' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.title).toBe('Original');
    expect(createRes.body.data.published).toBe(true);
    expect(createRes.body.data.publishedAt).not.toBeNull();
    const id = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated', category: 'Nutrition' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.title).toBe('Updated');
    expect(patchRes.body.data.category).toBe('Nutrition');

    const deleteRes = await request(app)
      .delete(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(404);
  });

  it('validates the create payload (empty title → 400 VALIDATION_ERROR)', async () => {
    const res = await createArticle(adminToken, { title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Reading & visibility -----------------------------------------------------
  it('lists only published articles for a regular user with the pagination envelope', async () => {
    await createArticle(adminToken, { title: 'Published A' });
    await createArticle(adminToken, { title: 'Draft B', published: false });

    const listRes = await request(app)
      .get('/api/articles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveProperty('items');
    expect(listRes.body.data).toHaveProperty('total');
    expect(listRes.body.data).toHaveProperty('page');
    expect(listRes.body.data).toHaveProperty('limit');
    expect(listRes.body.data.total).toBe(1);
    expect(listRes.body.data.items).toHaveLength(1);
    expect(listRes.body.data.items[0].title).toBe('Published A');
    expect(listRes.body.data.items[0].liked).toBe(false);
    expect(listRes.body.data.items[0].favorited).toBe(false);
  });

  it('hides unpublished articles from regular users but shows them to admins', async () => {
    const draft = await createArticle(adminToken, { title: 'Secret draft', published: false });
    const draftId = draft.body.data.id;

    // Regular user: not in list, 404 by id
    const userList = await request(app)
      .get('/api/articles')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userList.body.data.items.find((a: { id: string }) => a.id === draftId)).toBeUndefined();

    const userGet = await request(app)
      .get(`/api/articles/${draftId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(userGet.status).toBe(404);

    // Admin: visible by id, and via ?includeUnpublished=true
    const adminGet = await request(app)
      .get(`/api/articles/${draftId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminGet.status).toBe(200);
    expect(adminGet.body.data.id).toBe(draftId);

    const adminList = await request(app)
      .get('/api/articles?includeUnpublished=true')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminList.body.data.items.find((a: { id: string }) => a.id === draftId)).toBeDefined();

    // includeUnpublished is ignored for a regular user
    const userListFlag = await request(app)
      .get('/api/articles?includeUnpublished=true')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userListFlag.body.data.total).toBe(0);
  });

  it('filters the list by category', async () => {
    await createArticle(adminToken, { title: 'Cat care', category: 'Cat' });
    await createArticle(adminToken, { title: 'Dog care', category: 'Dog' });

    const res = await request(app)
      .get('/api/articles?category=Cat')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0].title).toBe('Cat care');
  });

  it('clamps pagination parameters', async () => {
    const res = await request(app)
      .get('/api/articles?page=0&limit=100')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.data.page).toBe(1); // Math.max(1, 0)
    expect(res.body.data.limit).toBe(50); // Math.min(50, 100)
  });

  // Likes --------------------------------------------------------------------
  it('likes and unlikes an article idempotently with a consistent count', async () => {
    const created = await createArticle(adminToken);
    const id = created.body.data.id;

    const like1 = await request(app)
      .post(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like1.status).toBe(200);
    expect(like1.body.data).toEqual({ liked: true, likes: 1 });

    // Liking again is a no-op, count stays at 1
    const like2 = await request(app)
      .post(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like2.body.data).toEqual({ liked: true, likes: 1 });

    const unlike1 = await request(app)
      .delete(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(unlike1.body.data).toEqual({ liked: false, likes: 0 });

    // Unliking again is a no-op, count stays at 0
    const unlike2 = await request(app)
      .delete(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(unlike2.body.data).toEqual({ liked: false, likes: 0 });
  });

  // Favorites ----------------------------------------------------------------
  it('favorites/unfavorites idempotently and reflects them in GET /articles/favorites', async () => {
    const a = await createArticle(adminToken, { title: 'Fav me' });
    const b = await createArticle(adminToken, { title: 'Not me' });
    const aId = a.body.data.id;

    const fav1 = await request(app)
      .post(`/api/articles/${aId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(fav1.body.data).toEqual({ favorited: true });

    // Idempotent
    const fav2 = await request(app)
      .post(`/api/articles/${aId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(fav2.body.data).toEqual({ favorited: true });

    const favList = await request(app)
      .get('/api/articles/favorites')
      .set('Authorization', `Bearer ${userToken}`);
    expect(favList.status).toBe(200);
    expect(favList.body.data.total).toBe(1);
    expect(favList.body.data.items[0].id).toBe(aId);
    expect(favList.body.data.items[0].favorited).toBe(true);
    // The non-favorited article is absent
    expect(
      favList.body.data.items.find((x: { id: string }) => x.id === b.body.data.id)
    ).toBeUndefined();

    const unfav = await request(app)
      .delete(`/api/articles/${aId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(unfav.body.data).toEqual({ favorited: false });

    // Unfavoriting again is a no-op
    const unfav2 = await request(app)
      .delete(`/api/articles/${aId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(unfav2.body.data).toEqual({ favorited: false });

    const favListAfter = await request(app)
      .get('/api/articles/favorites')
      .set('Authorization', `Bearer ${userToken}`);
    expect(favListAfter.body.data.total).toBe(0);
  });

  // Per-user liked/favorited state ------------------------------------------
  it('reflects liked/favorited per current user in list and detail', async () => {
    const created = await createArticle(adminToken);
    const id = created.body.data.id;

    await request(app)
      .post(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    await request(app)
      .post(`/api/articles/${id}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    // The acting user sees liked/favorited = true
    const userDetail = await request(app)
      .get(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(userDetail.body.data.liked).toBe(true);
    expect(userDetail.body.data.favorited).toBe(true);
    expect(userDetail.body.data.likes).toBe(1);

    // A different user (admin) sees their own state = false
    const adminDetail = await request(app)
      .get(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminDetail.body.data.liked).toBe(false);
    expect(adminDetail.body.data.favorited).toBe(false);
    // ...but the global like count is shared
    expect(adminDetail.body.data.likes).toBe(1);
  });

  // 404s ---------------------------------------------------------------------
  it('returns 404 for like/favorite/admin actions on a non-existent article', async () => {
    const fakeId = 'cl00000000000000000000000';

    const like = await request(app)
      .post(`/api/articles/${fakeId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like.status).toBe(404);

    const unlike = await request(app)
      .delete(`/api/articles/${fakeId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(unlike.status).toBe(404);

    const fav = await request(app)
      .post(`/api/articles/${fakeId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(fav.status).toBe(404);

    const patch = await request(app)
      .patch(`/api/articles/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'x' });
    expect(patch.status).toBe(404);

    const del = await request(app)
      .delete(`/api/articles/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(404);
  });

  it('cascade-deletes likes and favorites when an article is removed', async () => {
    const created = await createArticle(adminToken);
    const id = created.body.data.id;

    await request(app)
      .post(`/api/articles/${id}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    await request(app)
      .post(`/api/articles/${id}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    await request(app)
      .delete(`/api/articles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(await prisma.articleLike.count({ where: { articleId: id } })).toBe(0);
    expect(await prisma.articleFavorite.count({ where: { articleId: id } })).toBe(0);
  });
});
