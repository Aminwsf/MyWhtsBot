const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const defaultDir = path.resolve(__dirname, '../plugins'); // مسار مجلد الـPlugins

async function listPluginsWithTags(dir) {
    const pluginsDir = dir || defaultDir;
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    const categorizedPlugins = {};

    for (const file of files) {
        const pluginPath = path.join(pluginsDir, file);
        const plugin = require(pluginPath);

        if (plugin.handler && plugin.handler.tags) {
            for (const tag of plugin.handler.tags) {
                if (!categorizedPlugins[tag]) {
                    categorizedPlugins[tag] = [];
                }
                categorizedPlugins[tag].push(file.replace('.js', ''));
            }
        }
    }
    return categorizedPlugins;
}

const handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const plugins = await listPluginsWithTags();
        const { pushName } = m; // اسم المستخدم
        const prefix = usedPrefix || '/'; // الـ prefix المستخدم
        const date = moment().format('YYYY-MM-DD'); // التاريخ الحالي
        const time = moment().format('HH:mm:ss'); // الوقت الحالي
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2); // إجمالي الذاكرة (RAM)
        const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2); // الذاكرة الفارغة
        const usedMemory = (totalMemory - freeMemory).toFixed(2); // الذاكرة المستخدمة

        let message = `\`\`\`╭═══ SIMPLE BOT ═══⊷

┃❃╭──────────────`;
        message += `┃❃│ *User:* ${m.message.pushName || 'غير معروف'}\n`;
        
        message += `┃❃│ *Date:* ${date}\n`;
        message += `┃❃│ *Time:* ${time}\n`;
        message += `┃❃╰───────────────

╰═════════════════⊷\n\n`;
       /* message += `- *الذاكرة الكلية:* ${totalMemory} MB\n`;
        message += `- *الذاكرة الفارغة:* ${freeMemory} MB\n`;
        message += `- *الذاكرة المستخدمة:* ${usedMemory} MB\n\n`;*/

        

        for (const [tag, pluginList] of Object.entries(plugins)) {
            message += `╭─❏ *${tag.toUpperCase()}* ❏\n`;
            pluginList.forEach(plugin => {
                message += ` │ ${plugin}\n`;
            });
            message += '╰─────────────────\n';
        }

        message += '```'
        await conn.sendMessage(m.chat, { text: message.trim() });
    } catch (error) {
        await conn.sendMessage(m.chat, { text: `خطأ: ${error.message}` });
    }
};

handler.command = /^(menu|help|plugins)$/i; // أوامر لعرض القائمة
handler.tags = ["menu"]; // تصنيف الـ Plugin الخاص بعرض القائمة

module.exports = {handler};
