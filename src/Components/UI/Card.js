import { useSelector } from 'react-redux';
import './Card.css';

const Card = ({ children, className }) => {

    const theme = useSelector(state => state.custom.theme);

    return (
        <div className={`card ${className} ${theme}`}>{children}</div>
    );
}

export default Card;