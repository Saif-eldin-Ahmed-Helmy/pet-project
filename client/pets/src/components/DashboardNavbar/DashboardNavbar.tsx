import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaChartLine, FaRegChartBar, FaBox, FaUsers, FaCreditCard } from 'react-icons/fa';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
    return (
        <Nav defaultActiveKey="/dashboard" className="flex-column dashboard-navbar">
            <NavLink to="/dashboard" className="nav-link">
                <FaChartLine /> Dashboard
            </NavLink>
            <NavLink to="/statistics" className="nav-link">
                <FaRegChartBar /> Statistics
            </NavLink>
            <NavLink to="/items" className="nav-link">
                <FaBox /> Items
            </NavLink>
            <NavLink to="/customers" className="nav-link">
                <FaUsers /> Customers
            </NavLink>
            <NavLink to="/payments" className="nav-link">
                <FaCreditCard /> Payments
            </NavLink>
        </Nav>
    );
};

export default DashboardNavbar;