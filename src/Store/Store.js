import { createSlice } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'User Authentication',
    initialState: {
        isLoggedIn: undefined,
        user: null,
    },
    reducers: {
        checkedAuthentication(prevState){
            prevState.isLoggedIn = false;
            return prevState;
        },
        authenticating(prevState, data) {
            prevState.isLoggedIn = true;
            prevState.user = data.payload;
            return prevState;
        },
        updateUser(prevState, data) {
            prevState.user = data.payload;
            return prevState;
        },
        updateUserConnections(prevState, data) {
            prevState.user.Connections = data.payload;
            return prevState;
        },
        updateUserActivity(prevState, data) {
            prevState.user.Activity = data.payload;
            return prevState;
        }
    }
})

const postSlice = createSlice({
    name: 'Post',
    initialState: {
        publicPosts: [],
        userPosts: [],
    },
    reducers: {
        getPosts(prevState, { payload }) {
            prevState.publicPosts = payload;
            return prevState;
        },
        getUserPosts(prevState, { payload }) {
            prevState.userPosts = payload;
            return prevState;
        },
        updatePost(prevState, { payload }) {

            const postIndex = prevState.publicPosts.findIndex(post => post.id === payload.postId);

            if (postIndex !== -1) {
            
                prevState.publicPosts.splice(postIndex, 1, payload.newPost);
            } 
            return prevState;
        },
        addPost(prevState, {payload})
        {
            prevState.publicPosts.unshift(payload);
            return prevState;
        }
    }
})

const searchSlice = createSlice({
    name: 'Search',
    initialState: {
        searchParameter: '',
        searchResult: null,
        selectedUser: null,
    },
    reducers: {
        search(prevState, { payload }) {

            prevState.searchParameter = payload.searchParameter;
            prevState.searchResult = payload.searchResult;

            return prevState;
        },
        selectUser(prevState, { payload }) {

            prevState.selectedUser = payload;

            return prevState;
        }
    },
}
);

const customizationSlice = createSlice({

    name: 'customization',

    initialState: {
        color: 'primary',
        theme: 'light',
    },

    reducers: {

        setColor(prevState, data) {
            prevState.color = data.payload;
            return prevState;
        },
        setTheme(prevState, data) {
            prevState.theme = data.payload;
            return prevState;
        }
    }
});

const store = configureStore({
    reducer: {
        auth: userSlice.reducer,
        posts: postSlice.reducer,
        search: searchSlice.reducer,
        custom: customizationSlice.reducer,
    }
});

export default store;
export { userSlice, postSlice, searchSlice, customizationSlice };