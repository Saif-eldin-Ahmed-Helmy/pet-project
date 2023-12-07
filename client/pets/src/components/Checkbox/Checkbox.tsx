import { useState } from "react";
import { Form } from "react-bootstrap";

interface CheckboxProps {
    onCheckboxChange: (checked: boolean) => void;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({ onCheckboxChange }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
        onCheckboxChange(event.target.checked);
    };

    return (
        <Form.Check
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            style={{ transform: 'scale(2)', color: 'white', border: '1px solid white' }}
        />
    );
};

export default CheckboxComponent;