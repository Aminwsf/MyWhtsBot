const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const defaultDir = path.resolve(__dirname, '../'); // المسار الافتراضي

// وظيفة لمساعدتك في الحصول على مسار مخصص أو افتراضي
function getFilePath(name, dir) {
    return path.join(dir || defaultDir, name);
}

// وظائف مساعدة للـPlugins
async function listPlugins(dir) {
    const pluginsDir = getFilePath('', dir);
    const files = await readdir(pluginsDir);
    return files.filter(file => file.endsWith('.js'));
}

async function savePlugin(name, content, dir) {
    const filePath = getFilePath(`${name}.js`, dir);
    await writeFile(filePath, content);
    return `تم حفظ الـPlugin ${name} بنجاح.`;
}

async function getPlugin(name, dir) {
    const filePath = getFilePath(`${name}.js`, dir);
    if (!fs.existsSync(filePath)) throw new Error('الـPlugin غير موجود.');
    try {
        const content = await readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        throw new Error(`خطأ في قراءة الـPlugin: ${error.message}`);
    }
}

async function deletePlugin(name, dir) {
    const filePath = getFilePath(`${name}.js`, dir);
    if (!fs.existsSync(filePath)) throw new Error('الـPlugin غير موجود.');
    await unlink(filePath);
    return `تم حذف الـPlugin ${name} بنجاح.`;
}

// وظائف مساعدة للملفات
async function listFiles(dir) {
    const filesDir = getFilePath('', dir);
    const files = await readdir(filesDir);
    return files;
}

async function saveFile(name, content, dir) {
    const filePath = getFilePath(name, dir);
    await writeFile(filePath, content);
    return `تم حفظ الملف ${name} بنجاح.`;
}

async function getFile(name, dir) {
    const filePath = getFilePath(name, dir);
    if (!fs.existsSync(filePath)) throw new Error('الملف غير موجود.');
    try {
        const content = await readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        throw new Error(`خطأ في قراءة الملف: ${error.message}`);
    }
}

async function deleteFile(name, dir) {
    const filePath = getFilePath(name, dir);
    if (!fs.existsSync(filePath)) throw new Error('الملف غير موجود.');
    await unlink(filePath);
    return `تم حذف الملف ${name} بنجاح.`;
}

// معالج الأوامر
const handler = async (m, { conn, command, text }) => {
    if (m.isOwner) return conn.sendMessage(m.chat, { text: 'Owner\'s Own'})
    const [cmd, ...args] = text.split(/\s+/);
    const dir = args[0] && !args[0].startsWith('.') ? args.shift() : null; // التعامل مع المسار

    try {
        switch (command) {
            case 'saveplugin':
                const [pluginName, ...pluginContent] = args;
                if (!pluginName || pluginContent.length === 0) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الـPlugin والمحتوى.' });
                    return;
                }
                const savePluginResult = await savePlugin(pluginName, pluginContent.join(' '), dir);
                await conn.sendMessage(m.chat, { text: savePluginResult });
                break;
            
            case 'getplugin':
                const [getPluginName] = args;
                if (!getPluginName) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الـPlugin.' });
                    return;
                }
                try {
                    const pluginResult = await getPlugin(getPluginName, dir);
                    await conn.sendMessage(m.chat, { text: `محتوى الـPlugin ${getPluginName}:\n${pluginResult}` });
                } catch (error) {
                    await conn.sendMessage(m.chat, { text: `خطأ: ${error.message}` });
                }
                break;
            
            case 'delplugin':
                const [delPluginName] = args;
                if (!delPluginName) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الـPlugin.' });
                    return;
                }
                const delPluginResult = await deletePlugin(delPluginName, dir);
                await conn.sendMessage(m.chat, { text: delPluginResult });
                break;
            
            case 'listplugin':
                const plugins = await listPlugins(dir);
                await conn.sendMessage(m.chat, { text: `الـPlugins المتاحة:\n${plugins.join('\n')}` });
                break;
            
            case 'savefile':
                const [fileName, ...fileContent] = args;
                if (!fileName || fileContent.length === 0) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الملف والمحتوى.' });
                    return;
                }
                const saveFileResult = await saveFile(fileName, fileContent.join(' '), dir);
                await conn.sendMessage(m.chat, { text: saveFileResult });
                break;
            
            case 'getfile':
                const [getFileName] = args;
                if (!getFileName) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الملف.' });
                    return;
                }
                try {
                    const fileResult = await getFile(getFileName, dir);
                    await conn.sendMessage(m.chat, { text: `محتوى الملف ${getFileName}:\n${fileResult}` });
                } catch (error) {
                    await conn.sendMessage(m.chat, { text: `خطأ: ${error.message}` });
                }
                break;
            
            case 'delfile':
                const [delFileName] = args;
                if (!delFileName) {
                    await conn.sendMessage(m.chat, { text: 'يرجى توفير اسم الملف.' });
                    return;
                }
                const delFileResult = await deleteFile(delFileName, dir);
                await conn.sendMessage(m.chat, { text: delFileResult });
                break;
            
            case 'listfile':
                const files = await listFiles(dir);
                await conn.sendMessage(m.chat, { text: `الملفات المتاحة:\n${files.join('\n')}` });
                break;
            
            default:
                await conn.sendMessage(m.chat, { text: 'أمر غير معروف. يرجى استخدام saveplugin، getplugin، delplugin، listplugin، savefile، getfile، delfile، أو listfile.' });
                break;
        }
    } catch (error) {
        await conn.sendMessage(m.chat, { text: `خطأ: ${error.message}` });
    }
};

handler.command = /^(saveplugin|getplugin|delplugin|listplugin|savefile|getfile|delfile|listfile)$/i;
handler.tags = ["owner"];
handler.cmd = ["saveplugin", "getplugin"]

module.exports = {handler};
