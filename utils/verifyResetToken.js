import crypto from 'crypto';

export default (resetToken) =>
  crypto.createHash('sha256').update(resetToken).digest('hex');
