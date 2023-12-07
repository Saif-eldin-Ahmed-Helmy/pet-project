import React from 'react';
import Card from 'react-bootstrap/Card';
import ButtonComponent from '../Button/Button';
import './ProductCard.css';

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

interface ProductComponentProps {
    product: Product;
    isFavorited: boolean;
    toggleFavorite: () => void;
}

const ProductCard: React.FC<ProductComponentProps> = ({ product, isFavorited, toggleFavorite }) => {
    return (
        <Card style={{ width: '18rem' }} className="product-card">
            <a href={`/product/${product.itemId}`}>
                <div className="image-container">
                    <Card.Img variant="top" src={product.picture} />
                    <ButtonComponent className="buy-button" onClick={() => {}}>Buy</ButtonComponent> {/* Use ButtonComponent */}
                </div>
            </a>
            <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text style={{color: "gold"}}>
                    EGP {product.price.toFixed(2)}
                </Card.Text>
                <ButtonComponent variant="link" className={`favorite-button ${isFavorited ? 'heart-red' : 'heart-gray'}`} onClick={toggleFavorite}>
                    {isFavorited ? '❤️' : '🤍'}
                </ButtonComponent>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;