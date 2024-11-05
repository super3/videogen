const express = require('express');
const router = express.Router();
const { generateVideo } = require('../controllers/videoController');
const { getHomePage, getAllVideos } = require('../controllers/pageController');

router.get('/', getHomePage);
router.get('/all-videos', getAllVideos);
router.post('/generate', generateVideo);

module.exports = router; 