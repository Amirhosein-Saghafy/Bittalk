import { useState } from 'react';
import Modal from './Modal';
import { createPortal } from 'react-dom';
import Loader from './Loader';
import UserForm from './UI/UserForm';
import { useDispatch, useSelector } from 'react-redux';
import { signUp } from '../Config/Request';
import { faCircleXmark, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    const container = document.getElementById('container');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const closeModalHandler = function () {

        if (isLoggedIn) {
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

    const register = async (formData) => {

        setIsLoading(true);

        const res = await dispatch(signUp(formData));

        if (res.wasSuccessful) {
            setModal({
                showModal: true,
                title: 'Success',
                text: res.message,
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
                text: res.message,
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
            });
        }

        setIsLoading(false);
    }

    return (
        <>
            <UserForm action={{
                text: 'SignUp',
                handler: register,
            }} title='SignUp' canclePath='/' />
            {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                onCloseModal={closeModalHandler} />, container)}
            {isLoading && createPortal(<Loader />, container)}
        </>
    );
}

export default SignUp;