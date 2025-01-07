const fs = require('fs').promises
const { config } = require('./config.js')

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const { me, senders } = config
const myChatId = `${me}@c.us`

const client = new Client({
    puppeteer: {
        headless: true,
        //args: [
        //         '--no-sandbox',
        //         '--disable-setuid-sandbox',
        //     ]
        },
    authStrategy: new LocalAuth({
        clientId: 'mtm',
    }),
})

client.on('qr', qr => {
    qrcode.generate(qr, {small: true})
})

client.on('remote_session_saved', () => {
    console.log('Session saved successfully')
})

client.on('ready', () => {
    console.log('Client is ready!')
    listenMessages()
})

client.initialize()


//FUNCTIONS

const listenMessages = async () => {
    client.on('message', async (msgObject) => {
        const { from, to, body, type, hasMedia } = msgObject
        let media = ''
        console.log(JSON.stringify(msgObject));
        console.log('From ', from)
        console.log('To', to)
        console.log('Body', body)
        console.log('Type', type)

        
        if (hasMedia) {
            media = await msgObject.downloadMedia()
            console.log('Media download ', media);
        }

        resendMsgToMe(msgObject, media)

    })
}

const resendMsgToMe = async (msgObject, media) => {
    const { from, body, type, _data } = msgObject
    const parsedFrom = parseFrom(from)
    const notifyName = _data?.notifyName || 'unknown'
    let msgContent
    msgContent = `From ${parsedFrom.sender} [${notifyName}]\n-> ${parsedFrom.chatType} [${type}]`
    
    if (parsedFrom.chatType === 'newsletter') return
    if (type === 'chat') {
        msgContent += `\n${body}`
        await sendTextMessage(myChatId, msgContent)
    }
    if (type === 'image') {
        msgContent += `\nCaption: ${body}`
        const mimetype = media.mimetype
        const dataBase64 = media.data
        
        await sendTextMessage(myChatId, msgContent)
        await sendFileBase64(myChatId, mimetype, dataBase64, msgContent)
    }
    if (type === 'ptt') {
        const mimetype = media.mimetype
        const dataBase64 = media.data
        await sendTextMessage(myChatId, msgContent)
        await sendFileBase64(myChatId, mimetype, dataBase64, msgContent)
    }
}

const parseFrom = (from) => {
    const chatId = from.slice(0, from.indexOf('@'))
    const dotExists = from.includes('.')
    let chatType = from.slice(from.indexOf('@') + 1, dotExists ? from?.indexOf('.') : from.length)
    // get the characters after the '.' til the end
    const usType = dotExists ? from.slice(from.indexOf('.') + 1) : ''
    
    const sender = senders[chatId] || chatId
    

    if (chatType === 'c') chatType = 'chat'
    if (chatType === 'g') chatType = 'group'
    
    return {
        sender,
        chatType,
        usType
    }
}

const sendTextMessage = async (to, msg) => { 
    console.log('hay que enviar msg:\n', msg)
    try {
        await client.sendMessage(to, msg)
        console.log(`Message sent to ${to}: ${msg}`)
    } catch (err) {
        console.error(err)
    }
    
}

const sendFile = (to, file) => {
    const auxFile = new MessageMedia.fromFilePath(`.\\media\\${file}`);
    client.sendMessage(to, auxFile);
    console.log(`Se envió la imagen ${file}`)

}

const sendFileBase64 = async (to, mimetype, data, msgContent) => {
    const auxFile = new MessageMedia(mimetype, data)
    await client.sendMessage(to, auxFile, {caption: msgContent})
    console.log(`Se envió la imagen`)

}



const imageBase64example = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAKAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAABAEDBgUCAQEBAQEAAAAAAAAAAAAAAAABAAID/9oADAMBAAIQAxAAAADPa/HdZNFKzMwSVh58yTGtyWsa89k5G5Vzn0ZaQ9z1zlG81859AH7+e9luPZCPNCzFgOXgMb//xAAmEAACAwABAgQHAAAAAAAAAAABAgADESEEEgUiMWEQExQgMkFC/9oACAEBAAE/AACOZ0p7qKz7fYDhlHiboApUZKOoW5QQfiBphMovepwVMpsFtYYTIDkEqpssIwTpKlqqVQZkHTJ3+xn0qg+WUAI2RbsJiXztsRw0S+t/6wzvO+WFt7c9YbDX+UV67QUPDS3piryoL2jnIERz5d0R6fmoFeMqrzkvfDwxlFyEANyYt4T1IHsIbuFz9y7ZZWxOgQVPAjqQZXvqSTP/xAAZEQADAQEBAAAAAAAAAAAAAAAAAREQAiD/2gAIAQIBAT8A9OnLKW5YLGf/xAAYEQEBAQEBAAAAAAAAAAAAAAAAEQEQIP/aAAgBAwEBPwDxOZGxMVUrVY//2Q=='
    

    
    
    