const schedule = require('node-schedule');

class MsgQueue {
    constructor() {
        if (!MsgQueue.instance) {

            this.queue = [];
            this.sendFunction = null;
            this.isInitialized = false;
            MsgQueue.instance = this; // store instance
        }
        console.log('🔍 MsgQueue instance created:', this);
        return MsgQueue.instance; // Always return the same instance
    }

    setSendFunction(sendFunction) {
        this.sendFunction = sendFunction;
        this.isInitialized = true;
        console.log('✅ Send function has been set:', this.sendFunction.toString());
        // console.log('🔍 Updated MsgQueue state:', this);
    }

    scheduleMessage(recipient, message, scheduledTime) {
        console.log(`🔍 Checking isInitialized: ${this.isInitialized}`);
        if (!this.isInitialized) {
            console.log('❌ MsgQueue not initialized. Queueing message for later.');
            this.queue.push({ recipient, message, scheduledTime });
            return;
        }

        console.log('📅 Scheduling message...');
        schedule.scheduleJob(new Date(scheduledTime), () => {
            if (this.sendFunction) {
                this.sendFunction(recipient, message);
            } else {
                console.log('⚠️ Send function not set. Message:', { recipient, message });
                this.queue.push({ recipient, message });
            }
        });

        console.log(`✅ Message scheduled for ${recipient} at ${scheduledTime}`);
    }

    processPendingMessages() {
        while (this.queue.length > 0 && this.sendFunction) {
            const { recipient, message } = this.queue.shift();
            this.sendFunction(recipient, message);
        }
    }
}

// Export a SINGLE instance
const msgQueue = new MsgQueue(); // Prevent modifications
module.exports = msgQueue;
