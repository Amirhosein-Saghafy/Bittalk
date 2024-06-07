import UserForm from './UI/UserForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../Config/Request';
import { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { createPortal } from 'react-dom';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';

const EditProfile = () => {

    const { user } = useSelector(state => state.auth);
    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const container = document.getElementById('container');
    const dispatch = useDispatch();

    const updateProfile = async (formData) => {

        setIsLoading(true);

        const res = await dispatch(updateUser(formData, user.user_id));

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

    const closeModalHandler = () => {
        setModal({
            showModal: false,
            title: '',
            text: '',
            icon: null,
        });
    }

    return (
        <>
            <UserForm action={{
                text: 'Save',
                handler: updateProfile,
                context: user,
            }} title='Edit Profile' canclePath={`/profile/${user.UserName}`} />
            {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                onCloseModal={closeModalHandler} />, container)}
            {isLoading && createPortal(<Loader />, container)}
        </>
    );
}

export default EditProfile;