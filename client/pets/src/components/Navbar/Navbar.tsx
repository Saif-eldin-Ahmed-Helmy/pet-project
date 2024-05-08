import React, { useState } from 'react';
import './Navbar.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import {FaUserDoctor} from "react-icons/fa6";
import {MdContactSupport} from "react-icons/md";

interface NavItem {
    href: string;
    label: string;
}

interface DropdownItem extends NavItem {
    divider?: boolean;
}

interface DropdownMenu {
    title: string;
    items: DropdownItem[];
}

interface NavbarProps {
    brand: { href: string; label: string; logo?: string };
    links: NavItem[];
    dropdown: DropdownMenu[];
    isLoggedIn?: boolean;
}

const NavbarComponent: React.FC<NavbarProps> = ({ brand, links, dropdown, isLoggedIn }) => {
    const [show, setShow] = useState(false);

    return (
        <Navbar fixed="top" expand="lg" className="bg-body-tertiary">
            <Container>
                {brand.logo && <img className="logo" src={brand.logo} alt={brand.label}/>}
                <Navbar.Brand href={brand.href}>{brand.label}</Navbar.Brand>
                <Navbar.Toggle onClick={() => setShow(true)} aria-controls="offcanvasNavbar" className="d-lg-none"/>
                <Navbar.Collapse id="responsive-navbar-nav" className="d-none d-lg-block">
                    <Nav className="me-auto">
                        {links.map((link, index) => (
                            <Nav.Link key={index} href={link.href} className={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}>
                                {link.label}
                            </Nav.Link>
                        ))}
                        {dropdown.map((dropdown, index) => (
                            <NavDropdown key={index} title={dropdown.title} id="basic-nav-dropdown">
                                {dropdown.items.map((item, index) => (
                                    <React.Fragment key={index}>
                                        {item.divider && <NavDropdown.Divider/>}
                                        <NavDropdown.Item href={item.href}>
                                            {item.label}
                                        </NavDropdown.Item>
                                    </React.Fragment>
                                ))}
                            </NavDropdown>
                        ))}
                    </Nav>
                </Navbar.Collapse>
                <Offcanvas show={show} onHide={() => setShow(false)} placement="end" id="offcanvasNavbar" className="d-lg-none">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>{brand.label}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="me-auto">
                            {links.map((link, index) => (
                                <Nav.Link key={index} href={link.href} className={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}>
                                    {link.label}
                                </Nav.Link>
                            ))}
                            {dropdown.map((dropdown, index) => (
                                <NavDropdown key={index} title={dropdown.title} id="basic-nav-dropdown">
                                    {dropdown.items.map((item, index) => (
                                        <React.Fragment key={index}>
                                            {item.divider && <NavDropdown.Divider/>}
                                            <NavDropdown.Item href={item.href}>
                                                {item.label}
                                            </NavDropdown.Item>
                                        </React.Fragment>
                                    ))}
                                </NavDropdown>
                            ))}
                        </Nav>
                    </Offcanvas.Body>
                </Offcanvas>
                <div>
                    <a href="/vet" className="icon">
                        <FaUserDoctor/>
                    </a>
                    <a href="/support" className="icon">
                        <MdContactSupport/>
                    </a>
                    <a href="/shop" className="icon">
                        <FaSearch/>
                    </a>
                    <a href="/cart" className="icon">
                        <FaShoppingCart/>
                    </a>
                    <a href="/user" className="icon">
                        <FaUser color={isLoggedIn ? "#1DCE3D" : "black"} />
                    </a>
                </div>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;