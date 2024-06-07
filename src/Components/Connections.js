import Card from './UI/Card';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSlice } from '../Store/Store';
import Loader from './Loader';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTriangleExclamation, faCross, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './Connections.module.css';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUserConnections, cancleConnectionRequest, getUserIdByUserName } from '../Config/Request';

const Connections = function () {

    const { user, custom } = useSelector(state => {
        return {
            user: state.auth.user,
            custom: state.custom,
        }
    });

    const [loader, setLoader] = useState(true);
    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hasChanged = useRef();

    const container = document.getElementById('container');

    useEffect(function () {

        const updateConnections = async function () {

            const connections = await updateUserConnections(user.UserName);

            dispatch(userSlice.actions.updateUserConnections(connections));

            setLoader(false);
        }

        updateConnections();

        // eslint-disable-next-line
    }, []);

    const selectUserHandler = async function (e) {

        setLoader(true);

        const userName = e.target.closest('#header').querySelector('h4').textContent;

        await dispatch(getUser(userName));

        navigate(`/profile/${userName}`, {
            replace: false,
        });
    }

    const checkChange = (prevConnections, newConnections, userName) => {

        let prevConnection, newConnection, message;

        if (prevConnections) {
            prevConnection = prevConnections.find(connection => connection.userName === userName);
        }

        if (newConnections) {
            newConnection = newConnections.find(connection => connection.userName === userName);
        }

        if (prevConnection) {

            if (newConnection) {

                for (const key in prevConnection) {

                    if (prevConnection[key] !== newConnection[key]) {
                        hasChanged.current = true;
                        message = 'Something has changed, please refresh your page';
                        break;
                    }
                }
            }
            else {
                hasChanged.current = true;
                message = 'Something has changed, maybe this user rejected your request or disconnected from you please refresh your page';
            }
        }
        else {

            if (newConnection) {
                hasChanged.current = true;
                message = 'Something has changed, maybe this user sent you a connection request please refresh your page';
            }
        }

        return message;
    }

    const disconnectHandler = async function (e) {

        setLoader(true);

        const userName = e.target.closest('div').querySelector('h4').textContent;

        const connections = await updateUserConnections(user.UserName);

        const message = checkChange(user.Connections, connections, userName);

        if (hasChanged.current) {

            setModal({
                showModal: true,
                title: 'Warning',
                text: message,
                icon: {
                    name: faTriangleExclamation,
                    color: 'red',
                }
            });

            setLoader(false);

            return;
        }

        const userId = await getUserIdByUserName(userName);

        const receiver = {
            id: userId,
        }

        const requester = {
            id: user.user_id,
        }

        const res = await cancleConnectionRequest({ receiver, requester });

        if (res) {

            await dispatch(userSlice.actions.updateUserConnections(res));

            setModal({
                showModal: true,
                title: 'Success',
                text: 'Request successfully cancled',
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
                text: 'Something went wrong please try again',
                icon: {
                    name: faCross,
                    color: 'red',
                },
            });
        }

        setLoader(false);
    }

    const closeModalHandler = function () {

        setModal({
            showModal: false,
            title: '',
            icon: null,
            text: '',
        });
    }

    const renderConnections = function () {

        const connections = user.Connections.reduce((acc, connection) => {

            if (connection.status === 'confirmed') {

                const userId = connection.id;

                const imageLink = 'https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/' + userId + '/profile-image.png';

                const markup = <div className={styles['connection-item']}>
                    <div className={styles['header']} id='header'>
                        <div className={styles['user-image']} onClick={selectUserHandler}>
                            <img src={imageLink} alt='user' />
                        </div>
                        <h4 className={`${styles['username']} ${styles[custom.color]}`}>
                            {connection.userName}
                        </h4>
                    </div>
                    <button className={`${styles['button']}`} onClick={disconnectHandler}>
                        Connected
                        <FontAwesomeIcon icon={faUser}
                            className={`${styles['button-icon']} ${styles[custom.theme]}`} />
                    </button>
                </div>;

                acc.push(markup);
            }

            return acc;
        }, []);

        return connections.length === 0 ?
            <p className={`${styles[custom.theme]} ${styles['message']}`}>
                It's time to make some friends 😃
            </p> :
            connections;
    }

    return <Card className='main-card'>

        {renderConnections()}
        {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
            onCloseModal={closeModalHandler} />, container)}
        {loader && createPortal(<Loader />, container)}
    </Card>
}

export default Connections;