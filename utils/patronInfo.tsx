export async function getPatronInfo(uuid) {
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

export async function setPatronInfo(uuid, data) {
  data.uuid = uuid
  let returnData = null;
  await fetch(`/api/setPatronInfo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })
  return returnData
}