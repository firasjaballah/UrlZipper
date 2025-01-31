const { bulkShorten } = require('../controllers/urlController');
const Url = require('../models/Url');
const shortid = require('shortid');

jest.mock('../models/Url'); // Mock the Mongoose model
jest.mock('shortid', () => ({ generate: jest.fn() }));

describe('Bulk Shorten URLs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully shorten multiple URLs', async () => {
        const req = { body: { urls: ['http://example.com', 'http://google.com'] } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        shortid.generate
            .mockReturnValueOnce('abc123')
            .mockReturnValueOnce('xyz789');

        Url.prototype.save = jest.fn().mockResolvedValue();

        await bulkShorten(req, res);

        expect(res.json).toHaveBeenCalledWith({
            shortUrls: [
                { longUrl: 'http://example.com', shortUrl: `${process.env.BASE_URL}/abc123` },
                { longUrl: 'http://google.com', shortUrl: `${process.env.BASE_URL}/xyz789` }
            ]
        });
    });

    it('should return 400 for invalid input (not an array)', async () => {
        const req = { body: { urls: 'not-an-array' } }; // Invalid format
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await bulkShorten(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input' });
    });

    it('should return 400 for an empty array', async () => {
        const req = { body: { urls: [] } }; // Empty list
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await bulkShorten(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input' });
    });

    it('should handle server errors properly', async () => {
        const req = { body: { urls: ['http://example.com'] } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Url.prototype.save.mockRejectedValue(new Error('Database error'));

        await bulkShorten(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
});
