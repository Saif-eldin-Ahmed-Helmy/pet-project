import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from "./pages/Layout.tsx";
import './App.css';
import CatsPage from "./pages/CatsPage.tsx";
import AddItemPage from "./pages/admins/AddItemPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/cats" element={<CatsPage />} />
                    <Route path="/admin/add-item" element={<AddItemPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;