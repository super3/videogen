# videogen

A web application for generating and managing AI-generated videos.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/super3/videogen.git
   cd videogen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a config.json file in the root directory:
   ```json
   {
     "apiKey": "your-prodia-api-key"
   }
   ```

4. Start the server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Features

- Generate AI videos using text prompts
- View gallery of generated videos
- Reuse previous prompts with one click
- Optional seed values for reproducible results
- Automatic metadata storage for each video

## Requirements

- Node.js 14+
- FFmpeg (for video metadata handling)