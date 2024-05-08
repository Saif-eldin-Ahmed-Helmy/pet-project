import {useEffect, useRef, useState} from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes, FaComments, FaHeadset } from 'react-icons/fa';
import './ChatModal.css';
import {io} from "socket.io-client";

const ChatModal = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io('http://localhost:3001');
        socket.current.on('newMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        return () => {
            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isChatOpen) {
            fetchMessages();
        }
    }, [isChatOpen]);

    const fetchMessages = async () => {
        const response = await fetch(`http://localhost:3001/api/chats/support`, {
            credentials: 'include'
        });
        const data = await response.json();
        setMessages(data);
    };

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        const response = await fetch('http://localhost:3001/api/chats/support', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: newMessage }),
            credentials: 'include'
        });
        if (response.ok) {
            setNewMessage('');
            fetchMessages();
        }
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <>
            {!isChatOpen && (
                <button className="chat-logo" onClick={toggleChat}>
                    <FaComments size={30} />
                </button>
            )}
            {isChatOpen && (
                <div className="chat-modal">
                    <div className="chat-header">
                        <h2>Live Chat</h2>
                        <FaTimes size={20} onClick={toggleChat} />
                    </div>
                    {messages.map(message => (
                        <div key={message.id} className={`chat-message ${message.type}`}>
                            {message.type === 'received' && (
                                <div className="message-bubble received">
                                    <FaHeadset size={30} />
                                    <span>  | {message.name}</span>
                                    <p>{message.text}</p>
                                    <span>{message.timestamp.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                            )}
                            {message.type === 'sent' && (
                                <div className="message-bubble sent">
                                    <p>{message.text}</p>
                                    <span>{message.timestamp.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="chat-input">
                        <textarea value={newMessage} onChange={handleNewMessageChange} placeholder="Type your message" />
                        <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatModal;