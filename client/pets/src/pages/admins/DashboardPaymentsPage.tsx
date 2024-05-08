import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Form, FormControl, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { BsSearch } from "react-icons/bs";
import './DashboardPaymentsPage.css';
import { format } from "date-fns";
import { Payment } from "../../interfaces/payment.ts";

const DashboardPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const fetchPayments = async () => {
        const response = await fetch(`https://pet-ssq2.onrender.com/api/analysis/payments?page=${page}`, {
            credentials: 'include'
        });
        const data = await response.json();
        setPayments(data.payments);
        setMaxPage(data.maxPages);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    let filteredPayments = payments || [];

    if (searchTerm) {
        filteredPayments = payments.filter((payment: Payment) => {
            return [payment.email, payment.date, payment.paymentMethod].some(field =>
                field.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs={10} id="sidebar-wrapper">
                    <DashboardNavbar />
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    <Form.Group controlId="formSearch">
                        <Form.Label>Search for Payment</Form.Label>
                        <InputGroup className="mb-3">
                            <FormControl type="text" value={searchTerm} onChange={handleSearchChange}/>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <InputGroup.Text><BsSearch/></InputGroup.Text>
                            </div>
                        </InputGroup>
                    </Form.Group>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Email</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPayments.map((payment: Payment, index) => (
                            <tr key={index}>
                                <td>{payment.email}</td>
                                <td>{format(new Date(payment.date), 'yyyy, MMMM do')}</td>
                                <td>{payment.amount}</td>
                                <td>{payment.paymentMethod}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <DropdownButton id="dropdown-basic-button" title="Page">
                        {[...Array(maxPage).keys()].map((value, index) => (
                            <Dropdown.Item key={index} onClick={() => setPage(value + 1)}>{value + 1}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPaymentsPage;