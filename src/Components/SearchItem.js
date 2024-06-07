import { useNavigate } from 'react-router-dom';
import styles from './SearchItem.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../Config/Request';
import Loader from './Loader';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const SearchItem = ({ itemImage, itemUsername, itemFullname }) => {

    const color = useSelector(state => state.custom.color);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const container = document.getElementById('container');

    const selectUserHandler = async () => {

        setIsLoading(true);

        await dispatch(getUser(itemUsername));

        navigate(`/profile/${itemUsername}`, {
            replace: false,
        });
    }

    return (
        <div className={styles['search-item']}>
            <div className={styles['item-image']} onClick={selectUserHandler}>
                <img src={itemImage} alt='user' />
            </div>
            <div className={styles['item-detail']}>
                <span className={`${styles['bold']} ${styles[color]}`}>{itemUsername}</span>
                <span>{itemFullname}</span>
            </div>
            {isLoading && createPortal(<Loader />, container)}
        </div>
    );
}

export default SearchItem;