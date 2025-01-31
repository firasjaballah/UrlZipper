const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Import your Express app
const Url = require('../models/Url');
const validUrl = require('valid-url');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('URL Shortener API', () => {
    test('should return an error for invalid URLs', async () => {
        const response = await request(app).post('/shorten').send({ longUrl: 'invalid-url' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL');
    });

    test('should shorten a valid URL', async () => {
        const response = await request(app).post('/shorten').send({ longUrl: 'http://example.com' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('shortUrl');
        expect(response.body).toHaveProperty('qrCode');
    });

    test('should handle custom alias', async () => {
        const response = await request(app).post('/shorten').send({ longUrl: 'http://example.com', customAlias: 'custom123' });
        expect(response.status).toBe(200);
        expect(response.body.shortUrl).toContain('custom123');
    });

    test('should return an error if custom alias is already taken', async () => {
        await Url.create({ longUrl: 'http://example.com', shortId: 'taken123', customAlias: 'taken123' });
        const response = await request(app).post('/shorten').send({ longUrl: 'http://example.com', customAlias: 'taken123' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Custom alias already taken');
    });

    test('should redirect to original URL', async () => {
        await Url.create({ longUrl: 'http://example.com', shortId: 'redirect123' });
        const response = await request(app).get('/redirect123');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('http://example.com');
    });

    test('should return 404 for non-existent short URL', async () => {
        const response = await request(app).get('/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('URL not found');
    });

    test('should return 410 for expired URLs', async () => {
        const expiredUrl = new Url({
            longUrl: 'http://example.com',
            shortId: 'expired123',
            expiresAt: new Date(Date.now() - 1000),
        });
        await expiredUrl.save();

        const response = await request(app).get('/expired123');
        expect(response.status).toBe(410);
        expect(response.body.error).toBe('URL has expired');
    });
});
