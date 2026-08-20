import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'super-secret-jwt-key-2026-quiz-platform';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn() });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
