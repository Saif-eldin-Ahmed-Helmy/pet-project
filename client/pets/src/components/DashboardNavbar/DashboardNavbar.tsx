import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaChartLine, FaRegChartBar } from 'react-icons/fa';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
    return (
        <Nav defaultActiveKey="/dashboard" className="flex-column dashboard-navbar">
            <Nav.Link href="/dashboard">
                <FaChartLine /> Dashboard
            </Nav.Link>
            <Nav.Link href="/statistics">
                <FaRegChartBar /> Statistics
            </Nav.Link>
        </Nav>
    );
};

export default DashboardNavbar;