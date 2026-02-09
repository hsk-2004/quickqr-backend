import QRCode from 'qrcode';

export const generateQR = async (url) => {
  return await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
  });
};
