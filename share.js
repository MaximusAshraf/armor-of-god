// Network addresses + QR codes. The QR links are what players scan to join / find tools.
const os = require('os');
const QRCode = require('qrcode');

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  }
  return out;
}

const qrSvg = (url, width = 320, margin = 1) => QRCode.toString(url, { type: 'svg', margin, width });

module.exports = { lanAddresses, qrSvg };
