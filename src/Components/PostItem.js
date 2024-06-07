import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './PostItem.module.css';
import { faHeart, faBookmark, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faSolidBookmark, faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import Modal from './Modal';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from './Loader';
import { getUser, updateActivities, likeHandler as likeRequest } from '../Config/Request';

const PostItem = ({ postData, isAuthUserPost }) => {

    const { isLoggedIn, user } = useSelector(state => state.auth);
    const { color, theme } = useSelector(state => state.custom);
    
    const [modal, setModal] = useState({
        showModal: false,
        title: '',
        text: '',
        icon: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCounter, setLikeCounter] = useState(postData.likes.length);
    const [hasClicked, setHasClicked] = useState(false);

    const container = document.getElementById('container');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const activities = user ? [...user.Activity] : [];

    useEffect(() => {

        const isExistBookmark = activities.some(act => {
            return (act.type === 'bookmark' && act.postId === postData.id);
        });

        if (isExistBookmark) {
            setIsBookmarked(true);
        }
        // eslint-disable-next-line
    }, [activities]);

    useEffect(() => {

        if (user) {
            const isLiked = postData.likes.find(like => like.userId === user.id);

            if (isLiked) {
                setIsLiked(true);
            }
        }

        //eslint-disable-next-line
    }, []);

    useEffect(() => {

        const sendRequest = async function () {

            if (hasClicked) {

                const res = await dispatch(likeRequest(postData.id, user.id, isLiked));

                setHasClicked(false);

                if (!res) {
                    setModal({
                        showModal: true,
                        title: 'Faild',
                        text: 'Something wrong, please try again',
                        icon: {
                            name: faCircleXmark,
                            color: 'red',
                        }
                    })
                }
            }
        }

        const timer = setTimeout(() => {
            sendRequest();
        }, 750);

        return function () {
            clearTimeout(timer);
        }

        //eslint-disable-next-line
    }, [isLiked]);

    const closeModalHandler = function () {
        setModal({
            showModal: false,
            title: '',
            icon: null,
            text: '',
        });
    }

    const likeHandler = async function () {

        if (!isLoggedIn) {
            
            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Please login or register first',
            });

            return;
        }

        setHasClicked(true);

        setIsLiked(!isLiked);

        setLikeCounter(!isLiked ? likeCounter + 1 : likeCounter - 1);
    }

    const bookmarkHandler = async () => {

        setIsLoading(true);

        if (!isLoggedIn) {

            setModal({
                showModal: true,
                title: 'Failed',
                icon: {
                    name: faCircleXmark,
                    color: 'red',
                },
                text: 'Please login or register first',
            });

            setIsLoading(false);

            return;
        }

        if (isBookmarked) {

            const bookmarkIndex = activities.findIndex(act => {

                return act.type === 'bookmark' && act.postId === postData.id;
            })

            if (bookmarkIndex === -1) {
                setModal({
                    showModal: false,
                    title: 'Failed',
                    text: 'Something went wrong please refresh your page',
                    icon: {
                        name: faCircleXmark,
                        color: 'red'
                    },
                })

                return;
            }

            activities.splice(bookmarkIndex, 1);
        }
        else {

            const bookmarkPost = {
                type: 'bookmark',
                postId: postData.id,
            }

            activities.push(bookmarkPost);
        }

        const res = await dispatch(updateActivities(activities, user.UserName));

        if (res) {

            setIsBookmarked(!isBookmarked);
        }
        else {
            setModal({
                showModal: false,
                title: 'Failed',
                text: 'Something went wrong, please try again',
                icon: {
                    name: faCircleXmark,
                    color: 'red'
                },
            })
        }

        setIsLoading(false);
    }

    const calculateDate = () => {

        const postDate = new Date(postData.createdDate);
        const nowDate = new Date();

        const distance = nowDate.getTime() - postDate.getTime();

        const passedYears = Math.floor(distance / (1000 * 60 * 60 * 24 * 30 * 12));

        if (passedYears)
            return `${passedYears} years ago`;

        const passedMonths = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));

        if (passedMonths)
            return `${passedMonths} months ago`;

        const passedDays = Math.floor(distance / (1000 * 60 * 60 * 24));

        if (passedDays)
            return `${passedDays} days ago`;

        const passedHours = Math.floor(distance / (1000 * 60 * 60));

        if (passedHours)
            return `${passedHours} hours ago`;

        const passedMinutes = Math.floor(distance / (1000 * 60));

        if (passedMinutes)
            return `${passedMinutes} minutes ago`;

        const passedSeconds = Math.floor(distance / (1000));

        return `${passedSeconds} seconds ago`;
    }
    const passedTime = calculateDate();

    const selectUserHandler = async () => {

        if (!isLoggedIn){

            setModal({
                showModal: true,
                title: "Failed",
                text: "Please login or register first",
                icon: {
                  name: faCircleXmark,
                  color: "red",
                },
              });

            return;
        }

        setIsLoading(true);

        await dispatch(getUser(postData.userName));

        navigate(`/profile/${postData.userName}`, {
            replace: false,
        });
    }

    return (
        <div className={`${styles['post-item']} ${styles[theme]}`}>
            <div className={styles['header']}>
                <div className={styles['user-image']} onClick={selectUserHandler}>
                    <img src={postData.userImage} alt='user' />
                </div>
                <div className={styles['post-details']}>
                    <h4 className={`${styles['username']} ${styles[color]}`}>
                        {postData.userName}
                    </h4>
                    <span className={styles['post-date']}>
                        {passedTime}
                    </span>
                </div>
            </div>
            <div className={styles['main']}>
                <p className={`${styles['post-text']} ${styles[theme]}`}>
                    {postData.text}
                </p>
            </div>
            <div className={styles['options']}>
                <button className={`${styles['button']}`} onClick={likeHandler}>
                    <FontAwesomeIcon icon={isLiked ? faSolidHeart : faHeart}
                        className={`${styles['button-icon']} ${isLiked ? styles['fill-like'] : styles[theme]}`} />
                </button>
                {!isAuthUserPost &&
                    <button className={`${styles['button']}`} onClick={bookmarkHandler}>
                        <FontAwesomeIcon icon={isBookmarked ? faSolidBookmark : faBookmark}
                            className={`${styles['button-icon']} ${isBookmarked ? `${styles['fill']} 
                            ${styles[color]}` : styles[theme]}`} />
                    </button>
                }
            </div>
            <div className={styles['likes-counter']}>
                <span className={styles[theme]}>{likeCounter !== 0 ? `${likeCounter} Likes` : ``}</span>
            </div>
            {
                modal.showModal &&
                createPortal(<Modal title={modal.title} icon={modal.icon} text={modal.text}
                    onCloseModal={closeModalHandler} />, container)
            }
            {isLoading && createPortal(<Loader />, container)}
        </div>
    );
}

export default PostItem;