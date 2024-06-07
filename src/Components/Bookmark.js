import Card from './UI/Card';
import { useSelector } from 'react-redux';
import PostItem from './PostItem';
import styles from './Bookmark.module.css';
import { getPostsByIds } from '../Config/Request';
import { useEffect, useState } from 'react';

const Bookmark = function () {

    console.count('rendered');

    const { activity, theme, color } = useSelector(state => {
        return {
            activity: state.auth.user.Activity,
            theme: state.custom.theme,
            color: state.custom.color,
        };
    });
    const [bookmarks, setBookmarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const getPosts = async () => {

            let activities = [...activity];

            const ids = [];
            activities.forEach(act => ids.push(act.postId));

            const posts = await getPostsByIds(ids);

            setBookmarks(posts);
            setIsLoading(false);
        }

        getPosts();
        //eslint-disable-next-line
    }, [activity]);

    return <Card className='main-card'>

        {isLoading ? '' :
            bookmarks.length !== 0 ?
            bookmarks.map((post, index) => {
                    return <PostItem postData={{
                        id: post.id,
                        userName: post.UserName,
                        createdDate: post.Date,
                        text: post.Data,
                        userImage: post.userProfile,
                        likes: post.Likes,
                    }} isAuthUserPost={false} key={index} />
                })
                :
                <p className={`${styles[theme]} ${styles['message']}`}>There is no bookmark yet 😀</p>
        }

        {isLoading &&
            <div className={styles['loader']}>
                <div className={`${styles['loader-spinner']} ${styles[color]}`}></div>
            </div>
        }
    </Card>;
}

export default Bookmark;