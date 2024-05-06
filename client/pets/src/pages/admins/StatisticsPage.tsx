import React, { useEffect, useState } from 'react';
import { Table, Card, Container, Row, Col, Button, Form } from 'react-bootstrap';
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
import './StatisicsPage.css';
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

const StatisticsPage = () => {
    const [statisticsData, setStatisticsData] = useState({
        allTimeSales: 0,
        yearToDate: 0,
        monthToDate: 0,
        today: 0,
        popularItems: [],
        popularCategories: [],
        popularCustomers: [],
        salesOverview: []
    });
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    const handleGenerateClick = () => {
        fetch(`http://localhost:3001/api/analysis/statistics?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setStatisticsData(data))
            .catch(error => console.error(error));
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Sales Overview'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const labelIndex = context.dataIndex;
                        const selectedPoint = statisticsData.salesOverview[labelIndex];
                        return `Value: ${selectedPoint.value}, To: ${format(new Date(selectedPoint.toDate), 'MMM do')}`;
                    }
                }
            }
        }
    };

    const data = {
        labels: statisticsData.salesOverview.map(sale => format(new Date(sale.date), 'MMM do')),
        datasets: [
            {
                label: 'Sales',
                data: statisticsData.salesOverview.map(sale => sale.value),
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    function capitalizeWords(str: string) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs={2} id="sidebar-wrapper">
                    <DashboardNavbar />
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    <Row>
                        <Col sm={6} md={3}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h3>E£ {statisticsData.allTimeSales.toFixed(1)}</h3>
                                    <span className="text-uppercase">All Time Sales</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h3>E£ {statisticsData.yearToDate.toFixed(1)}</h3>
                                    <span className="text-uppercase">Year To Date</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h3>E£ {statisticsData.monthToDate.toFixed(1)}</h3>
                                    <span className="text-uppercase">Month To Date</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="value-container">
                                <Card.Body>
                                    <h3>E£ {statisticsData.today.toFixed(1)}</h3>
                                    <span className="text-uppercase">Today</span>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: 20, width: '96vw'}}>
                        <Form.Group as={Row}>
                            <Col md={4}>
                                <Form.Label>From Date</Form.Label>
                                <Form.Control type="date" value={format(fromDate, 'yyyy-MM-dd')} onChange={e => setFromDate(new Date(e.target.value))} />
                            </Col>
                            <Col md={4}>
                                <Form.Label>To Date</Form.Label>
                                <Form.Control type="date" value={format(toDate, 'yyyy-MM-dd')} onChange={e => setToDate(new Date(e.target.value))} />
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Button onClick={handleGenerateClick}>Generate</Button>
                            </Col>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Sales Overview</Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Line data={data} options={options} />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Popular Items</Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button variant="secondary">View More</Button>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Purchases</th>
                                            <th>Value</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {statisticsData.popularItems.map((item) => (
                                            <tr key={item.name}>
                                                <td>{item.name}</td>
                                                <td>{item.purchases}</td>
                                                <td>E£ {item.value.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Popular Categories</Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button variant="secondary">View More</Button>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Purchases</th>
                                            <th>Value</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {statisticsData.popularCategories.map((category) => (
                                            <tr key={category.name}>
                                                <td>{capitalizeWords(category.name)}</td>
                                                <td>{category.purchases}</td>
                                                <td>E£ {category.value.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Row>
                                        <Col className="d-flex align-items-center">Popular Customers</Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button variant="secondary">View More</Button>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Purchases</th>
                                            <th>Value</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {statisticsData.popularCustomers.map((customer) => (
                                            <tr key={customer.email}>
                                                <td>{customer.email}</td>
                                                <td>{customer.purchases}</td>
                                                <td>E£ {customer.value.toFixed(2)}</td>
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

export default StatisticsPage;