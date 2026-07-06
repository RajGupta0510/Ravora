import { getUser } from '../utils/supabase.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'ravora_jwt_secret_key_2026';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed token.' });
  }

  try {
    const { data: { user }, error } = await getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = { id: user.id, email: user.email || user.phone };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
