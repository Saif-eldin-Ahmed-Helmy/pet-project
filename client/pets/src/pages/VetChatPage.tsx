import {useState, useEffect, useContext, useRef} from 'react';
import {Container, Row, Col, InputGroup, FormControl, Button, ListGroup, Card, Pagination, Form} from 'react-bootstrap';
import { FaHeadset, FaUser } from 'react-icons/fa';
import './VetChatPage.css';
import {AuthContext} from "../context/AuthContext.tsx";
import {io} from "socket.io-client";
import {FaUserDoctor} from "react-icons/fa6";

function ChatApp() {
    const [error, setError] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [newMessage, setNewMessage] = useState('');
    const chatsPerPage = 10;
    const authContext = useContext(AuthContext);
    const role = authContext?.user?.role;
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [status, setStatus] = useState('active');

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleSearchEmailChange = (event) => {
        setSearchEmail(event.target.value);
    }

    const handleSearch = () => {
        fetchChats();
    };

    useEffect(() => {
        socket.current = io('http://localhost:3001', { withCredentials: true });

        const onConnect = () => {
            console.log("connected");
        };

        const onDisconnect = () => {
            console.log("disconnected");
        };

        const onChatHandled = (data) => {
            setChats(chats.filter(chat => chat.sessionId !== data.sessionId));
            if (activeChat?.sessionId === data.sessionId) {
                setActiveChat(null);
            }
        };

        const onNewMessage = (data) => {
            if (!activeChat?.messages.find(message => message.id === data.message.id)) {
                const chat = chats.find(chat => chat.sessionId === data.sessionId);
                if (chat) {
                    setChats(chats.map(chat => chat.sessionId === data.sessionId ? { ...chat, messages: [...chat.messages, data.message] } : chat));
                    if (activeChat?.sessionId === data.sessionId) {
                        setActiveChat(prevChat => ({ ...prevChat, messages: [...prevChat.messages, data.message] }));
                    }
                } else {
                    fetchChats();
                }
            }
        };

        socket.current.on('connect', onConnect);
        socket.current.on('disconnect', onDisconnect);
        socket.current.on('chat-handled', onChatHandled);
        socket.current.on('new-message', onNewMessage);

        return () => {
            socket.current.off('connect', onConnect);
            socket.current.off('disconnect', onDisconnect);
            socket.current.off('chat-handled', onChatHandled);
            socket.current.off('new-message', onNewMessage);
            socket.current.disconnect();
        };
    }, [chats, activeChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [activeChat]);

    useEffect(() => {
        fetchChats();
    }, [role, currentPage]);

    function fetchChats() {
        fetch(`http://localhost:3001/api/chats/vet?page=${currentPage}&chatsPerPage=${chatsPerPage}&email=${searchEmail}&status=${status}`, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (!data.chats && !data.sessionId || (data.chats && data.chats.length === 0)) {
                    setError('No chats found.');
                    setChats([]);
                    setActiveChat(null);
                } else {
                    if (role === 'doctor' || role === 'admin') {
                        setChats(data.chats);
                        setMaxPage(data.maxPages);
                        if (data.chats.length > 0) {
                            setActiveChat(data.chats[0]);
                        } else {
                            setActiveChat(null);
                        }
                    } else {
                        setActiveChat(data);
                    }
                }
            })
            .catch(error => {
                setError('An error occurred while fetching the chats.');
            });
    }

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        const optimisticMessage = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            sender: authContext.user.email,
            content: newMessage,
            date: new Date().toISOString()
        };
        setActiveChat(prevChat => ({ ...prevChat, messages: [...prevChat.messages, optimisticMessage] }));
        setNewMessage('');
        const response = await fetch('http://localhost:3001/api/chats/vet/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: optimisticMessage.id, text: newMessage, sessionId: activeChat.sessionId }),
            credentials: 'include'
        });
        if (!response.ok) {
            setActiveChat(prevChat => ({ ...prevChat, messages: prevChat.messages.filter(message => message.id !== optimisticMessage.id) }));
            setError('An error occurred while sending the message.');
        }
    };

    const handleMarkAsHandled = async () => {
        const response = await fetch('http://localhost:3001/api/chats/vet/handle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: activeChat.sessionId }),
            credentials: 'include'
        });
        if (response.ok) {
            setChats(chats.filter(chat => chat.sessionId !== activeChat.sessionId));
            setActiveChat(null);
        }
    };

    return (
        <Container className="vet-chat-container">
            <Row className="vet-chat-row">
                {role === 'doctor' || role === 'admin' ? (
                    <Col md={4}>
                        <InputGroup className="mb-3">
                            <FormControl placeholder="Search" value={searchEmail} onChange={handleSearchEmailChange} />
                            <Form.Select aria-label="Chat Status" value={status} onChange={handleStatusChange}>
                                <option value="active">Active</option>
                                <option value="handled">Handled</option>
                            </Form.Select>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Button className="search-button" variant="outline-secondary" onClick={handleSearch}>Search</Button>
                            </div>
                        </InputGroup>
                        {chats.length > 0 ? (
                            <ListGroup>
                                {chats.map((chat, index) => (
                                    <ListGroup.Item key={chat.sessionId} action active={chat === activeChat} onClick={() => setActiveChat(chat)}>
                                        <span className="name">{chat.participants[0]}</span>
                                        <div className="date-message-wrapper">
                                            <span className="time">{new Date(chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].date : chat.date).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true
                                            })}</span>
                                            <div className="preview">{chat.messages[chat.messages.length - 1]?.content}</div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div>There are no active chats currently.</div>
                        )}
                        <Pagination>
                            {[...Array(maxPage).keys()].map((value, index) => (
                                <Pagination.Item className="vet-chat-button" key={index} active={index+1 === currentPage} onClick={() => setCurrentPage(index+1)}>
                                    {index+1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                        {role === 'doctor' || role === 'admin' && activeChat && (
                            <Button hidden={status === 'handled'} onClick={handleMarkAsHandled}>Mark as Handled</Button>
                        )}
                    </Col>
                ) : null}
                <Col md={role === 'doctor' || role === 'admin' ? 8 : 12}>
                    <Card style={{height:  '70vh'}}>
                        <Card.Header>To: {role === 'user' ? 'Vet' : activeChat?.participants[0]}</Card.Header>
                        <Card.Body className="chat active-chat" data-chat={activeChat?.sessionId}>
                            {activeChat?.messages.map(message => (
                                <div key={message.id} className={`chat-message ${message.sender === authContext.user.email ? 'sent' : 'received'}`}>
                                    <div className={`message-bubble ${message.sender === authContext.user.email ? 'sent' : 'received'}`}>
                                        {message.sender !== authContext.user.email && ((role === 'doctor' || role === 'admin') ? <FaUser size={30} /> : <FaUserDoctor size={30} />)}
                                        <p>{message.content}</p>
                                        <span>{new Date(message.date).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </Card.Body>
                        <Card.Footer>
                            <InputGroup>
                                <FormControl placeholder="Message" value={newMessage} onChange={handleNewMessageChange} />
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Button className="vet-chat-button" variant="primary" onClick={handleSendMessage} disabled={!activeChat}>Send</Button>
                                </div>
                            </InputGroup>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ChatApp;