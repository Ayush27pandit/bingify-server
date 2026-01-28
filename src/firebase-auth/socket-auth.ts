import admin from './firebaseAuth.js';

export async function socketAuthMiddleware(socket: any, next: any) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn('Socket connection without auth token');
      socket.user = null;
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);

    socket.user = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };

    next();
  } catch (err) {
    console.error('Socket Auth Error:', err);
    socket.user = null;
    next();
  }
}
