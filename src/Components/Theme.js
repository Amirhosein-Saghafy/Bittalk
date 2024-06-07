import Card from './UI/Card';
import styles from './Theme.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { customizationSlice } from '../Store/Store';

const Theme = function () {

    const dispatch = useDispatch();
    const theme = useSelector(state => state.custom.theme);

    const setColorHandler = function (e) {

        const color = e.target.dataset.value;

        dispatch(customizationSlice.actions.setColor(color));
    }

    const setThemeHandler = function(e){

        let theme = e.target.textContent;
        theme = theme.toLowerCase();

        if(theme === 'lights out')
        {
            theme = 'dark';
        }

        dispatch(customizationSlice.actions.setTheme(theme));
    }

    return <Card className='main-card'>
        <p className={`${styles['title']} ${styles[theme]}`}>Customize your view</p>
        <p className={styles['subtitle']}>Manage your color and background</p>
        <div className={styles['container']}>
            <label className={`${styles['label']} ${styles[theme]}`}>Color</label>
            <div className={`${styles['options']} ${styles[theme]}`}>
                <input type='button' className={`${styles['option']} ${styles['primary']}`} 
                onClick={setColorHandler} data-value='primary'/>
                <input type='button' className={`${styles['option']} ${styles['yellow']}`} 
                onClick={setColorHandler} data-value='yellow'/>
                <input type='button' className={`${styles['option']} ${styles['red']}`} 
                onClick={setColorHandler} data-value='red'/>
                <input type='button' className={`${styles['option']} ${styles['green']}`} 
                onClick={setColorHandler} data-value='green'/>
                <input type='button' className={`${styles['option']} ${styles['blue']}`} 
                onClick={setColorHandler} data-value='blue'/>
            </div>
        </div>
        <div className={styles['container']}>
            <label className={`${styles['label']} ${styles[theme]}`}>Background</label>
            <div className={styles['background-options']}>
                <button className={`${styles['background-option']} ${styles['light']}`} onClick={setThemeHandler}>
                    <div className={styles['circle']}></div>
                    <span className={styles['text']}>Light</span>
                </button>
                <button className={`${styles['background-option']} ${styles['dim']}`} onClick={setThemeHandler}>
                    <div className={styles['circle']}></div>
                    <span className={styles['text']}>Dim</span>
                </button>
                <button className={`${styles['background-option']} ${styles['dark']}`} onClick={setThemeHandler}>
                    <div className={styles['circle']}></div>
                    <span className={styles['text']}>Lights Out</span>
                </button>
            </div>
        </div>
    </Card>;
}

export default Theme;