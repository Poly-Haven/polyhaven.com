const asset_types = require('../../../../constants/asset_types.json');

import firestore from '../../../../utils/firestore';

const db = firestore();

export default async (req, res) => {
  const type = asset_types[req.query.type];

  // TODO Reduce Firestore reads by first getting assets according to least-used category, instead of just top-level one. Will need to separately track which categories are least used, maybe with cloud function.
  console.log("Get assets");
  const collection = await db.collection('assets').where('type', '==', type).get();
  const docs = {};
  collection.forEach(doc => {
    docs[doc.id] = doc.data();
  });

  res.status(200).json(docs);
}