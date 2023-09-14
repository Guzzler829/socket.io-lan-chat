import React from "react";
import './message.css'

export default function Message({ user, time, messageContent, sysMessage, isImage, imageUrl }) {

    return (
        <div className={sysMessage ? "sys-" + sysMessage : 'message'}>
            {sysMessage ? messageContent : (
                <div>
                    <div className="text-container">
                        <div className="username-time-row">
                            <h4>{user}</h4>
                            <div className="time">{time}</div>
                        </div>
                        {isImage ? <img src={imageUrl} alt={'broken image :('}style={{width: '90%'}} /> : <p style={{whiteSpace: "break-spaces"}}>{messageContent}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}