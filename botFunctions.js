const { MessageMedia } = require('whatsapp-web.js');

const { config } = require('./config.js')
const {parseAudio} = require('./convertAudioPtt.js')

const {me, senders} = config
const myChatId = `${me}@c.us`


const listenMessages = async (client, msgQueue) => {
    client.on('message_create', async (msgObject) => {
        const { from, to, body, type, hasMedia, fromMe } = msgObject
        let media = ''
        logIncomingMsg(msgObject);

        if (!fromMe) {
            if (hasMedia) {
                try {
                    media = await msgObject.downloadMedia()
                    // console.log('Media download ', media);
                } catch (err) {
                    console.log('Error downloading media: ', media);
                    
                }
            }
            
            resendMsgToMe(client, msgObject, media)
        }

        if (body.startsWith('/schedule') && from === to) {

            // add validation function to check the number and minutes (the args)
            // if there is no match, send an error message and help the user

            const auxContent = body.split(' ')
            const numberES = auxContent[1]
            const recipient = `34${numberES}`
            const min = auxContent[2]
            const content = auxContent.slice(3).join(' ')
            // schedule msg for the recipient i set on the oncoing msg
            msgQueue.scheduleMessage(recipient, content, new Date(Date.now() + min * 60 * 1000));
            
            // send me a message to verify the schedule
            await sendTextMessage(client, myChatId, `Mensaje Programado para enviar en ${min} minutos`)
        }

    })
}

const resendMsgToMe = async (client, msgObject, media) => {
    const { from, body, type, _data } = msgObject
    const parsedFrom = parseFrom(from)
    const notifyName = _data?.notifyName || 'unknown'
    let msgContent
    msgContent = `From ${parsedFrom.sender} [${notifyName}]\n-> ${parsedFrom.chatType} [${type}]`
    
    if (parsedFrom.chatType === 'newsletter') return
    if (parsedFrom.chatType === 'broadcast') return
    if (type === 'chat') {
        msgContent += `\n${body}`
        await sendTextMessage(client, myChatId, msgContent)
    }
    if (type === 'image') {
        msgContent += `\nCaption: ${body}`
        const mimetype = media.mimetype
        const dataBase64 = media.data
        
        //await sendTextMessage(client, myChatId, msgContent)
        await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent)
    }
    if (type === 'video') {
        msgContent += `\nCaption: ${body}`
        const mimetype = media.mimetype
        const dataBase64 = media.data
        
        try {
            await sendTextMessage(client, myChatId, msgContent)
            await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent)
        } catch (err) {
            console.error('Error resending video to me: ', err)
        }
    }
    if (type === 'ptt') {
        const mimetype = media.mimetype
        const dataBase64 = media.data
        if (parsedFrom.chatType === 'chat') {
            const audioText = await parseAudio(mimetype, dataBase64)
            msgContent += `\nAudio Text: ${audioText}`
        }
        await sendTextMessage(client, myChatId, msgContent)
        await sendFileBase64(client, myChatId, mimetype, dataBase64, msgContent)
    }
}

const sendTextMessage = async (client, to, msg) => { 
    console.log('hay que enviar msg:\n', msg)
    try {
        await client.sendMessage(to, msg)
        console.log(`Message sent to ${to}: ${msg}`)
    } catch (err) {
        console.error(err)
    }
    
}

const sendFileBase64 = async (client, to, mimetype, data, msgContent) => {
    const auxFile = new MessageMedia(mimetype, data);
    await client.sendMessage(to, auxFile, { caption: msgContent });
    console.log(`File sent to ${to}`);
};

const sendLocalFile = (client, to, file) => {
    const auxFile = new MessageMedia.fromFilePath(`.\\media\\${file}`);
    client.sendMessage(to, auxFile);
    console.log(`Se envió la imagen ${file}`)
}

const parseFrom = (from) => {
    const chatId = from.slice(0, from.indexOf('@'))
    const dotExists = from.includes('.')
    let chatType = from.slice(from.indexOf('@') + 1, dotExists ? from?.indexOf('.') : from.length)
    // get the characters after the '.' til the end
    const usType = dotExists ? from.slice(from.indexOf('.') + 1) : ''
    
    const sender = senders[chatId] ? `*${senders[chatId]}*` : chatId
    

    if (chatType === 'c') chatType = 'chat'
    if (chatType === 'g') chatType = 'group'
    
    return {
        sender,
        chatType,
        usType
    }
}

const logIncomingMsg = (msgObject) => {
    const { from, to, body, type, hasMedia, fromMe } = msgObject

    console.log(`-------
📨 Incoming message:
    ‣> 💬 From: ${from}
    ‣> 👂 To: ${to}
    ‣> 📝 Body: ${body}
    ‣> 📱 Type: ${type}
    ‣> 📸 Has media: ${hasMedia}
    ‣> 🙎‍♂️ From me: ${fromMe}
-------`);
    
}

module.exports = {
    listenMessages
}






