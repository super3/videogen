const express = require('express');
const router = express.Router();
const { generateVideo } = require('../controllers/videoController');
const { getHomePage, getAllVideos } = require('../controllers/pageController');
const { handleSubscription } = require('../controllers/subscriptionController');

router.get('/', getHomePage);
router.get('/all-videos', getAllVideos);
router.post('/generate', generateVideo);
router.post('/subscribe', handleSubscription);

module.exports = router; 