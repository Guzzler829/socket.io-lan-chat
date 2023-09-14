const io = require('socket.io')(3999, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],

    }
});

let messages = []

io.on('connection', (socket) => {

    socket.on('user-login', (username) => {
        io.emit('server-sys-message', username + " has joined the chat.")
    })

    socket.on('user-disconnect', (username) => {
        io.emit('server-sys-message', username + " has left the chat.")
    })
    
    socket.on('request-message-log', () => {
        //send last 10 messages in the chat, so as to not enter to an empty chat
        if(messages.length < 10) {
            for(let i = 0; i < messages.length; i++) {
                io.emit('pass-message', {user: messages[i].user, messageContent: messages[i].messageContent, time: messages[i].time, key: messages[i].key});
            }
            console.log('message log sent')
        } else {
            for(let i = 0; i < 10; i++) {
                const start = messages.length - 10;
                io.emit('pass-message', {user: messages[start + i].user, messageContent: messages[start + i].messageContent, time: messages[start + i].time, key: messages[start + i].key});
            }
            console.log('message log sent')
        }
    });
    
    socket.on('send-message', (user, messageContent, time, key, userId) => {
        if(messageContent.slice(0, 1) === "/") {
            const words = messageContent.split(' ');
            switch(words[0]) {
                case '/help':
                    io.to(userId).emit('server-sys-message', 
                    `/help - show this command
                    /img [url] - post an image using its url in place of [url]
                    /sysmes [text] - send a system message to everyone. Just for funsies.`)
                    console.log(userId)
                    break;
                case '/img':
                    io.emit('pass-image', words[1], user, time);
                    break;
                case '/sysmes':
                    io.emit('server-sys-message', messageContent.slice(7, messageContent.length))
            }
        }
        const message = {user: user, messageContent: messageContent, time: time, key: key};
        io.emit('pass-message', message);
        messages.push(message)
    });
})