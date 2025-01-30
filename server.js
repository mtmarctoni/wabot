const express = require('express');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const msgQueue = require('./msgQueue');

const {
    listenMessages,
} = require('./botFunctions.js')

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
    console.log('🤖 Client is ready!');

    msgQueue.setSendFunction((recipient, message) => {
        client.sendMessage(`${recipient}@c.us`, message)
            .then(() => console.log(`📤 Message sent to ${recipient}: ${message}`))
            .catch(err => console.error('❌ Error sending message:', err));
    });

    msgQueue.processPendingMessages();

    // Start listening for incoming messages
    listenMessages(client, msgQueue)
})

client.initialize()

const app = express();
const port = 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// API route for scheduling messages
app.post('/api/schedule', (req, res) => {
    const { recipient, message, scheduledTime } = req.body;

    // console.log('Scheduling message:', { recipient, message, scheduledTime });

    msgQueue.scheduleMessage(recipient, message, scheduledTime);

    res.json({ success: true, message: 'Message scheduled successfully' });
});

// Handles any requests that don't match the above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
