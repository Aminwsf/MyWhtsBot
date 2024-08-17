const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const defaultDir = path.resolve(__dirname, '../plugins'); // مسار مجلد الـPlugins

async function listCommandsWithTags(dir) {
        const pluginsDir = dir || defaultDir;
            const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
                const categorizedCommands = {};

                    for (const file of files) {
                            const pluginPath = path.join(pluginsDir, file);
                                    const plugin = require(pluginPath);

                                            if (plugin.handler && plugin.handler.tags && plugin.handler.cmd) {
                                                        for (const tag of plugin.handler.tags) {
                                                                        if (!categorizedCommands[tag]) {
                                                                                            categorizedCommands[tag] = [];
                                                                                                            }
                                                                                                                            plugin.handler.cmd.forEach(cmd => {
                                                                                                                                                categorizedCommands[tag].push(cmd);
                                                                                                                                                                });
                                                                                                                                                                            }
                                                                                                                                                                                    }
                                                                                                                                                                                        }
                                                                                                                                                                                            return categorizedCommands;
                                                                                                                                                                                           } 


const handler = async (m, { conn, usedPrefix, command }) => {
    const start = Date.now(); // تسجل الوقت الحالي
    const {key} = await conn.sendMessage(m.chat, { text: '```Loading...```' }); // ترسل رسالة "Pong!"
    const end = Date.now(); // تسجل الوقت بعد استلام الرد
    
    const ping = end - start;
    try {
        const plugins = await listCommandsWithTags();
        const { pushName } = m.message; // اسم المستخدم
        const prefix = usedPrefix || '/'; // الـ prefix المستخدم
        const date = moment().format('YYYY-MM-DD'); // التاريخ الحالي
        const time = moment().format('HH:mm:ss'); // الوقت الحالي
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2); // إجمالي الذاكرة (RAM)
        const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2); // الذاكرة الفارغة
        const usedMemory = (totalMemory - freeMemory).toFixed(2); // الذاكرة المستخدمة

        let message = `\`\`\`╭═══ SIMPLE BOT ═══⊷
┃❃╭──────────────\n`;
        message += `┃❃│ User: ${pushName || 'unknown'}\n`;
        message += `┃❃│ Chat: ${m.isGroup ? 'in group' : 'in private'}\n`
        message += `┃❃│ Time: ${time}\n`;
        message += `┃❃│ Date: ${date}\n`;
        message += `┃❃│ Ping: ${ping} ms\n`;
        message += `┃❃│ Version: 1.0.1\n`;
        message += `┃❃╰───────────────
╰═════════════════⊷\n\n`;
       /* message += `- *الذاكرة الكلية:* ${totalMemory} MB\n`;
        message += `- *الذاكرة الفارغة:* ${freeMemory} MB\n`;
        message += `- *الذاكرة المستخدمة:* ${usedMemory} MB\n\n`;*/

        

        for (const [tag, pluginList] of Object.entries(plugins)) {
            message += `╭─❏ ${tag.toUpperCase()} ❏\n`;
            pluginList.forEach(plugin => {
                message += `│ ${plugin}\n`;
            });
            message += '╰─────────────────\n';
        }

        message += '```'
        await conn.sendMessage(m.chat, { text: message.trim(), edit: key });
    } catch (error) {
        await conn.sendMessage(m.chat, { text: `خطأ: ${error.message}`, edit: key });
    }
};

handler.command = /^(menu|help|plugins)$/i; // أوامر لعرض القائمة
handler.tags = ["menu"]; // تصنيف الـ Plugin الخاص بعرض القائمة
handler.cmd = ["menu", "help"]

module.exports = {handler};
