import React, { useState, useEffect } from 'react';
import Container from "react-bootstrap/Container";
import {Row, Col, Form, FormControl, DropdownButton, Dropdown} from "react-bootstrap";
import ProductCard from '../components/ProductCard/ProductCard';
import './ShopPage.css';
import { useLocation } from 'react-router-dom';
import CheckboxComponent from "../components/Checkbox/Checkbox.tsx";
import {Item} from "../interfaces/item.ts";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const ShopPage: React.FC = () => {
    const [products, setProducts] = useState<Item[]>([]);
    const [showOutOfStock, setShowOutOfStock] = useState(true);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [limit, setLimit] = useState(10);
    const query = useQuery();
    const category = query.get('category');
    const subCategory = query.get('subCategory');
    const [categoryState, setCategoryState] = useState(category || '');
    const [subCategoryState, setSubCategoryState] = useState(subCategory || '');
    const showFilters = true;

    useEffect(() => {
        fetchProducts();
    }, [showOutOfStock, minPrice, maxPrice, limit, categoryState, subCategoryState]);

    const fetchProducts = async () => {
        const response = await fetch(`http://localhost:3001/api/items?priceMin=${minPrice}${!showOutOfStock ? "&inStock=true" : ""}&priceMax=${maxPrice <= 0 ? 1000000 : maxPrice}&limit=${limit}&category=${categoryState}&subCategory=${subCategoryState}`);
        const data = await response.json();
        setProducts(data.items);
        products.map(product => (
            console.log(product.itemId)
        ));
    };

    //<Button variant="primary" onClick={() => setShowFilters(!showFilters)}>Toggle Filters</Button>

    return (
        <div>
            <Container className="shop-menu" style={{marginTop: 150}}>
                <Container className="shop-menu-container">
                    <h2 className="shop-menu-subhead">
                        <p>
                            {categoryState === 'cats' ? 'FOR CATS' : categoryState === 'dogs' ? 'FOR DOGS' : 'FOR YOUR PET'}
                        </p>
                    </h2>
                    <h2 className="shop-menu-description" style={{fontSize: 20, fontFamily: "sans-serif"}}>
                        <p>Make your pet happy!</p>
                    </h2>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Form className="filter-form" style={{backgroundColor: "white", width: '100%', display: showFilters ? 'flex' : 'none'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <p>Out Of Stock</p>
                            <CheckboxComponent onCheckboxChange={setShowOutOfStock} />
                        </div>
                        <Form.Group style={{marginLeft: 10, width: '10%'}} controlId="formMinPrice">
                            <Form.Label>Min Price</Form.Label>
                            <FormControl type="number" value={minPrice} onChange={e => setMinPrice(e.target.value ? parseFloat(e.target.value) : 0)} />
                        </Form.Group>
                        <Form.Group style={{marginLeft: 10, width: '10%'}} controlId="formMaxPrice">
                            <Form.Label>Max Price</Form.Label>
                            <FormControl type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : 0)} />
                        </Form.Group>
                        <Form.Group style={{marginLeft: 10, width: '5%'}} controlId="formLimit">
                            <Form.Label>Limit</Form.Label>
                            <FormControl type="number" value={limit} onChange={e => setLimit(e.target.value ? parseInt(e.target.value) : 0)} />
                        </Form.Group>
                        <div style={{marginLeft: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <p>Category</p>
                            <DropdownButton
                                style={{ top: -10 }}
                                id="dropdown-basic-button"
                                title={categoryState === '' ? 'All' : categoryState === 'cats' ? 'Cats' : 'Dogs'}
                                onSelect={(selectedKey: any) => setCategoryState(selectedKey)}
                            >
                                <Dropdown.Item eventKey="">All</Dropdown.Item>
                                <Dropdown.Item eventKey="cats">Cats</Dropdown.Item>
                                <Dropdown.Item eventKey="dogs">Dogs</Dropdown.Item>
                            </DropdownButton>
                        </div>


                        <div style={{marginLeft: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <p>Sub Category</p>
                            <DropdownButton
                                style={{ top: -10 }}
                                id="dropdown-basic-button"
                                title={subCategoryState === '' ? 'All' : subCategoryState === 'food' ? 'Food' : 'Accessories'}
                                onSelect={(selectedKey: any) => setSubCategoryState(selectedKey)}
                            >
                                <Dropdown.Item eventKey="">All</Dropdown.Item>
                                <Dropdown.Item eventKey="food">Food</Dropdown.Item>
                                <Dropdown.Item eventKey="accessories">Accessories</Dropdown.Item>
                            </DropdownButton>
                        </div>
                    </Form>
                    </div>
                    <Container>
                        <Row>
                            {products.map(product => (
                                <Col sm={12} md={6} lg={4} xl={3}>
                                    <ProductCard product={product} enableBuy={true} enableFavorite={true} isFavorited={false}
                                                 toggleFavorite={() => {
                                                 }}/>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </Container>
            </Container>
        </div>
    );
};

export default ShopPage;