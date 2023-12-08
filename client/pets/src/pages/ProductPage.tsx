import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Spinner, Button, InputGroup, FormControl, Container, Row, Col} from "react-bootstrap";
import {Item} from "../interfaces/item.ts";
import ButtonComponent from "../components/Button/Button.tsx";
import ProductCard from "../components/ProductCard/ProductCard";

const ProductPage: React.FC = () => {
    const {navigate} = useNavigate();
    const {itemId} = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [similarProducts, setSimilarProducts] = useState<Item[]>([]);

    useEffect(() => {
        fetchItem();
        fetchCartItems();
        fetchSimilarProducts();
    }, [itemId]);

    useEffect(() => {
        const isInCart = cartItems.find(cartItem => cartItem.itemId === itemId);
        if (isInCart) {
            handleSetQuantity();
        }
    }, [quantity]);

    const fetchItem = async () => {
        const response = await fetch(`http://localhost:3001/api/items?itemId=${itemId}`);
        const data = await response.json();
        setItem(data.items[0]);
    };

    const fetchSimilarProducts = async () => {
        const response = await fetch(`http://localhost:3001/api/items?similarTo=${itemId}&limit=4`);
        const data = await response.json();
        setSimilarProducts(data.items);
    };

    const fetchCartItems = async () => {
        const response = await fetch('http://localhost:3001/api/cart', {
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.error) {
            setCartItems(data);
            setQuantity(data.find(cartItem => cartItem.itemId === itemId)?.quantity || 1);
        }
    };

    const handleQuantityChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (quantity === parseInt(event.target.value)) {
            return;
        }
        setQuantity(parseInt(event.target.value));
    };

    const handleBuy = async () => {
        const response = await fetch(`http://localhost:3001/api/cart`, {
            credentials: 'include',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({itemId, quantity})
        });
        const data = await response.json();
        if (!data.error) {
            setCartItems([...cartItems, {itemId, quantity}]);
        }
        else {
            navigate('/login');
        }
    };

    const handleSetQuantity = async () => {
        if (quantity <= 0) {
            await handleRemoveFromBasket();
        }
        else {
            const response = await fetch(`http://localhost:3001/api/cart`, {
                credentials: 'include',
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({itemId, quantity})
            });
            const data = await response.json();
            if (data.error) {
                navigate('/login');
            }
        }
    }

    const handleRemoveFromBasket = async () => {
        const response = await fetch(`http://localhost:3001/api/cart`, {
            credentials: 'include',
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({itemId})
        });
        const data = await response.json();
        if (data.error) {
            navigate('/login');
        }
        else {
            setCartItems(cartItems.filter(cartItem => cartItem.itemId !== itemId));
        }
    };

    if (!item) {
        return <div>
            <p>Loading... </p>
            <Spinner animation="grow"/>
        </div>
    }

    const isInCart = cartItems.find(cartItem => cartItem.itemId === itemId);

    return (
        <div style={{marginTop: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: '40vw'}}>
                <img src={item.picture} alt={item.name} style={{maxWidth: '100%', maxHeight: '400px'}}/>
                <h1>{item.name}</h1>
                <hr/>
                <h3 style={{color: "gold"}}>EGP {item.price.toFixed(2)}</h3>
                <p style={{fontSize: '0.8em'}}>{item.description}</p>
                {isInCart ? (
                    <InputGroup className="mb-3">
                        <Button variant="outline-secondary"
                                onClick={() => setQuantity(Math.max(0, quantity - 1))}>-</Button>
                        <FormControl aria-label="Quantity" value={quantity} onChange={handleQuantityChange}
                                     max={item.stock}/>
                        <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</Button>
                    </InputGroup>
                ) : (
                    <ButtonComponent onClick={handleBuy}>Buy</ButtonComponent>
                )}
                {isInCart && <ButtonComponent onClick={handleRemoveFromBasket}>Remove from basket</ButtonComponent>}
                <hr/>
            </div>
            <h2>Similar Products</h2>
            <Container>
                <Row>
                    {similarProducts.map(product => (
                        <Col sm={12} md={6} lg={4} xl={3}>
                            <ProductCard product={product} enableBuy={true} enableFavorite={true} isFavorited={false}
                                         toggleFavorite={() => {
                                         }}/>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default ProductPage;