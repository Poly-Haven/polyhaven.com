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

async function getHDRIs(db) {
  const data = await require('../../db_json_hdris.json');
  const collection = db.collection('assets');
  let counter = 0;
  for (const id in data){
    counter++;

    const asset = data[id];

    if (asset.coords){
      asset.coords = new admin.firestore.GeoPoint(asset.coords[0], asset.coords[1]);
    }

    asset.date_published = new admin.firestore.Timestamp(asset.date_published, 0);
    asset.date_taken = new admin.firestore.Timestamp(asset.date_taken, 0);
    asset.type = 0;

    console.log(`${counter}: ${asset.name}`);
    await collection.doc(id).set(asset);
    if (counter === 30){
      break;
    }
  }
}

async function getTextures(db) {
  const data = await require('../../db_json_textures.json');
  const collection = db.collection('assets');
  let counter = 0;
  for (const id in data){
    counter++;

    const asset = data[id];

    asset.date_published = new admin.firestore.Timestamp(asset.date_published, 0);
    asset.type = 1;

    console.log(`${counter}: ${asset.name}`);
    await collection.doc(id).set(asset);
    if (counter === 30){
      break;
    }
  }
}

async function getModels(db) {
  const data = await require('../../db_json_models.json');
  const collection = db.collection('assets');
  let counter = 0;
  for (const id in data){
    counter++;

    const asset = data[id];

    asset.date_published = new admin.firestore.Timestamp(asset.date_published, 0);
    asset.type = 2;

    console.log(`${counter}: ${asset.name}`);
    await collection.doc(id).set(asset);
    if (counter === 30){
      break;
    }
  }
}

const db = admin.firestore();

export default async (req, res) => {
  // getHDRIs(db);
  // getTextures(db);
  getModels(db);
  const collection = await db.collection('assets').get();
  const docs = {};
  collection.forEach(doc => {
    docs[doc.id] = doc.data();
  });

  res.status(200).json(docs);
}