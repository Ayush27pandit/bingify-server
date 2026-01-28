import express from 'express';
import admin from '../firebase-auth/firebaseAuth.js';
import prisma from '../lib/db.js';

const router = express.Router();

router.post('/session', async (req, res) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'No token' });
  }
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log('decoded data: ', decoded);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('session', token, {
      httpOnly: true,
      secure: true, // Always true for cross-site cookies
      sameSite: 'none',
    });
    //add user detail to db
    if (!decoded.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check for existing user by ID or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: decoded.uid }, { email: decoded.email }],
      },
    });

    let user;
    if (existingUser) {
      if (existingUser.id !== decoded.uid) {
        // Migration: delete old record with cuid and create new with firebase uid
        // This is safe because it's a one-time migration and preserves email uniqueness
        await prisma.user.delete({ where: { id: existingUser.id } });
        user = await prisma.user.create({
          data: {
            id: decoded.uid,
            name: decoded.name ?? decoded.email,
            email: decoded.email,
            picture: decoded.picture ?? '',
          },
        });
        console.log(`Migrated user ${decoded.email} from ${existingUser.id} to ${decoded.uid}`);
      } else {
        // Standard update
        user = await prisma.user.update({
          where: { id: decoded.uid },
          data: {
            name: decoded.name ?? decoded.email,
            picture: decoded.picture ?? '',
            email: decoded.email,
          },
        });
      }
    } else {
      // New user
      user = await prisma.user.create({
        data: {
          id: decoded.uid,
          name: decoded.name ?? decoded.email,
          email: decoded.email,
          picture: decoded.picture ?? '',
        },
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({ success: true });
});

export default router;
