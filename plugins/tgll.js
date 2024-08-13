const handler = async (m, { conn, usedPrefix, command, text }) => {
  const [chat, msg] = text.split('|');
  if (!chat.endsWith('@g.us') || !msg) return conn.sendMessage(m.chat, { text: 'Please provide a valid group chat and msg\nexomple: ' +usedPrefix +command+ " groupID|hello world!" });
  const participants = await conn.groupMetadata(chat).catch((_) => null);
  /*const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
    const participants = (m.isGroup ? groupMetadata.participants : []) || [];
    */
  
  const participantss = participants.participants
  const groupMembersJid = participantss.map(v => v.id);
  console.log(groupMembersJid)
  await conn.sendMessage(chat, { text: msg, mentions: groupMembersJid })
// send a location!
}

handler.command = /^(tagall)$/i;
module.exports = {handler};
