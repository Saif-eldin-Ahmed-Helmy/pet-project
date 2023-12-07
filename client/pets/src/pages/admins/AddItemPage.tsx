import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const AddItemPage: React.FC = () => {
    const [itemId, setItemId] = useState('');
    const [name, setName] = useState('');
    const [picture, setPicture] = useState('');
    const [stock, setStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('cats');
    const [subCategory, setSubCategory] = useState('food');
    const [deleted, setDeleted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const item = { itemId, name, picture, stock, price, description, category, subCategory, deleted };
        const response = await fetch('http://localhost:3001/api/items', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });

        if (response.ok) {
            alert('Item added successfully');
        } else {
            alert('Error adding item');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3001/api/images/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log(data);
        setPicture(data.url);
    };

    return (
        <Form style={{marginTop: 200}} onSubmit={handleSubmit}>
            <Form.Group controlId="formItemId">
                <Form.Label>Item ID</Form.Label>
                <Form.Control type="text" value={itemId} onChange={e => setItemId(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formPicture">
                <Form.Label>Picture</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group controlId="formStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" value={stock} onChange={e => setStock(e.target.value ? parseInt(e.target.value) : 0)} />
            </Form.Group>
            <Form.Group controlId="formPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" value={price} onChange={e => setPrice(e.target.value ? parseFloat(e.target.value) : 0)} />
            </Form.Group>
            <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control as="select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="cats">Cats</option>
                    <option value="dogs">Dogs</option>
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSubCategory">
                <Form.Label>Sub Category</Form.Label>
                <Form.Control as="select" value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                    <option value="food">Food</option>
                    <option value="accessories">Accessories</option>
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="formDeleted">
                <Form.Check type="checkbox" label="Deleted" checked={deleted} onChange={e => setDeleted(e.target.checked)} />
            </Form.Group>
            <Button variant="primary" type="submit">Add Item</Button>
        </Form>
    );
};

export default AddItemPage;