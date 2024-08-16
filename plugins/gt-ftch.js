const axios = require('axios');
const fs = require('fs');
const path = require('path');

const handler = async (m, { conn, text }) => {
    if (!text) return conn.sendMessage(m.chat, { text: 'Please provide a URL to fetch.' });

    try {
        // Fetch the content from the URL
        const response = await axios.get(text, { responseType: 'arraybuffer' });

        const contentType = response.headers['content-type'];
        const buffer = response.data;

        if (contentType.startsWith('image/')) {
            // If the content is an image, send it as an image file
            await conn.sendMessage(m.chat, { image: buffer, caption: 'Here is the image you requested.' });
        } else if (contentType.startsWith('video/')) {
            // If the content is a video, send it as a video file
            await conn.sendMessage(m.chat, { video: buffer, caption: 'Here is the video you requested.' });
        } else if (contentType.startsWith('text/html')) {
            // If the content is HTML, save it as a .html file and send it
            const filename = `file_${Date.now()}.html`;
            const filePath = path.join(__dirname, filename);
            fs.writeFileSync(filePath, buffer);

            await conn.sendMessage(m.chat, { document: { url: filePath }, mimetype: contentType, fileName: filename });
            fs.unlinkSync(filePath); // Delete the file after sending
        } else if (contentType.startsWith('application/json') || contentType.startsWith('text/plain')) {
            // If the content is JSON or plain text, send it as a text message
            const textContent = buffer.toString('utf-8');
            await conn.sendMessage(m.chat, { text: textContent });
        } else {
            // Otherwise, send the content as a file
            const filename = path.basename(text);
            const filePath = path.join(__dirname, filename);
            fs.writeFileSync(filePath, buffer);

            await conn.sendMessage(m.chat, { document: { url: filePath }, mimetype: contentType, fileName: filename });
            fs.unlinkSync(filePath); // Delete the file after sending
        }
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { text: 'Failed to fetch the content. Please check the URL and try again.' });
    }
};

handler.command = /^(get|fetch)$/i;

module.exports = {handler};
