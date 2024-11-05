const fs = require('fs').promises;
const path = require('path');

async function getVideos(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);
        
        const videoStats = await Promise.all(
            files
                .filter(filename => filename.endsWith('.mp4'))
                .map(async (filename) => {
                    const filePath = path.join(directoryPath, filename);
                    const stats = await fs.stat(filePath);
                    
                    // Try to read metadata file
                    let prompt = '';
                    try {
                        const metadataPath = filePath.replace('.mp4', '.json');
                        const metadata = JSON.parse(
                            await fs.readFile(metadataPath, 'utf8')
                        );
                        prompt = metadata.prompt;
                    } catch (err) {
                        // If no metadata file exists, leave prompt empty
                        console.log(`No metadata for ${filename}`);
                    }

                    return {
                        filename,
                        path: filePath,
                        created: stats.birthtime,
                        prompt: prompt
                    };
                })
        );

        return videoStats.sort((a, b) => b.created - a.created);
    } catch (error) {
        console.error('Error reading videos directory:', error);
        return [];
    }
}

module.exports = getVideos; 