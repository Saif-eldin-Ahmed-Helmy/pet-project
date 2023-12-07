import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';

interface Item {
    itemId: string;
    name: string;
    picture: string;
    stock: number;
    price: number;
    description: string;
    category: string;
    subCategory: string;
    deleted: boolean;
}

const ProductPage: React.FC = () => {
    const {itemId} = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(parseInt(event.target.value));
    };

    const handleBuy = async () => {
        // Send a request to the server to update the item's stock and the user's cart
        // This is just a placeholder, replace with your actual API endpoint and request method
        await fetch(`http://localhost:3001/api/buy?itemId=${itemId}&quantity=${quantity}`);
    };

    const handleRemoveFromBasket = async () => {
        // Send a request to the server to update the user's cart
        // This is just a placeholder, replace with your actual API endpoint and request method
        await fetch(`http://localhost:3001/api/removeFromBasket?itemId=${itemId}`);
    };

    useEffect(() => {
        const fetchItem = async () => {
            const response = await fetch(`http://localhost:3001/api/items?itemId=${itemId}`);
            const data = await response.json();
            setItem(data.items[0]);
        };

        fetchItem();
    }, [itemId]);

    if (!item) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <ProductCard
                product={item}
                isFavorited={false}
                toggleFavorite={() => {
                }}
            />
            <input type="number" value={quantity} onChange={handleQuantityChange} min="1" max={item.stock}/>
            <button onClick={handleBuy}>Buy</button>
            <button onClick={handleRemoveFromBasket}>Remove from basket</button>
        </div>
    );
};

export default ProductPage;