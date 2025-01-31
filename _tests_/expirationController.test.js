const { setExpiration, getExpiration } = require('../controllers/redisController');
const { setAsync, getAsync } = require('../utils/redisHelper');

jest.mock('../utils/redisHelper'); // Mock Redis functions

describe('Redis Controller', () => {
    describe('setExpiration', () => {
        it('should set a key with expiration successfully', async () => {
            const req = { body: { key: 'user:123', value: '{"name": "John"}', expirationTime: 3600 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            setAsync.mockResolvedValue('OK'); // Simulate successful Redis set

            await setExpiration(req, res);

            expect(setAsync).toHaveBeenCalledWith('user:123', 3600, '{"name": "John"}');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Key set with expiration time successfully.' });
        });

        it('should return 400 if key, value, or expirationTime is missing', async () => {
            const req = { body: { key: 'user:123', value: '' } }; // Missing expirationTime
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await setExpiration(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Key, value, and expiration time are required.' });
        });

        it('should handle errors when Redis fails', async () => {
            const req = { body: { key: 'user:123', value: '{"name": "John"}', expirationTime: 3600 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            setAsync.mockRejectedValue(new Error('Redis error'));

            await setExpiration(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error setting key with expiration.' });
        });
    });

    describe('getExpiration', () => {
        it('should retrieve a key successfully', async () => {
            const req = { params: { key: 'user:123' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            getAsync.mockResolvedValue('{"name": "John"}');

            await getExpiration(req, res);

            expect(getAsync).toHaveBeenCalledWith('user:123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ key: 'user:123', value: '{"name": "John"}' });
        });

        it('should return 400 if key is missing', async () => {
            const req = { params: {} }; // No key provided
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await getExpiration(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Key is required.' });
        });

        it('should return 404 if key does not exist', async () => {
            const req = { params: { key: 'user:unknown' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            getAsync.mockResolvedValue(null); // Simulate key not found

            await getExpiration(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Key not found.' });
        });

        it('should handle errors when Redis retrieval fails', async () => {
            const req = { params: { key: 'user:123' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            getAsync.mockRejectedValue(new Error('Redis fetch error'));

            await getExpiration(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving key.' });
        });
    });
});
