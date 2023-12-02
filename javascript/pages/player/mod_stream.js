const QUALITY = '720';
let STREAMS = undefined;

export async function LoadM3U8(id, e) {
    const streams = await loadStreamTunime(id, e);
    fixStreamUrls(streams);
    STREAMS = streams
    if (Hls.isSupported()) {
        let resources = [];
        for (const key in STREAMS) {
            if (Object.hasOwnProperty.call(STREAMS, key)) {
                const element = STREAMS[key];
                let bandwidth = key == '360' ? 800000 : key == '480' ? 1200000 : 2500000;
                let resolution = key == '360' ? '640x360' : key == '480' ? '854x480' : '1280x720';
                resources.push({ bandwidth, resolution, codecs: 'avc1.4d001f,mp4a.40.2', url: element[0].src });
            }
        }
        const blobUrl = generateBlobUrl(resources);
        return blobUrl;
    } else {
        return STREAMS[QUALITY][0].src;
    }
}

function loadStreamTunime(id, e) {
    return new Promise((resolve) => {
        //Сделать загрузку стрима со сервера
        resolve({
            '360': [{ src: '//cloud.kodik-storage.com/useruploads/904a7536-eb72-4ffa-8cee-a6e1bcbc6e12/55ff1f935ecbfcc1c09bb89e746c54be:2023120204/360.mp4:hls:manifest.m3u8' }],
            '480': [{ src: '//cloud.kodik-storage.com/useruploads/904a7536-eb72-4ffa-8cee-a6e1bcbc6e12/55ff1f935ecbfcc1c09bb89e746c54be:2023120204/480.mp4:hls:manifest.m3u8' }],
            '720': [{ src: '//cloud.kodik-storage.com/useruploads/904a7536-eb72-4ffa-8cee-a6e1bcbc6e12/55ff1f935ecbfcc1c09bb89e746c54be:2023120204/720.mp4:hls:manifest.m3u8' }]
        })
    });
}

function fixStreamUrls(streams = {}) {
    for (const key in streams) {
        if (Object.hasOwnProperty.call(streams, key)) {
            const element = streams[key][0];
            if (element) {
                let url = element.src;
                if (!url.includes("http")) {
                    url = `https:${url}`;
                }
                streams[key][0].src = url;
            }
        }
    }
}

//Генерируем adaptive streaming для hls.js
function generateBlobUrl(qualityVariants = [{ bandwidth: 0, resolution: '0x0', codecs: 'avc1.4d001f,mp4a.40.2', url: '' }]) {
    var m3u8Content = '#EXTM3U\n';

    for (var i = 0; i < qualityVariants.length; i++) {
        var quality = qualityVariants[i];
        var variantLine = '#EXT-X-STREAM-INF:BANDWIDTH=' + quality.bandwidth +
            ',RESOLUTION=' + quality.resolution +
            ',CODECS="' + quality.codecs + '"' + '\n' +
            quality.url + '\n';
        m3u8Content += variantLine;
    }

    // Преобразуем строку M3U8 в Blob
    var blob = new Blob([m3u8Content], { type: 'application/vnd.apple.mpegurl' });

    // Создаем URL-объект для Blob
    var blobUrl = URL.createObjectURL(blob);

    return blobUrl;
}