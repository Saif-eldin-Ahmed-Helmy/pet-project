import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from "./pages/Layout.tsx";
import './App.css';
import ShopPage from "./pages/ShopPage.tsx";
import AddItemPage from "./pages/admins/AddItemPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import AdminItemsPage from "./pages/admins/AdminItemsPage.tsx";
import EditItemPage from "./pages/admins/EditItemPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import UserPage from "./pages/UserPage.tsx";
import AccountSettingsPage from "./pages/AccountSettingsPage.tsx";
import EditLocationPage from "./pages/EditLocationPage.tsx";
import AddLocationPage from "./pages/AddLocationPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import ShoppingCartPage from "./pages/ShoppingCartPage.tsx";
import FavoritesPage from "./pages/FavoritesPage.tsx";
import './i18n';
import DashboardPage from "./pages/admins/DashboardPage.tsx";
import StatisticsPage from "./pages/admins/StatisticsPage.tsx";
import DashboardItemsPage from "./pages/admins/DashboardItemsPage.tsx";
import DashboardCustomersPage from "./pages/admins/DashboardCustomersPage.tsx";
import DashboardPaymentsPage from "./pages/admins/DashboardPaymentsPage.tsx";
import VetChatPage from "./pages/VetChatPage.tsx";
import SupportChatPage from "./pages/SupportChatPage.tsx";
import PackagerPage from "./pages/admins/PackagerPage.tsx";
import DeliveryPage from "./pages/admins/DriverPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<ProtectedRoute redirect={false}/>}>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route element={<ProtectedRoute navigateTo="/user" isAuth={false}/>}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:itemId" element={<ProductPage />} />
                    <Route element={<ProtectedRoute role='admin'/>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/statistics" element={<StatisticsPage />} />
                        <Route path="/items" element={<DashboardItemsPage />} />
                        <Route path="/customers" element={<DashboardCustomersPage />} />
                        <Route path="/payments" element={<DashboardPaymentsPage />} />
                        <Route path="/admin/items" element={<AdminItemsPage />} />
                        <Route path="/admin/edit-item/:itemId" element={<EditItemPage />} />
                        <Route path="/admin/add-item" element={<AddItemPage />} />
                    </Route>
                    <Route element={<ProtectedRoute role='packager'/>}>
                        <Route path="/package" element={<PackagerPage />} />
                    </Route>
                    <Route element={<ProtectedRoute role='driver'/>}>
                        <Route path="/deliver" element={<DeliveryPage />} />
                    </Route>
                    <Route element={<ProtectedRoute navigateTo="/login"/>}>
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/user/settings" element={<AccountSettingsPage />} />
                        <Route path="/user/add-location" element={<AddLocationPage />} />
                        <Route path="/user/edit-location/:locationId" element={<EditLocationPage />} />
                        <Route path="/user/orders" element={<OrdersPage />} />
                        <Route path="/user/orders/track/:orderId" element={<OrdersPage />} />
                        <Route path="/cart" element={<ShoppingCartPage />} />
                        <Route path="/shop/favorites" element={<FavoritesPage />} />
                        <Route path="/vet" element={<VetChatPage/>} />
                        <Route path="/support" element={<SupportChatPage/>} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;