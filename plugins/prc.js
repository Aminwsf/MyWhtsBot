const axios = require('axios'); // Ensure axios is installed in your project

const handler = async (m, { conn, usedPrefix, command, sender }) => {
    try {
        // Extract the number from m.sender 
      const senderNumber = m.sender.match(/\d+/)[0];

        // Determine whether to use m.text or the extracted sender number for the API request
        const queryValue = m.text ? m.text : senderNumber;

        // Make the GET request to the API using either m.text or the sender number
        const response = await axios.get(`https://morocco.toystack.dev/tl/pair?number=${encodeURIComponent(queryValue)}`);
        const data = response.data; // Axios automatically parses the JSON response

        // Send a message with the response data
        await conn.sendMessage(m.sender, { 
            text: `${queryValue}: ${data.code}`});

    } catch (error) {
        // Handle any errors that occur during the request
        await conn.sendMessage(m.sender, { text: `An error occurred: ${error.message}` });
    }
};

handler.command = /^(bot)$/i;  // Regex for the command

module.exports = { handler };
