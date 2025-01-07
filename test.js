const { config } = require('./config.js')
const from1 = "34648103978@c.us"
const from2 = "120363024866057320@g.us"
const from3 = "120363160757210405@newsletter"
const from4 = "34652134806@c.us"

const { senders } = config


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

const fromParsed1 = parseFrom(from1)
const fromParsed2 = parseFrom(from2)
const fromParsed3 = parseFrom(from3)
const fromParsed4 = parseFrom(from4)

console.log(fromParsed1)
console.log(fromParsed2)
console.log(fromParsed3)
console.log(fromParsed4)



