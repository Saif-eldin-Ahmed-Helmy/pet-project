import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Pagination } from 'react-bootstrap';
import {Order} from "../../interfaces/order.ts";

const DeliveryPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ordersPerPage: number = 10;

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        const response = await fetch(`http://localhost:3001/api/orders?page=${currentPage}&limit=${ordersPerPage}`, {
            credentials: 'include',
        });
        const data = await response.json();
        data.filteredOrders = data.filteredOrders.filter((order: Order) =>
            order.trace[order.trace.length - 1].type === 'prepared' || order.trace[order.trace.length - 1].type === 'delivering');

        const sortedOrders = data.filteredOrders.sort((a: Order, b: Order) => {
            if (a.trace[a.trace.length - 1].type === 'delivering') return -1;
            if (b.trace[b.trace.length - 1].type === 'delivering') return 1;
            return 0;
        });
        setOrders(sortedOrders);
    };

    const handleMarkAsDelivering = async (orderId: string) => {
        await fetch(`http://localhost:3001/api/orders/`, {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: orderId, traceType: 'delivering' }),
        });

        setOrders(orders.map(order => order.orderId === orderId ? {...order, trace: [...order.trace, {type: 'delivering', date: new Date().toISOString(), executor: 'driver', active: true}]} : order));
    };

    const handleMarkAsDelivered = async (orderId: string) => {
        await fetch(`http://localhost:3001/api/orders/`, {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: orderId, traceType: 'delivered' }),
        });

        setOrders(orders.filter(order => order.orderId !== orderId));
    };

    const handleShowLocation = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleOrderPageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
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
                    <th>Location</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.orderId}>
                        <td>{order.userEmail}</td>
                        <td>{new Date(order.date).toLocaleString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}</td>
                        <td>{order.status[0].toUpperCase() + order.status.substring(1)}</td>
                        <td><Button variant="primary" onClick={() => handleShowLocation(order)}>Show Location</Button>
                        </td>
                        <td>
                            {order.trace[order.trace.length - 1].type === 'prepared' && (
                                <Button variant="primary" onClick={() => handleMarkAsDelivering(order.orderId)}>
                                    Mark as Delivering
                                </Button>
                            )}
                            {order.trace[order.trace.length - 1].type === 'delivering' && (
                                <Button variant="success" onClick={() => handleMarkAsDelivered(order.orderId)}>
                                    Mark as Delivered
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
                    <Modal.Title>Location Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Location ID:</strong> {selectedOrder?.location.locationId}</p>
                    <p><strong>Apartment Number:</strong> {selectedOrder?.location.apartmentNumber}</p>
                    <p><strong>Floor Number:</strong> {selectedOrder?.location.floorNumber}</p>
                    <p><strong>Street Name:</strong> {selectedOrder?.location.streetName}</p>
                    <p><strong>City:</strong> {selectedOrder?.location.city}</p>
                    <p><strong>Phone Number:</strong> {selectedOrder?.location.phoneNumber}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DeliveryPage;