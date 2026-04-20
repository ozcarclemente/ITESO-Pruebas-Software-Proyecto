import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from './index.js'

describe('GET /api/articles', () => {
  it('Returns articles with correct structure', async () => {
    const res = await request(app).get('/api/articles')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('articles')
    expect(res.body).toHaveProperty('articlesCount')
    expect(Array.isArray(res.body.articles)).toBe(true)
  })

  it('Respects the article limit', async () => {
    const res = await request(app).get('/api/articles?limit=1')
    expect(res.body.articles.length).toBeLessThanOrEqual(1)
  })

  it('Respects the offset', async () => {
    const res1 = await 
    request(app).get('/api/articles?limit=1&offset=0')
    const res2 = await request(app).get('/api/articles?limit=1&offset=1')
    expect(res1.body.articles[0]?.slug).not.toBe(res2.body.articles[0]?.slug)
  })
})

describe('GET /api/articles/feed', () => {
  it('Returns 401 without a token', async () => {
    const res = await request(app).get('/api/articles/feed')
    expect(res.status).toBe(401)
  })

  it('Returns articles with a valid token', async () => {
    const loginRes = await request(app).post('/api/users/login').send({
      user: { email: 'user@example.com', password: '12345678' }
    })
    const token = loginRes.body.user.token

    const res = await request(app)
      .get('/api/articles/feed')
      .set('Authorization', `Token ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('articles')
  })
})