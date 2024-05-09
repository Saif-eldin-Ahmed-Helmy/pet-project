import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Form, FormControl, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { BsSearch } from "react-icons/bs";
import './DashboardCustomersPage.css';
import {Customer} from "../../interfaces/customer.ts";

const DashboardCustomersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        fetchCustomers();
    }, [page]);

    const fetchCustomers = async () => {
        const response = await fetch(`http://localhost:3001/api/analysis/customers?page=${page}`, {
            credentials: 'include'
        });
        const data: { customers: Customer[], maxPages: number } = await response.json();
        setCustomers(data.customers);
        setMaxPage(data.maxPages);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    let filteredCustomers: Customer[] = customers;

    if (searchTerm) {
        filteredCustomers = customers.filter(customer => {
            return [customer.email, customer.name, customer.role].some(field =>
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
                        <Form.Label>Search for Customer</Form.Label>
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
                            <th>Name</th>
                            <th>Role</th>
                            <th>Balance</th>
                            <th>Orders Count</th>
                            <th>Orders Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCustomers.map((customer, index) => (
                            <tr key={index}>
                                <td>{customer.email}</td>
                                <td>{customer.name.split(' ').slice(0, 2).join(' ')}</td>
                                <td>{customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}</td>
                                <td>{customer.balance}</td>
                                <td>{customer.ordersCount}</td>
                                <td>{customer.ordersValue}</td>
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

export default DashboardCustomersPage;