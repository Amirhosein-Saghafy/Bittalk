import { NavLink } from 'react-router-dom';
import Card from './UI/Card';
import { useSelector } from 'react-redux';
import styles from './Settings.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const Settings = function () {

    const { username, custom } = useSelector(state => {
        return {
            username: state.auth.user.UserName,
            custom: state.custom,
        }
    });

    const [openAccordion, setOpenAccordion] = useState(false);

    const accordionHandler = function (e) {

        setOpenAccordion(!openAccordion);
    }

    return <Card className='main-card'>
        <NavLink to={`/edit-profile/${username}`}
            className={flag => flag.isActive ? `${styles[custom.color]}` : `${styles[custom.theme]}`}>
            <span className={styles['option-text']}>
                Edit Profile
            </span>
        </NavLink>
        <div className={styles['accordion']} onClick={accordionHandler}>
            <span className={`${styles['accordion-label']} ${styles[custom.theme]}`}>
                What is this?
                <FontAwesomeIcon icon={openAccordion ? faAngleUp : faAngleDown} />
            </span>
            <p className={`${styles['accordion-text']} ${openAccordion ? styles['open'] : ''} 
            ${styles[custom.theme]}`}>
                This web application developed by <b className={styles[custom.color]}>Amirhosein Saghafy</b> with some technologies such as React, Redux, Redux Toolkit, React Router and Supabase as backend and also Font Awesome Icon Packages .<br />
                It's a social network that users can follow each other, see each other's posts, bookmark posts and some other stuff . this web app can switch between 3 modes and has 5 color which makes it more customizable per user .<br />
                It's a personal project and has no commercial purposes, hope enjoy using this 😄
            </p>
        </div>
    </Card>
}

export default Settings;