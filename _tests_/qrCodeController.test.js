const QRCode = require('qrcode');
const { generateQRCode } = require('../controllers/qrCodeController');

jest.mock('qrcode'); // Mock QRCode module

describe('generateQRCode', () => {
    const mockShortUrl = 'https://urlzipper.onrender.com/test123';

    it('should generate a QR code successfully', async () => {
        const mockQRCode = 'data:image/png;base64,123456789';
        QRCode.toDataURL.mockResolvedValue(mockQRCode); // Mock QR code generation

        const qrCode = await generateQRCode(mockShortUrl);
        expect(qrCode).toBe(mockQRCode);
        expect(QRCode.toDataURL).toHaveBeenCalledWith(mockShortUrl);
    });

    it('should throw an error if QR code generation fails', async () => {
        QRCode.toDataURL.mockRejectedValue(new Error('QR code generation error'));

        await expect(generateQRCode(mockShortUrl)).rejects.toThrow('QR code generation error');
        expect(QRCode.toDataURL).toHaveBeenCalledWith(mockShortUrl);
    });
});
