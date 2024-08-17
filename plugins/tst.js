const handler = async (m, { conn, usedPrefix, command, sender }) => {
    
    if (m.isOwner) return conn.sendMessage(m.chat, { text: 'Owner\'s Own'})
        // Your logic here
    
    await conn.sendMessage(m.sender, { text: `sender: ${m.sender}\nchat: ${m.chat}\nisOwner: ${m.isOwner}\nusedPrefix: ${usedPrefix}\ncommand: ${command}\ntext: ${m.text}\nchat type: ${m.isGroup ? 'in group' : 'in private chat'}\nfromMe: ${m.fromMe}` });

};

handler.command = /^(test)$/i;  // Regex for the command
handler.tags = ["owner"];
handler.cmd = ["test"]

module.exports = { handler };
