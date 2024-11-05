const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const videoRoutes = require('./routes/videoRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/videos', express.static('videos'));

// Routes
app.use('/', videoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 