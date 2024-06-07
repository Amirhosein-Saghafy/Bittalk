import styles from './UserForm.module.css';
import Card from './Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCircleXmark, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Modal from '../Modal';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';

const UserForm = (props) => {

    const action = props.action;

    const {color , theme} = useSelector(state => state.custom);

    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [visiblePassword, setVisiblePassword] = useState(false);

    const navigate = useNavigate();
    const container = document.getElementById('container');

    const fileRef = useRef();
    const imageRef = useRef();
    const fullNameRef = useRef();
    const userNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const genderRef = useRef();
    const birthdayRef = useRef();
    const bioRef = useRef();

    const getFormData = () => {

        const [selectedImage] = fileRef.current.files;

        return {
            profileImage: (selectedImage) ? selectedImage : (action.context) ? 'Edit Mode' : '',
            fullName: fullNameRef.current.value,
            userName: userNameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            gender: genderRef.current.value,
            birthday: birthdayRef.current.value,
            bio: bioRef.current.value,
        };
    }

    const validator = function () {

        const { fullName, userName, email, password, gender, profileImage } = getFormData();

        if (fullName === '' || email === '' || password === '' || gender === '' || userName === '') {
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Please fill out the forms'
            });
            return false;
        }
        if (!email.includes('@')) {
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Please enter valid email'
            });
            return false;
        }
        if (password.length < 8) {
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Password should be at least 8 characters'
            });
            return false;
        }
        if (password === email || password === fullName || password === userName) {
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Password should not match with other fields'
            });
            return false;
        }
        if(profileImage === '' || profileImage.size > 1048576)
        {
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Please select a photo with a maximum size of 1MB for your profile',
            });
            return false;
        }

        return true;
    }

    const PasswordVisibilityHandler = function () {

        setVisiblePassword(prevState => !prevState);
    }

    const cancleHandler = function () {
        navigate(props.canclePath, {
            replace: false,
        });
    }

    const changeFileHandler = (e) => {

        const [imageFile] = e.target.files;

        if (imageFile) {

            const src = URL.createObjectURL(imageFile);

            imageRef.current.src = src;
        }
    }

    const actionHandler = () => {

        if (!validator())
            return;

        action.handler(getFormData());
    }

    const closeModalHandler = () => {
        setModal({
            showModal: false,
            title: '',
            icon: null,
            text: '',
        });
    }

    const fillForm = () => {
        imageRef.current.src = action.context.profileImage;
        fullNameRef.current.value = action.context.FullName;
        userNameRef.current.value = action.context.UserName;
        emailRef.current.disabled = true;
        emailRef.current.value = action.context.Email;
        passwordRef.current.disabled = true;
        passwordRef.current.value = action.context.Password;
        genderRef.current.value = action.context.Gender;
        bioRef.current.value = action.context.Bio;
        birthdayRef.current.value = action.context.Birthday;
    }

    useEffect(() => {
        if (action.context) {
            fillForm();
        }
        // eslint-disable-next-line
    }, []);

    return (
        <Card className={'main-card'}>
            <div className={styles['title']}>
                <h3 className={`${styles['title-text']} ${styles[theme]}`}>
                    {props.title}
                </h3>
            </div>
            <form className={styles['user-form']}>
                <div className={styles['file-input-container']}>
                    <img src={require('../../Images/profile.jpg')} alt='profile' className={styles['profile-image']} ref={imageRef} />
                    <input className={styles['file-input']} type='file' id='file-input' ref={fileRef} onChange={changeFileHandler} accept='image/png, image/jpg, image/jpeg'/>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='file-input'>
                        <span>Profile Picture</span>
                    </label>
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='name-input'>
                        <span className={styles['required']}>*</span> Full Name
                    </label>
                    <input className={`${styles['form-input']} ${styles[theme]}`} type='text' id='name-input' ref={fullNameRef} />
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='username-input'>
                        <span className={styles['required']}>*</span> User Name
                    </label>
                    <input className={`${styles['form-input']} ${styles[theme]}`} type='text' id='username-input' ref={userNameRef} />
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='email-input'>
                        <span className={styles['required']}>*</span> Email
                    </label>
                    <input className={`${styles['form-input']} ${styles[theme]}`} type='text' id='email-input' ref={emailRef} />
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='password-input'>
                        <span className={styles['required']}>*</span> Password
                    </label>
                    <div className={styles['password-input']}>
                        <input type={visiblePassword ? 'text' : 'password'} className={`${styles['form-input']} ${styles[theme]}`} ref={passwordRef} id='password-input' />
                        <button className={`${styles['show-password-button']} ${styles[theme]}`} type='button' onClick={PasswordVisibilityHandler}>
                            <FontAwesomeIcon icon={visiblePassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='gender-input'>
                        <span className={styles['required']}>*</span> Gender
                    </label>
                    <select className={styles[theme]} type='date' id='gender-input' ref={genderRef}>
                        <option value={'male'}>Male</option>
                        <option value={'female'}>Female</option>
                        <option value={'other'}>Other</option>
                    </select>
                </div>
                <div className={`${styles['input-group']} ${styles['w-50']}`}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='birthday-input'>Birthday</label>
                    <input className={`${styles['form-input']} ${styles[theme]}`} type='date' id='birthday-input' ref={birthdayRef} />
                </div>
                <div className={styles['input-group']}>
                    <label className={`${styles['form-label']} ${styles[color]}`} htmlFor='bio-input'>Bio</label>
                    <textarea className={styles[theme]} id='bio-input' rows={5} placeholder='Say something about yourself . . .' ref={bioRef}></textarea>
                </div>
            </form>
            <div className={styles['options']}>
                <button className={`${styles['option-button']} ${styles['cancle']}`} onClick={cancleHandler}>
                    Cancle
                </button>
                <button className={`${styles['option-button']} ${styles['action']} ${styles[color]}`}
                    onClick={actionHandler}>
                    {action.text}
                </button>
            </div>
            {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                onCloseModal={closeModalHandler} />, container)}
        </Card>
    );
}

export default UserForm;