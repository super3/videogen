const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const getVideos = require('./utils/getVideos');
const fs = require('fs');
const config = require('./config.json');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for our video output)
app.use('/videos', express.static('videos'));

// Serve the HTML file
app.get('/', async (req, res) => {
    const videosPath = path.join(__dirname, 'videos');
    const videos = await getVideos(videosPath);
    
    // Read the HTML file
    let html = await fs.promises.readFile('index.html', 'utf8');
    
    // Create the videos list HTML with prompts
    const videosList = videos.map(video => `
        <div class="video-item">
            <video width="320" height="240" controls>
                <source src="/videos/${video.filename}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="video-info">
                <p>Created: ${video.created.toLocaleDateString()}</p>
                <p>Filename: ${video.filename}</p>
                ${video.prompt ? `<p>Prompt: ${video.prompt}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    // Insert after the generate button and before the result div
    html = html.replace(
        '<div id="result"></div>',
        `<div id="result"></div>
        <div class="video-container">${videosList}</div>`
    );
    
    res.send(html);
});

// Handle video generation
app.post('/generate', async (req, res) => {
    const apiKey = config.apiKey;
    const timestamp = Date.now();
    const prompt = req.body.prompt;
    const seed = req.body.seed;
    const metadata = {
        prompt: prompt,
        seed: seed,
        timestamp: timestamp,
        created: new Date().toISOString()
    };
    const metadataFilename = `video_${timestamp}.json`;
    const videoFilename = `video_${timestamp}.mp4`;

    try {
        const response = await fetch('https://inference.prodia.com/v2/job', {
            method: 'POST',
            headers: {
                'accept': 'image/jpeg',
                'content-type': 'application/json',
                'authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                type: 'inference.mochi1.txt2vid.v1',
                config: {
                    prompt: req.body.prompt,
                    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000)
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Ensure videos directory exists
        const fs = require('fs');
        if (!fs.existsSync('videos')) {
            fs.mkdirSync('videos');
        }

        // Save the response to a file
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(`videos/${videoFilename}`, Buffer.from(buffer));
        
        // Save the metadata file
        fs.writeFileSync(
            `videos/${metadataFilename}`, 
            JSON.stringify(metadata, null, 2)
        );
        
        res.json({ 
            success: true, 
            filename: videoFilename,
            prompt: prompt,
            seed: seed 
        });
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
