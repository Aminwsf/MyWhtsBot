const handler = async (m, { conn }) => {
    const start = Date.now(); // تسجل الوقت الحالي
    const {key} = await conn.sendMessage(m.chat, { text: 'Pong!' }); // ترسل رسالة "Pong!"
    const end = Date.now(); // تسجل الوقت بعد استلام الرد
    
    const ping = end - start; // حساب زمن الاستجابة
    
    await conn.sendMessage(m.chat, { text: `Ping: ${ping} ms`, edit: key }); // ترسل زمن الاستجابة للمستخدم
};

handler.command = /^(ping|pingms)$/i;

module.exports = {handler};
