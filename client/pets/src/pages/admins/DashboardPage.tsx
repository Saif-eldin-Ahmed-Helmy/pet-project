import React, { useEffect, useState } from 'react';
import { Table, Card, Container, Row, Col, Button } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import './DashboardPage.css';
import { format } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        todaysRevenue: 0,
        thisMonthsRevenue: 0,
        thisMonthsAvgPayment: 0,
        salesOverview: [],
        recentPayments: []
    });

    useEffect(() => {
        fetch('http://localhost:3001/api/analysis/dashboard', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                const salesOverview = Array(10).fill(0);
                data.salesOverview.forEach((sale, index) => {
                    salesOverview[index] = sale.value;
                    console.log(index, sale);
                });

                setDashboardData({ ...data, salesOverview });
            })
            .catch(error => console.error(error));
    }, []);

    const currentYear = new Date().getFullYear();

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sales Overview'
            }
        }
    };

    const data = {
        labels: Array.from({ length: 10 }, (_, i) => format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM do')).reverse(),
        datasets: [
            {
                label: 'Sales',
                data: dashboardData.salesOverview,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    const currentMonth = format(new Date(), 'MMM');

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs={2} id="sidebar-wrapper">
                    <DashboardNavbar />
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    <Row>
                        <Col md={4}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h1>E£ {dashboardData.todaysRevenue.toFixed(1)}</h1>
                                    <span className="text-uppercase">Today's Revenue</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h1>E£ {dashboardData.thisMonthsRevenue.toFixed(1)}</h1>
                                    <span className="text-uppercase">{currentMonth} Revenue</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h1>E£ {dashboardData.thisMonthsAvgPayment.toFixed(1)}</h1>
                                    <span className="text-uppercase">{currentMonth} AVG Payment</span>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Sales Overview</Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button href="http://localhost:5173/statistics" variant="secondary">View More</Button>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Line data={data} options={options} />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Recent Payments</Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button href="http://localhost:5173/payments" variant="secondary">View More</Button>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Date</th>
                                            <th>Items Count</th>
                                            <th>Value</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {dashboardData.recentPayments.map((payment, index) => (
                                            <tr key={index}>
                                                <td>{payment.email}</td>
                                                <td>{format(new Date(payment.date), 'yyyy, MMMM do')}</td>
                                                <td>{payment.itemsCount}</td>
                                                <td>E£ {payment.value}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;