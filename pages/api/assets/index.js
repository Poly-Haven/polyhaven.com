import firestore from '../../../utils/firestore';

const db = firestore();

export default async (req, res) => {
  const collection = await db.collection('assets').get();
  const docs = {};
  collection.forEach(doc => {
    docs[doc.id] = doc.data();
  });

  res.status(200).json(docs);
}