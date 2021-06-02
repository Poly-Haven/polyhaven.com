// Based on https://github.com/robbederks/downzip - MIT license
// With modifications by https://github.com/core-process/

self.importScripts('download-js/zip.js');

let activeCount = 0;
const downloads = {};

function broadcastStatus() {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          command: 'update-status',
          status: {
            activeCount: activeCount,
          },
        });
      });
    })
    .catch(console.error);
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // get download info
  const download = downloads[event.request.url];
  if (download) {
    // determine zip size and format
    const zipSize = ZipUtils.calculateSize(download);
    console.log('size of zip = ' + zipSize + ' bytes');
    // prepare response
    const zip = new Zip(true);
    event.respondWith(
      new Response(zip.outputStream, {
        headers: new Headers({
          'Content-Type': 'application/zip',
          'Content-Length': zipSize + '',
        })
      })
    );
    // spin off download routine
    activeCount += 1;
    broadcastStatus();
    (async function () {
      try {
        // download files
        for (const file of download) {
          console.log('downloading ' + file.url + '...');
          zip.startFile(file.path);
          const reader = (await fetch(file.url)).body.getReader();
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) {
              break;
            }
            zip.appendData(chunk.value);
          }
          zip.endFile();
        }
        // finalize zip file
        zip.finish();
        console.log('completed successfully');
      } catch (error) {
        console.error(error);
        zip.error(error);
      }
      activeCount -= 1;
      broadcastStatus();
    })();
  }
});

self.addEventListener('error', (event) => {
  console.error(event.error);
});

self.addEventListener('message', (event) => {
  const { data, ports } = event;
  if (data.command == 'ping') {
    return;
  }
  if (data.command == 'broadcast-status') {
    broadcastStatus();
    return;
  }
  if (data.command == 'create') {
    (async function () {
      try {
        const { url, files } = data.data;
        // determine size of files
        const filesParallel = 3;
        for (let i = 0; i < files.length; i += filesParallel) {
          const filesTodo = files.slice(i, i + filesParallel);
          await Promise.all(filesTodo.map(file => async function () {
            console.log('fetching metadata of ' + file.url + '...');
            const response = await fetch(file.url, { method: 'HEAD' });
            if (!response.ok) {
              throw new Error(`could not get meta data of ${file.url}`);
            }
            if (!response.headers.has('content-length')) {
              throw new Error(`could not determine size of ${file.url}`);
            }
            file.size = parseInt(response.headers.get('content-length'));
          }()));
        }
        // add to downloads
        downloads[url] = files;
        ports.forEach(port => port.postMessage({ result: true }));
      }
      catch (error) {
        console.error(error);
        ports.forEach(port => port.postMessage({ result: false, message: error && error.message || 'An unknown error occured' }));
      }
    })()
    return;
  }
  console.error('unknown command: ' + data.command);
});
