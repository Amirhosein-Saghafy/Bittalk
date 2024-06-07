import SearchItem from './SearchItem';
import Card from './UI/Card';
import styles from './SearchResult.module.css';
import { useSelector } from 'react-redux';

const SearchResult = () => {

    const searchResult = useSelector(state => state.search.searchResult);
    const theme = useSelector(state => state.custom.theme);

    return (
        <Card className='main-card'>
            <div className={styles['content']}>
                {
                    (searchResult && searchResult.length > 0) ?
                        searchResult.map(item =>
                            <SearchItem itemImage={item.ProfileImage} itemUsername={item.UserName} itemFullname={item.FullName} key={item.user_id}/>
                        ) :
                        <p className={styles[theme]}>No result found</p>
                }
            </div>
        </Card>
    );
}

export default SearchResult;