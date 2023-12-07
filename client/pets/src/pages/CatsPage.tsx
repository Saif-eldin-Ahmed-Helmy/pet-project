import React, { useState, useEffect } from 'react';
import Container from "react-bootstrap/Container";
import {Row, Col, Form, FormControl, Button} from "react-bootstrap";
import ProductCard from '../components/ProductCard/ProductCard';
import './CatsPage.css';

interface Product {
    itemId: string;
    name: string;
    picture: string;
    stock: number;
    price: number;
    description: string;
    category: string;
    deleted: boolean;
}

const CatsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [inStock, setInStock] = useState(true);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [limit, setLimit] = useState(10);
    const [category, setCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [inStock, minPrice, maxPrice, limit, category]);

    const fetchProducts = async () => {
        const response = await fetch(`http://localhost:3001/api/items?inStock=${inStock}&priceMin=${minPrice}&priceMax=${maxPrice <= 0 ? 1000000 : maxPrice}&limit=${limit}&subCategory=${category}`);
        const data = await response.json();
        setProducts(data.items);
        products.map(product => (
            console.log(product.itemId)
        ));
    };

    return (
        <div>
            <Container className="shop-menu" style={{marginTop: 200}}>
                <Container className="shop-menu-container">
                    <h2 className="shop-menu-subhead">
                        <p>FOR CATS</p>
                    </h2>
                    <h2 className="shop-menu-description" style={{fontSize: 20, fontFamily: "sans-serif"}}>
                        <p>Make your pet happy!</p>
                    </h2>
                    <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>Toggle Filters</Button>

                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Form className="filter-form" style={{width: '50%', display: showFilters ? 'flex' : 'none'}}>
                        <Form.Group controlId="formInStock">
                            <Form.Check type="checkbox" label="In Stock" checked={inStock} onChange={e => setInStock(e.target.checked)} />
                        </Form.Group>
                        <Form.Group controlId="formMinPrice">
                            <Form.Label>Min Price</Form.Label>
                            <FormControl type="number" value={minPrice} onChange={e => setMinPrice(e.target.value ? parseFloat(e.target.value) : 0)} />
                        </Form.Group>
                        <Form.Group controlId="formMaxPrice">
                            <Form.Label>Max Price</Form.Label>
                            <FormControl type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : 0)} />
                        </Form.Group>
                        <Form.Group controlId="formLimit">
                            <Form.Label>Limit</Form.Label>
                            <FormControl type="number" value={limit} onChange={e => setLimit(e.target.value ? parseInt(e.target.value) : 0)} />
                        </Form.Group>
                        <Form.Group controlId="formCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control as="select" value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="">All</option>
                                <option value="food">Food</option>
                                <option value="accessories">Accessories</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                    </div>
                    <Row className="product_listing__main product_listing__grid">
                        {products.map(product => (
                            <Col xs={12} sm={6} md={4} key={product.itemId}>
                                <ProductCard
                                    product={product}
                                    isFavorited={false} // todo:  Replace with actual favorited state
                                    toggleFavorite={() => {}} // todo:  Replace with actual toggleFavorite function
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </Container>
        </div>
    );
};

export default CatsPage;