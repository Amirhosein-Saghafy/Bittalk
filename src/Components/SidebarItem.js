import styles from './SidebarItem.module.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';

const SidebarItem = ({ icon, text, path, className }) => {

    const { color, theme } = useSelector(state => state.custom);

    return (
        <li className={`${styles['option-item']} ${className ? styles[className] : ''}`}>
            <NavLink to={path} className={flag => flag.isActive ? styles[color] : styles[theme]}>
                <FontAwesomeIcon icon={icon} className={styles['option-icon']} />
                <span className={styles['option-text']}>{text}</span>
            </NavLink>
        </li>
    );
}

export default SidebarItem;