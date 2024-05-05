import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import ButtonComponent from '../Button/Button';
import './ProductCard.css';
import { Item } from "../../interfaces/item.ts";
import Confetti from 'react-confetti';

interface ProductComponentProps {
    product: Item;
    enableBuy?: boolean;
    enableFavorite?: boolean;
    isFavorited: boolean;
    toggleFavorite: () => void;
    href?: string;
}

const ProductCard: React.FC<ProductComponentProps> = ({
                                                          product,
                                                          isFavorited = false,
                                                          toggleFavorite = () => {},
                                                          enableBuy = true,
                                                          enableFavorite = true,
                                                          href = `/product/${product.itemId}`
                                                      }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    const handleClick = () => {
        if (!isFavorited) {
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
            }, 2000);
        }
        toggleFavorite();
    };

    return (
        <Card className="product-card">
            <a href={href}>
                <div className="image-container">
                    <Card.Img variant="top" src={product.picture} />
                    <ButtonComponent className={product.stock > 0 ? 'buy-button' : 'buy-button-ofs'} onClick={() => {}}>{enableBuy ? (product.stock > 0 ? 'Buy' : 'Out of Stock') : 'Edit'}</ButtonComponent> {}
                </div>
            </a>
            <Card.Body className="product-card-body">
                <Card.Title className="product-description">{product.name}</Card.Title>
                <Card.Text style={{color: "gold"}}>
                    EGP {product.price.toFixed(2)}
                </Card.Text>
                {enableFavorite &&
                    <div className="confetti-container">
                        {showConfetti && <Confetti recycle={false} width={500} height={500} style={{width: '100%', height: '100%'}} />}
                    <ButtonComponent variant="link" className={`favorite-button ${isFavorited ? 'heart-red' : 'heart-gray'}`} onClick={handleClick}>
                        {isFavorited ? '❤️' : '🤍'}
                    </ButtonComponent>
                    </div>}
            </Card.Body>
        </Card>
    );
};

export default ProductCard;