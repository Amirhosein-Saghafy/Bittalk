import styles from './Sidebar.module.css';
import Card from './UI/Card';
import { useNavigate } from 'react-router-dom';
import { faHome, faGear, faPalette, faRightToBracket, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faBookmark, faUser, faUserCircle, faSquarePlus, faBell } from '@fortawesome/free-regular-svg-icons';
import SidebarItem from './SidebarItem';
import { useSelector } from 'react-redux';

const Sidebar = () => {

    const { isLoggedIn, user } = useSelector(state => state.auth);
    const color = useSelector(state => state.custom.color);

    const navigate = useNavigate();

    const createPostHandler = () => {
        navigate('/new-post', {
            replace: false,
        });
    }

    return (
        <Card className={'side-card'}>
            {isLoggedIn &&
                <div className={styles['user-section']}>
                    <img className={styles['user-image']} src={user.profileImage} alt='user profile' />
                    <div className={styles['username']}>
                        <span className={`${styles['username-text']} ${styles[color]}`}>{user.FullName}</span>
                        <span className={styles['user-id']}>@{user.UserName}</span>
                    </div>
                </div>
            }
            <ul className={styles['options-list']}>
                <SidebarItem icon={faHome} text='Home' path='/' />
                {isLoggedIn &&
                    <>
                        <SidebarItem icon={faUsers} text='Connections' path='/connections' />
                        <SidebarItem icon={faBell} text='Notifications' path='/notifications' className='notifications'/>
                        <SidebarItem icon={faBookmark} text='Bookmarks' path='/bookmark' />
                        <SidebarItem icon={faSearch} text='Explore' path='/explore' />
                        <SidebarItem icon={faPalette} text='Themes' path='/theme' />
                        <SidebarItem icon={faGear} text='Settings' path='/settings' />
                        <SidebarItem icon={faUser} text='Profile' path={`/profile/${user['UserName']}`} />
                        <SidebarItem icon={faSquarePlus} text='' path='/new-post' className='new-post' />
                    </>
                }
                {!isLoggedIn &&
                    <>
                        <SidebarItem icon={faUserCircle} text='Register' path='/register' />
                        <SidebarItem icon={faRightToBracket} text='Login' path='/login' />
                    </>
                }
            </ul>
            {isLoggedIn &&
                <button className={`${styles['create-post']} ${styles[color]}`} onClick={createPostHandler}>Create Post</button>
            }
        </Card>
    );
}

export default Sidebar;