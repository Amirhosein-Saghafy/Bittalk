import Card from './UI/Card';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCircleXmark, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../Config/Request';
import Modal from './Modal';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './Loader';

const Login = () => {

    const { color } = useSelector(state => state.custom);
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    const container = document.getElementById('container');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const emailRef = useRef();
    const passwordRef = useRef();

    const validator = function () {

        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        if (email === '' || password === '') {

            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'please fill out the forms'
            });
            return false;
        }
        else
            return true;
    }

    const getFormData = function () {

        return {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };
    }

    const loginHandler = async function () {

        if (!validator())
            return;

        const loginInformation = getFormData();

        setIsLoading(true);

        const response = await dispatch(login(loginInformation));

        if (response.wasSuccessful) {
            setModal({
                showModal: true,
                title: 'Success',
                text: `Welcome dear ${response.message}`,
                icon: {
                    name: faCircleCheck,
                    color: 'green',
                },
            });
        }
        else {
            setModal({
                showModal: true,
                title: 'Failed',
                text: response.message,
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
            });
        }

        setIsLoading(false);
    }

    const cancleHandler = function () {
        navigate('/', {
            replace: false,
        });
    }

    const closeModalHandler = function () {

        setModal({
            showModal: false,
            title: '',
            icon: null,
            text: '',
        });

        if (modal.title === 'Success') {
            navigate('/', {
                replace: true,
            });
        }
    }

    const PasswordVisibilityHandler = function () {

        setVisiblePassword(prevState => !prevState);
    }

    return (
        <Card className={'main-card'}>
            <div className={styles['title']}>
                <h3 className={styles['title-text']}>
                    Login
                </h3>
            </div>
            <form className={styles['register-form']}>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='name-input'>Email</label>
                    <input className={styles['form-input']} type='text' id='name-input' ref={emailRef} />
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='password-input'>Password</label>
                    <div className={styles['password-input']}>
                        <input type={visiblePassword ? 'text' : 'password'} className={styles['form-input']} ref={passwordRef} />
                        <button className={styles['show-password-button']} type='button' onClick={PasswordVisibilityHandler}>
                            <FontAwesomeIcon icon={visiblePassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
            </form>
            <div className={styles['options']}>
                <button className={`${styles['option-button']} ${styles['cancle']}`} onClick={cancleHandler}>
                    Cancle
                </button>
                <button className={`${styles['option-button']} ${styles['login']} ${styles[color]}`} onClick={loginHandler}>
                    Login
                </button>
            </div>
            {modal.showModal &&
                createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                    onCloseModal={closeModalHandler} />, container)}
            {isLoading &&
                createPortal(<Loader />, container)}
        </Card>
    );
}

export default Login;