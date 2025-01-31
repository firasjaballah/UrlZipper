const { getAnalytics } = require('../controllers/urlController');
const Url = require('../models/Url');

jest.mock('../models/Url'); // Mock the Mongoose model

describe('Get URL Analytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return analytics for a valid shortId', async () => {
        const req = { params: { shortId: 'abc123' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Url.findOne.mockResolvedValue({
            shortId: 'abc123',
            clicks: 100,
            referrers: new Map([
                ['http://google.com', 50],
                ['http://facebook.com', 30]
            ])
        });

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith({
            clicks: 100,
            referrers: {
                'http://google.com': 50,
                'http://facebook.com': 30
            }
        });
    });

    it('should return 404 if shortId is not found', async () => {
        const req = { params: { shortId: 'nonexistent' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Url.findOne.mockResolvedValue(null);

        await getAnalytics(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'URL not found' });
    });

    it('should handle server errors properly', async () => {
        const req = { params: { shortId: 'abc123' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        Url.findOne.mockRejectedValue(new Error('Database error'));

        await getAnalytics(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
});
