import React, { useEffect, useState } from 'react';
import {Table, Container, Row, Col, Form, FormControl, InputGroup, DropdownButton, Dropdown} from 'react-bootstrap';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { BsSearch } from "react-icons/bs";
import './DashboardItemsPage.css';
import { Item } from "../../interfaces/item.ts";
// @ts-ignore
import stringSimilarity from "string-similarity";

const DashboardItemsPage: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const showDeleted = false;

    useEffect(() => {
        fetchItems();
    }, [showDeleted, page]);

    const fetchItems = async () => {
        const response = await fetch(`http://localhost:3001/api/analysis/items?deleted=${showDeleted}&page=${page}`, {
            credentials: 'include'
        });
        const data = await response.json();
        setItems(data.items);
        setMaxPage(data.maxPages);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    let filteredItems: Item[] = items;

    if (searchTerm) {
        filteredItems = items.filter(item => {
            return [item.name, item.category].some(field =>
                stringSimilarity.compareTwoStrings(field.toLowerCase(), searchTerm.toLowerCase()) > 0.1
            );
        });

        filteredItems.sort((a, b) => {
            const aSimilarity = Math.max(
                stringSimilarity.compareTwoStrings(a.name.toLowerCase(), searchTerm.toLowerCase()),
                stringSimilarity.compareTwoStrings(a.category.toLowerCase(), searchTerm.toLowerCase())
            );
            const bSimilarity = Math.max(
                stringSimilarity.compareTwoStrings(b.name.toLowerCase(), searchTerm.toLowerCase()),
                stringSimilarity.compareTwoStrings(b.category.toLowerCase(), searchTerm.toLowerCase())
            );
            return bSimilarity - aSimilarity;
        });
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs={2} id="sidebar-wrapper">
                    <DashboardNavbar />
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    <Form.Group controlId="formSearch">
                        <Form.Label>Search for Item</Form.Label>
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
                            <th>Item Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Purchases</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item, index) => (
                            <tr key={index} className={item.deleted ? 'deleted-item' : ''}>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                                <td>{item.stock}</td>
                                <td className="text-capitalize">{`${item.category} ${item.subCategory}`}</td>
                                <td>{item.purchases}</td>
                                <td>{item.value}</td>
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

export default DashboardItemsPage;