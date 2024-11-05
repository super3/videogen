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
        <li class="relative">
            <div class="group block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <video controls class="w-full h-auto object-cover">
                    <source src="/videos/${video.filename}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="mt-2 flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900 group flex items-center">
                    <span class="truncate max-w-[200px]">${video.prompt || 'No prompt provided'}</span>
                    <button onclick="fillPrompt(\`${video.prompt.replace(/`/g, '\\`')}\`)" 
                            class="ml-2 text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        Use Prompt
                    </button>
                </p>
            </div>
            <p class="block text-sm font-medium text-gray-500">
                ${video.seed ? `Seed: ${video.seed}` : ''}
            </p>
        </li>
    `).join('');
    
    // Replace the ul content
    html = html.replace(
        '<ul role="list" class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">',
        `<ul role="list" class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">${videosList}`
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
