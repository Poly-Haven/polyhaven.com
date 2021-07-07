export default async function getPatronInfo(uuid) {
  let returnData = null;
  await fetch(`/api/patronInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid: uuid
    }),
  }).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })
  return returnData
}