import PostItem from './PostItem';
import Card from './UI/Card';
import styles from './Profile.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCross, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faClock, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserPosts, connectionRequest, cancleConnectionRequest, getUser, updateUserConnections } from '../Config/Request';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { userSlice } from '../Store/Store';
import Modal from './Modal';
import Loader from './Loader';

const Profile = () => {

    const { username } = useParams();

    const { posts, user, searchUser, isAuthUser, custom } = useSelector(state => {
        return {
            posts: state.posts.userPosts,
            user: state.auth.user,
            searchUser: state.search.selectedUser,
            isAuthUser: (username === state.auth.user.UserName) ? true : false,
            custom: state.custom,
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [connectButton, setConnectButton] = useState('Connect');

    let hasChanged = useRef();
    let hasRequest = useRef();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const container = document.getElementById('container');

    useEffect(() => {

        const refreshPosts = async function () {
            setIsLoading(true);
            await dispatch(getUserPosts(username));
            setIsLoading(false);
        }

        refreshPosts();

    }, [dispatch, username]);

    useEffect(() => {

        if (!isAuthUser) {

            searchUser.Connections.forEach((connection, index) => {

                if (connection.id === user.user_id) {

                    if (connection.from === searchUser.user_id) {

                        if (connection.status === 'confirmed') {
                            setConnectButton('Connected');
                        }

                        else {
                            hasRequest.current = true;
                        }
                    }
                    else {

                        if (connection.status === 'confirmed') {
                            setConnectButton('Connected');
                        }
                        else if (connection.status === 'pending') {
                            setConnectButton('Pending');
                        }
                    }
                }
            })
        }
        // eslint-disable-next-line
    }, []);

    const editProfile = () => {
        navigate(`/edit-profile/${username}`, {
            replace: false,
        });
    }

    const checkChange = (prevConnections, newConnections) => {

        let prevConnection, newConnection, message;

        if (prevConnections) {
            prevConnection = prevConnections.find(connection => connection.id === searchUser.user_id);
        }

        if (newConnections) {
            newConnection = newConnections.find(connection => connection.id === searchUser.user_id);
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

    const connectionHandler = async (e) => {

        setLoader(true);

        const connections = await updateUserConnections(user.UserName);

        const message = checkChange(user.Connections, connections);

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

        if (hasRequest.current) {

            setModal({
                showModal: true,
                title: 'Warning',
                text: 'You had already connection request from this user, please accept or disline or if you did, please refresh your page',
                icon: {
                    name: faTriangleExclamation,
                    color: 'red',
                }
            });

            setLoader(false);

            return;
        }

        if (connectButton === 'Connect') {

            const requester = {
                id: user.user_id,
                userName: user.UserName,
            }

            const receiver = {
                id: searchUser.user_id,
                userName: searchUser.UserName,
            }

            let res = await connectionRequest({ requester, receiver });

            if (res) {

                await dispatch(userSlice.actions.updateUserConnections(res));

                await dispatch(getUser(username));

                setConnectButton('Pending');

                setModal({
                    showModal: true,
                    title: 'Success',
                    text: 'Request successfully sent',
                    icon: {
                        name: faCircleCheck,
                        color: 'green',
                    },
                });
            }
        }
        else {

            const receiver = {
                id: searchUser.user_id,
            }

            const requester = {
                id: user.user_id,
            }

            const res = await cancleConnectionRequest({ receiver, requester });

            if (res) {

                await dispatch(userSlice.actions.updateUserConnections(res));

                await dispatch(getUser(username));

                setConnectButton('Connect');

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
                setConnectButton('Pending');
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

    return (
        <Card className='main-card'>
            <div className={styles['user-information']}>
                <div className={styles['user-photo']}>
                    <img src={isAuthUser ? user.profileImage : searchUser.profileImage} alt='user' />
                </div>
                <div className={styles['user-details']}>
                    <div className={styles['heading']}>
                        <h5 className={`${styles['username']} ${styles[custom.color]}`}>
                            {isAuthUser ? user.UserName : searchUser.UserName}
                        </h5>
                        {
                            !isAuthUser &&
                            <button className={connectButton === 'Connected' || connectButton === 'Pending' ?
                                `${styles['connected-button']}` : `${styles['connect-button']} ${styles[custom.color]}`} onClick={connectionHandler} >
                                {connectButton}
                                <FontAwesomeIcon icon={connectButton === 'Pending' ? faClock : faUser} className={styles['follow-icon']} />
                            </button>
                        }
                        {
                            isAuthUser &&
                            <button className={styles['edit-button']} onClick={editProfile} >
                                Edit Profile
                            </button>
                        }
                    </div>
                    <div className={styles['user-statistics']}>
                        <div className={styles['user-statistic']}>
                            <span className={`${styles['statistic-value']} ${styles[custom.theme]}`}>{isLoading ? 'Checking' : posts.length}
                            </span>
                            <span className={styles['statistic-name']}>posts</span>
                        </div>
                        <div className={styles['user-statistic']}>
                            <span className={`${styles['statistic-value']} ${styles[custom.theme]}`}>{isAuthUser ?

                                user.Connections.reduce((acc, connection) => {

                                    if (connection.status === 'confirmed')
                                        acc++;

                                    return acc;

                                }, 0) :
                                searchUser.Connections.reduce((acc, connection) => {

                                    if (connection.status === 'confirmed')
                                        acc++;

                                    return acc;

                                }, 0)
                            }
                            </span>
                            <span className={styles['statistic-name']}>connection</span>
                        </div>
                    </div>
                    <div className={styles['user-bio']}>
                        <p>
                            {isAuthUser ? user.Bio : searchUser.Bio}
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles['user-posts']}>
                <div className={styles['title']}>
                    <h3 className={styles[custom.theme]}>Posts</h3>
                </div>
                {isLoading &&
                    <div className={styles['loader']}>
                        <div className={`${styles['loader-spinner']} ${styles[custom.color]}`}></div>
                    </div>
                }
                {
                    !isLoading && posts.length !== 0 ?
                        posts.map(post =>
                            <PostItem postData={{
                                id: post.id,
                                userName: post.UserName,
                                createdDate: post.Date,
                                text: post.Data,
                                userImage: post.userProfile,
                                likes: post.Likes,
                            }} isAuthUserPost={isAuthUser} key={post.id} canClick={false} />
                        ) :
                        !isLoading && posts.length === 0 ?
                            <p className={`${styles[custom.theme]}`}>
                                Make your first post 😄
                            </p> : ''
                }
            </div>
            {modal.showModal && createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                onCloseModal={closeModalHandler} />, container)}
            {loader && createPortal(<Loader />, container)}
        </Card>
    );
}

export default Profile;