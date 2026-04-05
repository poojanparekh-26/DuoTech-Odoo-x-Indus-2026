// c:\Users\Lenovo-PC\OneDrive\Desktop\DuoTech Odoo x Indus\server\src\utils\upiQR.js

const QRCode = require('qrcode');

/**
 * Generate a UPI deep-link QR code for in-app payment.
 *
 * UPI URL spec: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 *
 * @param {string} upiId      - Payee VPA (e.g. "cafe@upi")
 * @param {number} amount     - Payment amount in INR (e.g. 199.50)
 * @param {string} orderNumber- Human-readable order reference (e.g. "ORD-1712345678901-423")
 * @returns {Promise<{ qrDataUrl: string, upiLink: string, amount: number, upiId: string }>}
 */
async function generateUPIQRCode(upiId, amount, orderNumber) {
  const upiLink =
    `upi://pay` +
    `?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent('OdooCafe')}` +
    `&am=${amount}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(orderNumber)}`;

  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
  });

  return { qrDataUrl, upiLink, amount, upiId };
}

module.exports = { generateUPIQRCode };
