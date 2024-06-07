import Header from '../Header';
import Notification from '../Notification';
import Sidebar from '../Sidebar';
import styles from './Layout.module.css';
import { useSelector } from 'react-redux';

const Layout = ({ children }) => {

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const theme = useSelector(state => state.custom.theme);

    return (
        <>
            <Header />
            <main className={`${styles['main']} ${styles[theme]}`}>
                <div className={styles['main-container']}>
                    <div className={styles['main-content']}>
                        <Sidebar />
                        {children}
                        {isLoggedIn && <div className={styles['notify-container']}><Notification /></div>}
                    </div>
                </div>
            </main>
        </>
    );
}

export default Layout;