const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.get('/youtube/thumbnail', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(response.data, 'binary');
    } catch (error) {
        console.error(`Error proxying YouTube thumbnail: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
