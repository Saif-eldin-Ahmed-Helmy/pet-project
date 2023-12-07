import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from "./pages/Layout.tsx";
import './App.css';
import ShopPage from "./pages/CatsPage.tsx";
import AddItemPage from "./pages/admins/AddItemPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:itemId" element={<ProductPage />} />
                    <Route path="/admin/add-item" element={<AddItemPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;