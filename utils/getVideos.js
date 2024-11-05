const fs = require('fs').promises;
const path = require('path');

async function getVideos(videosPath) {
    try {
        // Create videos directory if it doesn't exist
        try {
            await fs.access(videosPath);
        } catch {
            await fs.mkdir(videosPath);
            return [];
        }

        // Get all files in the videos directory
        const files = await fs.readdir(videosPath);
        
        // Filter for MP4 files and their corresponding JSON metadata
        const videos = [];
        for (const file of files) {
            if (file.endsWith('.mp4')) {
                const videoPath = path.join(videosPath, file);
                const jsonPath = videoPath.replace('.mp4', '.json');
                
                try {
                    const stats = await fs.stat(videoPath);
                    let metadata = {};
                    
                    // Try to read the metadata file if it exists
                    try {
                        const jsonContent = await fs.readFile(jsonPath, 'utf8');
                        metadata = JSON.parse(jsonContent);
                    } catch (e) {
                        // Metadata file doesn't exist or is invalid
                        console.log(`No metadata found for ${file}`);
                    }
                    
                    videos.push({
                        filename: file,
                        created: new Date(stats.mtime),
                        prompt: metadata.prompt || '',
                        seed: metadata.seed || ''
                    });
                } catch (e) {
                    console.error(`Error processing ${file}:`, e);
                }
            }
        }
        
        // Sort videos by creation date, newest first
        return videos.sort((a, b) => b.created - a.created);
    } catch (error) {
        console.error('Error reading videos directory:', error);
        return [];
    }
}

module.exports = getVideos; 