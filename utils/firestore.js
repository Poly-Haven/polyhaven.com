const firestore = () => {
  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    console.log("Firebase init")
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
  }

  return admin.firestore();
}

export default firestore;