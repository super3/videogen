const fs = require('fs').promises;
const path = require('path');
const { getVideos } = require('../utils/videoUtils');

async function getHomePage(req, res) {
    try {
        const videosPath = path.join(__dirname, '../../videos');
        const videos = await getVideos(videosPath);
        const html = await renderHomePage(videos);
        res.send(html);
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Error loading page');
    }
}

async function renderHomePage(videos) {
    const html = await fs.readFile('index.html', 'utf8');
    const videosList = createVideosList(videos);
    
    return html.replace(
        '<ul role="list" class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">',
        `<ul role="list" class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">${videosList}`
    );
}

function createVideosList(videos) {
    return videos.map(video => `
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
}

module.exports = {
    getHomePage
}; 