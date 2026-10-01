import QRCode from 'qrcode';

/**
 * Generate a printable Data URL (PNG) for a table QR code
 */
export async function generateQrPngDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#1C1917',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate printable SVG string for table QR
 */
export async function generateQrSvgString(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#1C1917',
      light: '#FFFFFF',
    },
  });
}
