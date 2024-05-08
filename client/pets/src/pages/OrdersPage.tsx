import React, { useState, useEffect } from 'react';
import {Card, Modal, Spinner, Form} from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { Order } from '../interfaces/order.ts';
import ButtonComponent from '../components/Button/Button.tsx';
import { useNavigate } from 'react-router-dom';
import {CiStar} from "react-icons/ci";
import { useTranslation } from 'react-i18next';
import Container from "react-bootstrap/Container";

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [problem, setProblem] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [hoverRating, setHoverRating] = useState(5);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const response = await fetch('http://localhost:3001/api/orders', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.error) {
            //todo do error but lazy rn
        } else {
            data.filteredOrders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(data.filteredOrders);
        }
    };

    const handleReorder = async (order: Order) => {
        try {
            const response = await fetch(`http://localhost:3001/api/orders/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.orderId }),
                credentials: 'include'
            });

            if (!response.ok) {
                // do error but lazy rn
            }

            window.location.href = '/cart';
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenRatingModal = (order: Order) => {
        setSelectedOrder(order);
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
    };

    const handleTrackOrder = (orderId: number) => {
        navigate(`/user/orders/track/${orderId}`);
    };

    const handleRateOrder = async () => {
        if (selectedOrder) {
            const response = await fetch(`http://localhost:3001/api/orders/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.orderId, rating }),
                credentials: 'include'
            });

            if (response.ok) {
                fetchOrders();
                setShowRatingModal(false);
            } else {
                // handle error
            }
        }
    };

    const handleReportProblem = async () => {
        if (selectedOrder) {
            const response = await fetch(`http://localhost:3001/api/orders/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.orderId, problem }),
                credentials: 'include'
            });

            if (response.ok) {
                fetchOrders();
                setShowReportModal(false);
            } else {
                // handle error
            }
        }
    };

    if (!orders) {
        return <div style={{marginTop: 150}}>
            <p>{t('loading')} </p>
            <Spinner animation="grow"/>
        </div>
    }

    return (
        <div style={{marginTop: 50}}>
            <h1>{t('ordersHistory')}</h1>
            {orders.length === 0 && <p>You have no orders<br/>start by making an order now!</p>}
            {orders && orders.map(order => {
                const status = order.trace.length > 0 ? order.trace[order.trace.length - 1].type : 'N/A';
                const statusClass = `order-status-${status}`;
                let count = 0;
                order.items.map(item => {
                    count += item.quantity;
                });

                return (
                    <div className="orders-container" key={order.orderId}>
                        <Card key={order.orderId} className={`order-card ${statusClass}`}>
                            <div className="item-images">
                                {order.items.map(item => (
                                    <img key={item.itemId} src={item.picture} alt={item.itemId} className="item-image"/>
                                ))}
                            </div>
                            <Card.Body>
                                <Card.Title>{count} Items</Card.Title>
                                <Card.Text>
                                    Total Cost: {order.finalAmount.toFixed(2)}<br/>
                                    Order Date: {new Date(order.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}<br/>
                                    Order
                                    Status: {order.trace.length > 0 ? order.trace[order.trace.length - 1].type.charAt(0).toUpperCase() + order.trace[order.trace.length - 1].type.slice(1) : 'N/A'}
                                </Card.Text>
                                {status !== 'cancelled' && status !== 'delivered' && (
                                    <ButtonComponent onClick={() => handleTrackOrder(order.orderId)}>{t('track')}</ButtonComponent>
                                )}
                                {(status === 'delivered' || status === 'cancelled') && (
                                    <>
                                        <ButtonComponent style={{backgroundColor: 'orange'}} variant="primary" onClick={() => handleReorder(order)}>{t('reorder')}</ButtonComponent>
                                        {status !== 'cancelled' &&
                                            <div>
                                                {Array.from({length: 5}).map((_, index) => {
                                                    return index < order.rating
                                                        ? <FaStar key={index} onClick={() => handleOpenRatingModal(order)}/>
                                                        : <CiStar key={index} onClick={() => handleOpenRatingModal(order)}/>
                                                })}
                                            </div>
                                        }
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                );
            })}
            <Modal show={showRatingModal} onHide={handleCloseRatingModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('rateYourOrder')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className={"rating-form"}>
                        <Container>
                        <Form.Group controlId="rating">
                            <Form.Label style={{textAlign: 'right'}}>{t('rating')}</Form.Label>
                            <div>
                                {Array.from({length: 5}).map((_, index) => {
                                    return (
                                        <span
                                            key={index}
                                            onMouseEnter={() => setHoverRating(index + 1)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(index + 1)}
                                        >
                                        {index < (hoverRating || rating) ? <FaStar className={"filled-star"} /> : <CiStar className={"star"} />}
                                    </span>
                                    );
                                })}
                            </div>
                        </Form.Group>
                        </Container>
                        <ButtonComponent variant="primary" onClick={handleRateOrder}>{t('submit')}</ButtonComponent>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showReportModal} onHide={handleCloseReportModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('reportAProblem')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="problem">
                            <Form.Label>{t('problem')}</Form.Label>
                            <Form.Control as="textarea" rows={3} value={problem} onChange={(e) => setProblem(e.target.value)} />
                        </Form.Group>
                        <ButtonComponent variant="primary" onClick={handleReportProblem}>{t('submit')}</ButtonComponent>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default OrdersPage;