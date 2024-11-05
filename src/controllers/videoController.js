const fs = require('fs');
const config = require('../config.json');

async function generateVideo(req, res) {
    const { prompt, seed } = req.body;
    const timestamp = Date.now();
    const metadata = createMetadata(prompt, seed, timestamp);
    const filenames = getFilenames(timestamp);

    try {
        const videoBuffer = await fetchVideoFromAPI(prompt, seed);
        await saveVideoFiles(videoBuffer, filenames, metadata);
        
        res.json({ 
            success: true, 
            filename: filenames.video,
            prompt,
            seed 
        });
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

function createMetadata(prompt, seed, timestamp) {
    return {
        prompt,
        seed,
        timestamp,
        created: new Date().toISOString()
    };
}

function getFilenames(timestamp) {
    return {
        video: `video_${timestamp}.mp4`,
        metadata: `video_${timestamp}.json`
    };
}

async function fetchVideoFromAPI(prompt, seed) {
    const response = await fetch('https://inference.prodia.com/v2/job', {
        method: 'POST',
        headers: {
            'accept': 'image/jpeg',
            'content-type': 'application/json',
            'authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            type: 'inference.mochi1.txt2vid.v1',
            config: {
                prompt,
                seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000)
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.arrayBuffer();
}

async function saveVideoFiles(videoBuffer, filenames, metadata) {
    ensureVideosDirectory();
    
    await fs.promises.writeFile(
        `videos/${filenames.video}`, 
        Buffer.from(videoBuffer)
    );
    
    await fs.promises.writeFile(
        `videos/${filenames.metadata}`, 
        JSON.stringify(metadata, null, 2)
    );
}

function ensureVideosDirectory() {
    if (!fs.existsSync('videos')) {
        fs.mkdirSync('videos');
    }
}

module.exports = {
    generateVideo
}; 