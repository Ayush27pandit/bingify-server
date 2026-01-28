import admin from 'firebase-admin';
import 'dotenv/config';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  let formattedKey = privateKey;

  try {
    // Render/Vercel often pass the key as a quoted string. JSON.parse handles this perfectly.
    formattedKey = JSON.parse(privateKey);
  } catch (e) {
    // Fallback for raw keys or non-JSON strings
    formattedKey = privateKey.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '');
  }

  formattedKey = formattedKey.trim();

  // Safe debug log for production (shows if the new code is active)
  const startsWithBegin = formattedKey.startsWith('-----BEGIN PRIVATE KEY-----');
  const endsWithEnd = formattedKey.includes('-----END PRIVATE KEY-----');

  console.log(`[Firebase] Init Attempt - New Code Active`);
  console.log(`[Firebase] Key Stats - Length: ${formattedKey.length}, Starts: ${startsWithBegin}, Ends: ${endsWithEnd}`);

  if (!startsWithBegin || !endsWithEnd) {
    console.warn('[Firebase] WARNING: Private key format looks suspicious. Ensure it starts with BEGIN and ends with END.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: formattedKey,
    }),
  });
} else {
  console.error('[Firebase] CRITICAL: FIREBASE_PRIVATE_KEY is missing from environment variables!');
}

export default admin;
