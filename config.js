require('dotenv').config()
const {
    PORT: port = 3001,
    MY_NUMBER: me = '',
    SENDERS_DATA: sendersData = '{}'
} = process.env

const senders = JSON.parse(sendersData)

module.exports = {
    config: {
        port,
        me,
        senders: senders
    }
}