import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, ListGroupItem, Form, Button } from 'react-bootstrap';

interface Message {
    user: string;
    content: string;
    timestamp: number;
}

interface Chat {
    id: string;
    name: string;
}

const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]); // Add state for chats
    const [selectedChat, setSelectedChat] = useState<string | null>(null); // Add state for selected chat
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = () => {
        if (newMessage.trim()) {
            const timestamp = Date.now();
            const newMessageObj = { user: 'You', content: newMessage, timestamp };
            setMessages((prevMessages) => [...prevMessages, newMessageObj]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <Container className="chat-page">
            <Row>
                <Col xs={6}>
                    <h2>Chats</h2>
                    <ListGroup>
                        {chats.map((chat) => (
                            <ListGroup.Item key={chat.id} action onClick={() => setSelectedChat(chat.id)}>
                                {chat.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
                <Col xs={6}>
                    <h2>Messages</h2>
                    <ListGroup className="chat-history">
                        {messages.map((message) => (
                            <ListGroup.Item key={message.content}>
                                <span className="chat-username">{message.user}: </span>
                                {message.content}
                                {message.timestamp && (
                                    <span className="chat-timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                value={newMessage}
                                onChange={(event) => setNewMessage(event.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                            />
                        </Form.Group>
                        <Button onClick={sendMessage}>Send</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ChatPage;