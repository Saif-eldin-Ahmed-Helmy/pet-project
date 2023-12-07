import React from 'react';
import {Button} from "react-bootstrap";

interface ButtonProps {
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
    size?: 'lg' | 'sm';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonProps> = ({
                                                    className = '',
                                                    type = 'button',
                                                    variant = 'primary',
                                                    size,
                                                    disabled = false,
                                                    onClick,
                                                    children
                                                }) => {
    const classes = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`;

    return (
        <Button type={type} className={classes} disabled={disabled} onClick={onClick}>
            {children}
        </Button>
    );
};

export default ButtonComponent;