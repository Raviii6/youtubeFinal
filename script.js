// Global variable to store the channel ID
let channelID = '';

// List of API keys
const apiKeys = [
    "AIzaSyAfH3QVSjXJjp73lHbUTUxFzauSt18B6hU",
    "AIzaSyAsmRfEJA8rAkXJXvTsctHc9f8OAbjk1tM",
    "AIzaSyDRzsVLcQ3z83vIjt8JLaPL75qGpfDDKUs",
    // Add more API keys as needed
];

// Function to clear existing thumbnails
const clearThumbnails = () => {
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    thumbnailsContainer.innerHTML = '';
};

// Function to fetch the highest resolution thumbnail for a video using an API key Code (4)
const fetchHighestResolutionThumbnailForVideo = (videoID, apiKey) => {
    return fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const thumbnailsContainer = document.getElementById('thumbnails-container');

            // Get the highest resolution thumbnail (maxres) if available
            const maxResThumbnail = data.items[0].snippet.thumbnails.maxres;

            // If max resolution is not available, try high, medium, and default resolutions in order
            const thumbnail = maxResThumbnail
                || data.items[0].snippet.thumbnails.high
                || data.items[0].snippet.thumbnails.medium
                || data.items[0].snippet.thumbnails.default;

            const title = data.items[0].snippet.title;

            if (thumbnail) {
                const thumbnailElement = document.createElement('div');
                thumbnailElement.innerHTML = `
                    <img src="${thumbnail.url}" alt="${title}" class="thumbnail-img" data-video-id="${videoID}" data-title="${title}">
                    <p class="thumbnail-title">${title}</p>
                `;
                thumbnailsContainer.appendChild(thumbnailElement);

                // Add click event listener to the thumbnail for downloading
                thumbnailElement.addEventListener('click', () => downloadThumbnailAsBlob(thumbnail.url, title));
            }
        })
        .catch(error => {
            console.error(`Error fetching highest resolution thumbnail for video ${videoID} with API key ${apiKey}:`, error);
            throw error; // Propagate the error for further handling
        });
};

/// Function to download the thumbnail as a Blob
const downloadThumbnailAsBlob = (url, title) => {
    const proxyUrl = `http://127.0.0.1:3000/youtube/thumbnail?url=${encodeURIComponent(url)}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', proxyUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
        if (xhr.status === 200) {
            const blob = new Blob([xhr.response], { type: 'image/jpeg' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${title}_thumbnail.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    xhr.send();
};





// Your existing JavaScript code goes here...


// Function to fetch all video IDs in a channel's uploads playlist using an API key Code (3)
const fetchVideoIDsForChannel = apiKey => {
    return fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelID}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const uploadsPlaylistID = data.items[0].contentDetails.relatedPlaylists.uploads;
            return fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistID}&maxResults=50&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    return data.items.map(item => item.contentDetails.videoId);
                });
        })
        .catch(error => {
            console.error(`Error fetching video IDs for channel ${channelID} with API key ${apiKey}:`, error);
            throw error; // Propagate the error for further handling
        });
};

// Function to iterate through video IDs and fetch highest resolution thumbnails for all videos in a channel using all API keys Code (2)
const iterateAndFetchHighestResolutionThumbnailsForChannel = async () => {
    for (const apiKey of apiKeys) {
        try {
            const videoIDs = await fetchVideoIDsForChannel(apiKey);

            const fetchThumbnailPromises = videoIDs.map(videoID => fetchHighestResolutionThumbnailForVideo(videoID, apiKey));

            await Promise.all(fetchThumbnailPromises);
            // If successful, break out of the loop
            break;
        } catch (error) {
            // Try the next API key if an error occurs
            console.warn(`Trying next API key due to error: ${error.message}`);
        }
    }
};

// Your existing JavaScript code goes here... Code (1)

document.addEventListener('DOMContentLoaded', () => {
    const getThumbnailsBtn = document.getElementById('getThumbnailsBtn');

    getThumbnailsBtn.addEventListener('click', () => {
        const channelIdInput = document.getElementById('channelId');
        const channelId = channelIdInput.value.trim();

        if (channelId) {
            clearThumbnails(); // Clear existing thumbnails
            channelID = channelId; // Update global channelID variable
            iterateAndFetchHighestResolutionThumbnailsForChannel();
        } else {
            alert('Please enter a valid Channel ID.');
        }
    });
});
