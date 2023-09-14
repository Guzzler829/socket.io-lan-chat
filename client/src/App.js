import React, { useRef } from "react";
import { useState, useEffect } from "react";
import "./App.css";
import Message from "./components/message.js";
import { io } from "socket.io-client";


const socket = io("http://10.0.0.97:3999");

socket.on("connect", () => {
  console.log(socket.id);
});


function App({username}) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [userId, setUserId] = useState(socket.id);

  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [messageCanBeSent, setMessageCanBeSent] = useState(false);
  const [lastKey, setLastKey] = useState("0000000000000");
  const [shift, setShift] = useState(false);

  const [sysMessageIndex, setSysMessageIndex] = useState(0);


  const messagesEndRef = useRef();

  const digits = 7;
  useEffect(() => {
    socket.emit('request-message-log')
    console.log('requested messages')
  }, [])

  useEffect(() => {
    if (messages.length) {
      setLastKey(messages[messages.length - 1].key);
    }

    function onConnect() {
      setIsConnected(true);
      setUserId(socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      socket.emit('user-disconnect', username)
    }

    function passMessage(messageObject) {
      let duplicate = false;
      messages.filter((message) => {
        if(message.key === messageObject.key) {
          duplicate = true;
        }
      })
      if(!duplicate) {
        setMessages([
          ...messages,
          {
            user: messageObject.user,
            messageContent: messageObject.messageContent,
            time: messageObject.time,
            key: messageObject.key,
            userId: messageObject.userId
          },
        ]);
        
      }
      console.log("message passed from server");
    }

    function passImage(url, user, time) {
      setMessages([
        ...messages,
        {
          user: user,
          time: time,
          isImage: true,
          imageUrl: url
        }
      ])
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    function serverSysMessage(message) {
      setMessages([...messages, {key: sysMessageIndex, user: '', messageContent: message, time: '', sysMessage: 'message'}])
      setSysMessageIndex(sysMessageIndex + 1)
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("pass-message", passMessage);
    socket.on("pass-image", passImage);

    socket.on("server-sys-message", serverSysMessage)

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pass-message", passMessage);
      socket.off("server-sys-message", serverSysMessage)
    };
  }, [messages, messageCanBeSent, lastKey, sysMessageIndex, username]);

  function makeKey(value, digits) {
    const lengthOfValue = value.toString().length;
    const numberOfZeroes = digits - lengthOfValue;
    let zeroesString = "";
    for (let i = 0; i < numberOfZeroes; i++) {
      zeroesString += "0";
    }
    return zeroesString + value;
  }

  const handleInputChange = (e) => {
    if(username) {
      const newText = e.target.value;
      setTextInput(newText);
  
      // Update messageCanBeSent based on whether the textarea is empty
      if (newText.trim() === "") {
        setMessageCanBeSent(false);
      } else if (username) {
        setMessageCanBeSent(true);
      }
    } else {
      warn('Your username is not set! You cannot send messages.')
    }
  };

  function onSendButton() {
    if (messageCanBeSent) {
      const time = getTimeString();
      //setMessages([...messages, {user: username, messageContent: textInput, time: time, key: username + " " + makeKey(parseInt(lastKey.toString().slice(digits + 1, lastKey.length)) + 1, digits)}])
      sendMessage(
        username,
        textInput,
        time,
        username +
          " " +
          makeKey(
            parseInt(lastKey.toString().slice(digits + 1, lastKey.length)) + 1,
            digits
          ),
        userId
      );
      setMessageCanBeSent(false);
      setTextInput("");
      console.log(messages);
    }
  }

  function getTimeString() {
    const d = new Date();
    let minutes;
    if (d.getMinutes() < 10) {
      minutes = "0" + d.getMinutes();
    } else {
      minutes = d.getMinutes();
    }
    return d.getHours() + ":" + minutes;
  }

  function handleKeyDown(e) {
    if (e.key === "Shift") {
      setShift(true);
      console.log(shift);
    }

    if (e.key === "Enter" && messageCanBeSent && !shift) {
      e.preventDefault();
      const time = getTimeString();

      //setMessages([...messages, {user: username, messageContent: textInput, time: time, key: username + " " + makeKey(parseInt(lastKey.toString().slice(digits + 1, lastKey.length)) + 1, digits)}])
      sendMessage(
        username,
        textInput,
        time,
        username +
          " " +
          makeKey(
            parseInt(lastKey.toString().slice(digits + 1, lastKey.length)) + 1,
            digits
          ),
          userId
      );
      setMessageCanBeSent(false);
      setTextInput("");
      console.log(messages);
    } else if (e.key === "Enter" && shift) {
    }
  }

  function handleKeyUp(e) {
    if (e.key === "Shift") {
      setShift(false);
      console.log(shift);
    }
  }

  function sendMessage(user, messageContent, time, key, userId) {
    socket.emit("send-message", user, messageContent, time, key, userId);
  }

  function warn(warning) {
    setMessages([...messages, {key: sysMessageIndex, user: '', messageContent: warning, time: '', sysMessage: 'warning'}])
  }

  return (
    <div className="app">
      <div className="username">Username: {username} ID: {userId}</div>
      <div className={"status connection-" + isConnected}>
        Connection: {isConnected ? "online" : "offline"}
      </div>
      <div className="chat-container">
        <div className="chat-box">
          {isConnected ? (
            username ? (<div className="sys-message">
              You joined with the name "{username}"
            </div>
            ) : <div className="sys-warning">You don't have a username! You cannot send messages! Chat is read-only.</div>
          ) : (
            <></>
          )}
          {messages.map((message, i) => (
            <Message
              key={message.key}
              user={message.user}
              messageContent={message.messageContent}
              time={message.time}
              sysMessage={message.sysMessage}
            />
          ))}
          <div ref={messagesEndRef} className="message-end"></div>
        </div>
        <div className="input-container">
          <textarea
            placeholder="Message..."
            rows={3}
            value={textInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            className={username ? 'textarea-canceled' : ''}
          />
          <button
            className={"can-send-" + messageCanBeSent}
            onClick={() => onSendButton()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
