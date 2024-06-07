import Card from './UI/Card';
import styles from './NewPost.module.css';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from './Modal';
import Loader from './Loader';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { newPost } from '../Config/Request';
import { useSelector, useDispatch } from 'react-redux';

const NewPost = () => {

    const user = useSelector(state => state.auth.user);
    const {color, theme} = useSelector(state => state.custom);

    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const textRef = useRef();
    const container = document.getElementById('container');

    const dispatch = useDispatch();

    const cancleHandler = () => {
        navigate('/', {
            replace: false,
        });
    }

    const closeModalHandler = () => {

        if (modal.title === "Success") {
            navigate('/', {
                replace: true,
            });
        }

        setModal({
            showModal: false,
            title: '',
            icon: null,
            text: '',
        });
    }

    const newPostHandler = async (e) => {

        e.preventDefault();

        if (textRef.current.value === '') {
            setModal({
                showModal: true,
                title: 'Failed',
                text: 'Please write about your idea',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                }
            });

            return;
        }

        setIsLoading(true);

        const data = {
            value: textRef.current.value,
            userId: user.user_id,
            userName: user.UserName,
        }

        const res = await dispatch(newPost(data));

        if (res.wasSuccessful) {

            setModal({
                showModal: true,
                title: 'Success',
                text: res.message,
                icon: {
                    name: faCircleCheck,
                    color: 'green',
                }
            });
        }
        else {
            setModal({
                showModal: true,
                title: 'Failed',
                text: res.message,
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                }
            });
        }

        setIsLoading(false);
    }
    return (
        <Card className='main-card'>
            <form className={styles['form']}>
                <textarea className={`${styles['text-box']} ${styles[theme]}`} placeholder='Post your idea ...' ref={textRef}>
                </textarea>
                <input className={`${styles['button']} ${styles['post']} ${styles[color]}`} type='submit' value='Post'
                    onClick={newPostHandler} />
                <button className={`${styles['button']} ${styles['cancle']}`} type='button'
                    onClick={cancleHandler}>
                    Cancle
                </button>
            </form>
            {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                onCloseModal={closeModalHandler} />, container)}
            {isLoading && createPortal(<Loader />, container)}
        </Card>
    );
}

export default NewPost;