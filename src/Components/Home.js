import styles from './Home.module.css';
import PostItem from './PostItem';
import Card from './UI/Card';
import { useSelector, useDispatch } from 'react-redux';
import { getPosts } from '../Config/Request';
import { useEffect, useState } from 'react';

const Home = () => {

    const { publicPosts, user, color, theme } = useSelector(state => {
        return {
            publicPosts: state.posts.publicPosts,
            user: state.auth.user,
            color: state.custom.color,
            theme: state.custom.theme,
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [allPostsLoaded, setAllPostsLoaded] = useState(false);

    const dispatch = useDispatch();

    const refresh = async (count, currentPostCount) => {

      const allPostsLoaded = await dispatch(getPosts(count, currentPostCount));
  
      if (allPostsLoaded) {
        setAllPostsLoaded(true);
      }
  
      setIsLoading(false);
    };

    useEffect(() => {

        if (publicPosts.length === 0) {
            refresh(10, publicPosts.length);
        }
        else {
            setIsLoading(false);
        }
        // eslint-disable-next-line
    }, []);

    const scrollHandler = (e) => {

        const scrollTop = Math.ceil(e.target.scrollTop);
        const clientHeight = e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        const childElementCount = e.target.childElementCount;

        if ((scrollTop + clientHeight) >= scrollHeight && !isLoading && !allPostsLoaded) {
            setIsLoading(true);
            refresh(childElementCount + 10, childElementCount);
        }
    }

    return (
        <Card className='main-card'>
            <div className={styles['content']} onScroll={scrollHandler}>
                {
                    publicPosts.length > 0 ?
                        publicPosts.map(post =>
                            <PostItem postData={{
                                id: post.id,
                                userName: post.UserName,
                                createdDate: post.Date,
                                text: post.Data,
                                userImage: post.userProfile,
                                likes: post.Likes,
                            }} isAuthUserPost={user?.user_id === post.user_id} key={post.id} />)
                        :
                        !isLoading ?
                            <p className={styles[theme]}>Be the first one to post 😄</p> : ''
                }
                {isLoading &&
                    <div className={styles['loader']}>
                        <div className={`${styles['loader-spinner']} ${styles[color]}`}></div>
                    </div>
                }
            </div>
        </Card>
    );
}

export default Home;