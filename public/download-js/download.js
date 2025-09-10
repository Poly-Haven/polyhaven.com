const inMemoryDownload = (function () {
    const ua = UAParser();

    // Test for actual service worker support and streaming
    if (!navigator.serviceWorker) return true;

    // Known problematic browsers
    if (ua.browser.name == 'Edge' && ua.engine.name == 'EdgeHTML') return true;

    // Safari versions before 16 have issues with streaming
    if (ua.browser.name == 'Safari' && parseInt(ua.browser.version) < 16) return true;

    return false;
})();

let downloadStatus = { activeCount: 0 };

if (!inMemoryDownload) {
    document.addEventListener("DOMContentLoaded", async () => {
        console.log('preparing service worker for download...');
        try {
            // prepare service worker
            const swreg = await navigator.serviceWorker.register('/download-sw.js', { scope: '/__download__/' });
            await swreg.update();
            // keep alive ping (required for firefox)
            setInterval(() => {
                try {
                    if (swreg.active) {
                        swreg.active.postMessage({ command: 'ping' });
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }, 1000);
            // status update handler
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.command == 'update-status') {
                    downloadStatus = event.data.status;
                    console.log('downloadStatus=', JSON.stringify(downloadStatus));
                }
            });
            let activeWorker = null;
            setInterval(() => {
                try {
                    if (swreg.active && activeWorker !== swreg.active) {
                        activeWorker = swreg.active;
                        activeWorker.postMessage({ command: 'broadcast-status' });
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }, 1000);
        }
        catch (error) {
            console.error(error);
        }
    });
}

if (UAParser().browser.name == "Firefox") {
    console.log('installing beforeunload handler to prevent window close while downloading...');
    window.addEventListener('beforeunload', function (event) {
        if (downloadStatus && downloadStatus.activeCount > 0) {
            event.preventDefault();
            event.returnValue = '';
            return false;
        }
    });
}

async function testDownload(name, files) {
    console.log('name:', name);
    console.log('files:', JSON.stringify(files, null, 2));
}

async function startDownload(name, files) {
    if (!inMemoryDownload) {
        console.log('using service worker for download...');
        try {
            // prepare service worker
            const swreg = await navigator.serviceWorker.register('/download-sw.js', { scope: '/__download__/' });
            while (!swreg.active) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log('service worker ready');
            // prepare virtual URL
            const url = window.location.origin
                + '/__download__/'
                + new Date().toISOString().slice(0, 19).replace(/[T\-:]/gi, '') + '/'
                + name
                + '.zip';
            console.log('creating download ' + url);
            console.log(JSON.stringify(files, null, 2));
            // configure URL in service worker
            await new Promise(function (resolve, reject) {
                const channel = new MessageChannel();
                channel.port1.addEventListener('message', (event) => {
                    if (event.data.result) {
                        return resolve();
                    }
                    return reject(new Error('could not prepare download' + (event.data.message ? `: ${event.data.message}` : '')));
                });
                channel.port1.start();
                if (!swreg.active) {
                    return reject(new Error('could not find active service worker'));
                }
                swreg.active.postMessage(
                    {
                        command: 'create',
                        data: { url, files },
                    },
                    [channel.port2]
                );
            });
            // start download
            console.log('starting download of ' + url + '...');
            location.href = url;
        } catch (error) {
            console.error('Service worker download failed:', error);
            throw new Error(`Download failed: ${error.message || 'Unknown error, please try again or contact us.'}`);
        }
    }
    else {
        console.log('using in memory assembly for download...');
        // generating zip file
        const zip = new Zip(false);
        downloadStatus.activeCount += 1;
        try {
            // download files
            for (const file of files) {
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
            downloadStatus.activeCount -= 1;
            throw new Error('Download failed. Please check your internet connection and try again.');
        }
        downloadStatus.activeCount -= 1;
        // propagate errors
        if (zip.outputError) {
            throw new Error('ZIP creation failed: ' + (zip.outputError.message || 'Unknown error'));
        }
        // create blob
        let byteChunks = zip.outputBytes;
        if (UAParser().browser.name == 'Edge' && UAParser().engine.name == 'EdgeHTML') {
            console.log('combine byte chunks...');
            byteChunks = [new Uint8Array(zip.outputBytes.reduce((size, chunk) => size + chunk.length, 0))];
            let offset = 0;
            for (const chunk of zip.outputBytes) {
                byteChunks[0].set(chunk, offset);
                offset += chunk.length;
            }
        }
        console.log('creating blob...');
        const blob = new Blob(byteChunks, { type: 'application/zip' });
        blob.lastModifiedDate = new Date();
        blob.name = name + '.zip';
        // start download
        try {
            if (window.navigator.msSaveOrOpenBlob) {
                console.log('starting download of blob...');
                window.navigator.msSaveOrOpenBlob(blob, blob.name);
            } else {
                console.log('creating object URL...');
                const url = URL.createObjectURL(blob);
                console.log('starting download of ' + url + '...');
                location.href = url;
                setTimeout(() => {
                    console.log('revoking object URL...');
                    URL.revokeObjectURL(url);
                }, 10000);
            }
        } catch (error) {
            console.error('Blob download failed:', error);
            throw new Error('Download failed. Your browser may not support this download method.');
        }
    }
}
