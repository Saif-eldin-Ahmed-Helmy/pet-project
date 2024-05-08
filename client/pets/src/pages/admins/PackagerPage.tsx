import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Pagination, Card } from 'react-bootstrap';
import './PackagerPage.css';
import {Order} from "../../interfaces/order.ts";

const PackagerPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentItemPage, setCurrentItemPage] = useState<number>(1);
    const ordersPerPage: number = 10;
    const itemsPerPage: number = 5;

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        const response = await fetch(`https://pet-ssq2.onrender.com/api/orders?traceType=placed&page=${currentPage}&limit=${ordersPerPage}`, {
            credentials: 'include',
        });
        const data = await response.json();
        setOrders(data.filteredOrders);
    };

    const handleMarkAsPrepared = async (orderId: string) => {
        await fetch(`https://pet-ssq2.onrender.com/api/orders/${orderId}`, {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'prepared' }),
        });

        setOrders(orders.filter(order => order.orderId !== orderId));
    };

    const handleShowItems = (order: Order) => {
        setSelectedOrder(order);
        setCurrentItemPage(1);
    };

    const handleOrderPageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleItemPageChange = (pageNumber: number) => {
        setCurrentItemPage(pageNumber);
    };

    if (!orders) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.orderId}>
                        <td>{order.userEmail}</td>
                        <td>{new Date(order.date).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td>{order.status[0].toUpperCase() + order.status.substring(1)}</td>
                        <td>
                            <Button variant="primary" onClick={() => handleShowItems(order)}>
                                View Items
                            </Button>
                        </td>
                        <td>
                            {order.status === 'placed' && (
                                <Button variant="primary" onClick={() => handleMarkAsPrepared(order.orderId)}>
                                    Mark as Prepared
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Pagination>
                {[...Array(Math.ceil(orders.length / ordersPerPage)).keys()].map(page => (
                    <Pagination.Item key={page+1} active={page+1 === currentPage} onClick={() => handleOrderPageChange(page+1)}>
                        {page+1}
                    </Pagination.Item>
                ))}
            </Pagination>
            <Modal show={selectedOrder !== null} onHide={() => setSelectedOrder(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Items</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder?.items.slice((currentItemPage - 1) * itemsPerPage, currentItemPage * itemsPerPage).map(item => (
                        <Card className="item-card" key={item.itemId}>
                            <Card.Img variant="left" src={item.picture} className="item-image" />
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>Quantity: {item.quantity}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Pagination>
                        {[...Array(Math.ceil((selectedOrder?.items.length || 1) / itemsPerPage)).keys()].map(page => (
                            <Pagination.Item key={page+1} active={page+1 === currentItemPage} onClick={() => handleItemPageChange(page+1)}>
                                {page+1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PackagerPage;