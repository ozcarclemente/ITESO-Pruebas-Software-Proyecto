/*
    Tests for article CRUD

    don't forget to run the postgres docker instance before running the tests
*/

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
const { User, Article, Tag, sequelize } = require('../models');
const { jwtSign } = require('../helper/jwt');
const app = require('../index');

describe('Articles CRUD test', () => {
    // tests for article crud
    let authToken;
    let testUser;

    beforeAll(async () => {
        // ensure there's connection with test db
        await sequelize.authenticate();
    });

    beforeEach(async () => {
        // clean up tables beforehand
        await Article.destroy({ where: {}, cascade: true, truncate: true });
        await User.destroy({ where: {}, cascade: true, truncate: true });
        await Tag.destroy({ where: {}, cascade: true, truncate: true });

        // test user
        testUser = await User.create({
            username: 'user1',
            email: 'email@test.com',
            password: 'pass123',
        });

        // generate a valid auth token
        authToken = await jwtSign({
            username: testUser.username,
            email: testUser.email
        });
    });

    describe('POST /api/articles', () => {
        // tests for CREATE operations

        it('should create an article succesfully', async () => {
            // test that checks that a new article is created
            const newArticle = {
                article: {
                    title: 'Test Article',
                    description: 'This is a test article.',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                    tagList: ['cool', 'test']
                }
            };

            const res = await request(app)
                .post('/api/articles')
                .set('Authorization', `Token ${authToken}`)
                .send(newArticle);

            expect(res.status).toBe(201);
            expect(res.body.article).toBeDefined();
            expect(res.body.article.title).toBe('Test Article');
            expect(res.body.article.slug).toBe('test-article');
            expect(res.body.article.author.username).toBe('user1');
        });

        it('should fail to create article if not logged in', async () => {
            // test that checks that creating an article fails if not logged in
            const res = await request(app)
                .post('/api/articles')
                .send({ article: { title: 'Test Article' } });


            expect(res.status).toBe(401);
            expect(res.body.errors.body).toContain('You need to login first!');
        });

        it('should fail to create article if article doesn\'t have a title', async () => {
            // test that checks creating an article without a title fails
            const res = await request(app)
                .post('/api/articles')
                .set('Authorization', `Token ${authToken}`)
                .send({
                    article: {
                        description: 'This is a test article.',
                        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.'
                    }
                });

            expect(res.status).toBe(422);
            expect(res.body.errors.body).toContain('A title is required');
        });
    });

    describe('GET /api/articles/:slug', () => {

        it('should return a specific article', async () => {
            // test that checks that a specific article is returned
            const article = await Article.create({
                title: 'Test Article',
                slug: 'test-article',
                description: 'This is a test article.',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                userId: testUser.id
            });

            const res = await request(app)
                .get(`/api/articles/${article.slug}`)
                .set('Authorization', `Token ${authToken}`);

            expect(res.status).toBe(200);
        });

        it('should return a list of all articles', async () => {
            // test that checks that all existing articles are returned
            const otherUser = await User.create({
                username: 'user2',
                email: 'email2@test.com',
                password: 'pass345'
            });

            const a1 = await Article.create({
                title: 'Test Article',
                slug: 'test-article',
                description: 'This is a test article.',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                userId: testUser.id
            });

            const a2 = await Article.create({
                title: 'Test Article Two',
                slug: 'test-article-two',
                description: 'This is a second test article.',
                body: 'Lorem Ipsum.',
                userId: otherUser.id
            });

            const res = await request(app)
                .get('/api/articles')
                .set('Authorization', `Token ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.articles).toHaveLength(2);
            expect(res.body).toHaveProperty('articlesCount', 2);
        });

        it('should fail to return article if the article doesn\'t exist', async () => {
            // test that checks that an article can't be returned if it doesn't exist
            const res = await request(app)
                .get('/api/articles/not-an-article')
                .set('Authorization', `Token ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.errors.body).toContain('Article not found ');
        });
    });

    describe('PUT /api/articles/:slug', () => {
        it('should update an article\'s title', async () => {
            // test that checks that a specific article is updated
            const article = await Article.create({
                title: 'Test Article',
                slug: 'test-article',
                description: 'This is a test article.',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                userId: testUser.id
            });

            const res = await request(app)
                .put(`/api/articles/${article.slug}`)
                .set('Authorization', `Token ${authToken}`)
                .send({
                    article: { title: 'Test Article Two' }
                });

            expect(res.status).toBe(200);
            expect(res.body.article.title).toBe('Test Article Two');
            expect(res.body.article.slug).toBe('test-article-two');
        });

        it('should fail to update article if article doesn\'t exist', async () => {
            // test that checks that deleting an article fails if the article doesn't exist
            const res = await request(app)
                .put('/api/articles/not-an-article')
                .set('Authorization', `Token ${authToken}`)
                .send({ article: { title: 'Updated Article' } });

            expect(res.status).toBe(404);
            expect(res.body.errors.body).toContain('Article not found ');
        });

        it('should fail to update article if a different user tries to update it', async () => {
            // test that checks that a user's articles can't be updated by a different user
            const otherUser = await User.create({
                username: 'user2',
                email: 'email2@test.com',
                password: 'pass345'
            });

            const article = await Article.create({
                title: 'Test Article Two',
                slug: 'test-article-two',
                description: 'This is a second test article.',
                body: 'Lorem Ipsum.',
                userId: otherUser.id
            });

            const res = await request(app)
                .put(`/api/articles/${article.slug}`)
                .set('Authorization', `Token ${authToken}`)
                .send({ article: { title: 'Our Article :)' } });

            expect(res.status).toBe(403);
            expect(res.body.errors.body).toContain('You are not the author of this article');
        });
    });

    describe('DELETE /api/articles/:slug', () => {
        // tests for DELETE operation

        it('should delete an article', async () => {
            // test that checks that a specific article is deleted
            const article = await Article.create({
                title: 'Test Article',
                slug: 'test-article',
                description: 'This is a test article.',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                userId: testUser.id
            });

            const res = await request(app)
                .delete(`/api/articles/${article.slug}`)
                .set('Authorization', `Token ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message.body).toContain('Article deleted successfully');
        });

        it('should fail to delete article if article doesn\'t exist', async () => {
            // test that checks that deleting an article fails if the article doesn't exist
            const res = await request(app)
                .delete('/api/articles/not-an-article')
                .set('Authorization', `Token ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.errors.body).toContain('Article not found ');
        });

        it('should fail to delete article if a different user tries to delete it', async () => {
            // test that checks that a user's articles can't be deleted by a different user
            const otherUser = await User.create({
                username: 'user2',
                email: 'email2@test.com',
                password: 'pass345'
            });
            const otherToken = await jwtSign({ username: 'user2', email: 'email2@test.com' });

            const article = await Article.create({
                title: 'Test Article',
                slug: 'test-article',
                description: 'This is a test article.',
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent interdum dui nec libero dignissim feugiat. Aenean dapibus risus nec dolor porta vehicula.',
                userId: testUser.id
            });

            const res = await request(app)
                .delete(`/api/articles/${article.slug}`)
                .set('Authorization', `Token ${otherToken}`);

            expect(res.status).toBe(403);
            expect(res.body.errors.body).toContain('You are not the author of this article');
        });
    });
});