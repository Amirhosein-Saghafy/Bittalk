import { useEffect, useState } from 'react';
import Card from './UI/Card';
import PostItem from './PostItem';
import { getRandomPosts } from '../Config/Request';
import styles from './Explore.module.css';
import { useSelector } from 'react-redux';

const Explore = function () {

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { color, user, theme } = useSelector(state => {
        return {
            theme: state.custom.theme,
            color: state.custom.color,
            user: state.auth.user
        }
    });

    useEffect(function () {

        async function getPosts() {

            const data = await getRandomPosts();

            setPosts(data);
            setIsLoading(false);
        }

        getPosts();
    }, []);

    return <Card className='main-card'>
        {
            isLoading &&
            <div className={styles['loader']}>
                <div className={`${styles['loader-spinner']} ${styles[color]}`}></div>
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
                    }} isAuthUserPost={user.user_id === post.user_id} key={post.id} canClick={true} />
                ) :
                !isLoading && posts.length === 0 ?
                    <p style={{textAlign: 'center'}}  className={styles[theme]}>Nobody exist in the world ?!🤔</p> : ''
        }
    </Card>
}

export default Explore;