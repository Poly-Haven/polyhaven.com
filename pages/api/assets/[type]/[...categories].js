const asset_types = require('../../../../constants/asset_types.json');

import firestore from '../../../../utils/firestore';

const db = firestore();

export default async (req, res) => {
  const type = asset_types[req.query.type];
  const categories = req.query.categories;

  // TODO Reduce Firestore reads by first getting assets according to least-used category, instead of just top-level one. Will need to separately track which categories are least used, maybe with cloud function.
  const collection = await db.collection('assets').where('type', '==', type).where('categories', 'array-contains', categories[0]).get();
  const docs = {};
  collection.forEach(doc => {
    docs[doc.id] = doc.data();
  });

  if (categories.length > 1) {
    categories.shift();  // Remove the cat we already checked for
    for (const cat in categories){
      for (const id in docs){
        if (!docs[id].categories.includes(categories[cat])){
          delete docs[id];
        }
      }
    }
  }

  res.status(200).json(docs);
}