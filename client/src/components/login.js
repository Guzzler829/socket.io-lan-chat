import React from "react";
import { useState } from "react";
import './login.css'
import { Navigate } from "react-router-dom";
import { io } from "socket.io-client";


const socket = io("http://10.0.0.97:3999");

socket.on("connect", () => {
    console.log(socket.id);
});

export default function Login({ handleClick, setUsername }) {

    const [input, setInput] = useState('');
    const [nav, setNav] = useState(<></>)

    function submit() {
        if(input.trim()) {
            setUsername(input);
            socket.emit('user-login', input)
            setNav(<Navigate to="/chat" />);
        }
        
    }

    function handleInputChange(e) {
        const newText = e.target.value;
        setInput(newText);
    }

    function handleKeyDown(e) {
        if(e.key === "Enter") {
            submit();
        }
        
    }

    return (
        <div className={"login"}>
            {nav}
            <h1>Welcome to the LAN chat</h1>
            <img src={require("./lan-chat.png")} alt="LAN Chat: a chat bubble in front of a blue circle background with the word LAN in it." />
            <h2>Choose a name for yourself.</h2>
            <input value={input} placeholder="Your username" onChange={handleInputChange} onKeyDown={handleKeyDown}></input>
            <button onClick={submit} className="btn">Join</button>
        </div>
    )
}