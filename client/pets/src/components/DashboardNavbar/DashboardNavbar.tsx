import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {FaChartLine, FaRegChartBar, FaBox, FaUsers, FaCreditCard, FaBars} from 'react-icons/fa';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
    const [show, setShow] = useState(false);

    return (
        <>
            <Nav defaultActiveKey="/dashboard" className="flex-column dashboard-navbar d-none d-lg-block">
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
            <Nav defaultActiveKey="/dashboard" className="d-lg-none">
                <Nav.Link className="menu-button" onClick={() => setShow(true)}>
                    <FaBars /> Dashboard
                </Nav.Link>
            </Nav>
            <Offcanvas show={show} onHide={() => setShow(false)} placement="end" id="offcanvasNavbar" className="d-lg-none">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Dashboard</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
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
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default DashboardNavbar;