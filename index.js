const fs = require('fs');
const path = require('path');
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

function loadPlugins(sock, m) {
    const pluginsDir = path.resolve(__dirname, 'plugins');
    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            const plugin = require(path.join(pluginsDir, file));

            // Handle plugins with specific commands and multiple prefixes
            if (typeof plugin.handler === 'function') {
                const message = m.messages[0];
const text = message.extendedTextMessage?.text || message.message.conversation || '';

                // Define possible prefixes
                const prefixes = ['.', '#', '/', '!', '?', '*', '$', '@'];

                // Check if the message starts with any of the prefixes
                const usedPrefix = prefixes.find(prefix => text.startsWith(prefix));
                
                if (usedPrefix) {
                    // Remove the prefix from the text
                    const noPrefix = text.slice(usedPrefix.length).trim();

                    // Extract command and arguments
                    let [command, ...args] = noPrefix.split(/\s+/).filter(v => v);
                    command = (command || '').toLowerCase();

                    // Join remaining arguments as the text
                    const texto = args.join(' ');

                    // Check if the command matches the plugin's command
                    if (plugin.handler.command.test(command)) {

                        // if isOwner
                        const owners = ['212646480851', '212646']
                        const uid = message.key.remoteJid.split('@')[0]
                        if (owners.includes(uid)) {
                            isOwner = true
                        } else {
                            isOwner = false
                        }
                        let isGroup
                        if (message.key.remoteJid.endsWith('@g.us')) {
                            isGroup = true
                        } else {
                            isGroup = false
                        }

                        // Construct the enhanced message object
                        let emessage = {
                            message,
                            fromMe: message.key.fromMe,
                            sender: message.participant || message.key.participant || message.key.remoteJid,
                            chat: message.key.remoteJid,
                            isGroup: isGroup,
                            isOwner: isOwner,
                            mimetype: message.mimetype || false,
                            text: texto,
                            key: message.key,
                            qoute: message.quotedMessage || false,
                        
                        };

                        // Call the plugin handler with the extracted data
                        plugin.handler(emessage, {
                            conn: sock,
                            usedPrefix: usedPrefix,
                            command: command,
                            text: texto,
                        });
                    }
                }
            }

            // Handle plugins without specific commands or prefixes (handlertwo)
            if (typeof plugin.handlertwo === 'function') {
                plugin.handlertwo(m.messages[0], {
                    conn: sock,
                    sender: m.messages[0].key.remoteJid
                });
            }
        }
    });
}

async function str() {
    
const sessionsDir = path.join(__dirname, './sessions');
    fs.readdirSync(sessionsDir).forEach(async session => {
        const sessionDir = path.join(sessionsDir, session);
        // if creds.json not found, delete session
        if (!fs.existsSync(path.join(sessionDir, 'creds.json'))) {
            fs.rmdirSync(sessionDir, { recursive: true });
            console.log(`Session ${session} deleted`);
            return;
        }
        if (fs.lstatSync(sessionDir).isDirectory()) {
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            let conn = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["WIN", "Chrome", "20.0.04"],      
            });

            conn.ev.on('creds.update', saveCreds);

            conn.ev.on('messages.upsert', async m => {
 if (m.messages[0].key.remoteJid.endsWith('@g.us')) {}
                    console.log(JSON.stringify(m, undefined, 2));
      
 
              
                console.log('replying to', m.messages[0].key.remoteJid);
                await delay(500);
                await conn.readMessages([m.messages[0].key])
   await delay(1000);
                await conn.sendPresenceUpdate('composing', m.messages[0].key.remoteJid)
    await delay(1000);                
                loadPlugins(conn, m); // Load plugins dynamically


            });

            conn.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    console.log(`Session for ${session} is now active.`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    conn = makeWASocket({
                        auth: {
                            creds: state.creds,
                            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                        },
                        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                        browser: ["WIN", "Chrome", "20.0.04"],      
                    });
                }
            });
        }
    });
}

str()
// module.exports = str;
