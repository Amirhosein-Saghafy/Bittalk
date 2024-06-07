import { createClient } from "@supabase/supabase-js";
import { PROJECT_URL, PROJECT_API_KEY } from "./Config";
import { postSlice, userSlice, searchSlice } from "../Store/Store";

const supabase = createClient(PROJECT_URL, PROJECT_API_KEY);

const createUser = async (userID, formData) => {
  const { data: userData, error: userError } = await supabase
    .from("Users")
    .insert([
      {
        user_id: userID,
        FullName: formData.fullName,
        UserName: formData.userName,
        Email: formData.email,
        Password: formData.password,
        Birthday: formData.birthday,
        Gender: formData.gender,
        Bio: formData.bio,
        Activity: null,
        Connections: null,
      },
    ])
    .select();

  if (userError) return false;

  const [user] = userData;

  return user;
};

const checkUserName = async (userName) => {
  let { data: userData } = await supabase
    .from("Users")
    .select("user_id")
    .eq("UserName", userName);

  if (userData.length !== 0)
    return {
      isExist: true,
      userId: userData[0].user_id,
    };

  return {
    isExist: false,
  };
};

const signUp = (formData) => {
  return async (dispatch) => {
    const result = await checkUserName(formData.userName);

    if (result.isExist)
      return {
        wasSuccessful: false,
        message: "Username is already taken",
      };

    let { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError)
      return {
        wasSuccessful: false,
        message: `Could'nt sign up user, please try again`,
      };

    const user = await createUser(authData.user.id, formData);

    if (!user) {
      await supabase.auth.signOut();

      return {
        wasSuccessful: false,
        message: `Could'nt create user, please try again`,
      };
    }

    const { error: storageError } = await supabase.storage
      .from("User-Images")
      .upload(`${user.user_id}/profile-image.png`, formData.profileImage);

    if (storageError) {
      await supabase.from("Users").delete().eq("user_id", user.user_id);

      await supabase.auth.signOut();

      return {
        wasSuccessful: false,
        message: `Could'nt save user picture, please try again`,
      };
    }

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      user.user_id +
      "/profile-image.png";

    user.profileImage = imageLink;

    user.Connections = [];
    user.Activity = [];

    dispatch(userSlice.actions.authenticating(user));

    return {
      wasSuccessful: true,
      message: "Successfully registered",
    };
  };
};

const login = (loginInformation) => {
  return async (dispatch) => {
    let userName = "";

    if (loginInformation) {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginInformation.email,
          password: loginInformation.password,
        });

      if (authError) {
        dispatch(userSlice.actions.checkedAuthentication());
        return {
          wasSuccessful: false,
          message: `The email or password is not correct`,
        };
      }

      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", authData.user.id);

      if (userError) {
        dispatch(userSlice.actions.checkedAuthentication());
        return {
          wasSuccessful: false,
          message: `There is no user with this information`,
        };
      }

      const [user] = userData;

      const imageLink =
        "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
        user.user_id +
        "/profile-image.png";

      user.profileImage = imageLink;

      userName = user.UserName;

      user.Connections = user.Connections ? JSON.parse(user.Connections) : [];
      user.Activity = user.Activity ? JSON.parse(user.Activity) : [];

      dispatch(userSlice.actions.authenticating(user));
    } else {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        dispatch(userSlice.actions.checkedAuthentication());
        return {
          wasSuccessful: false,
          message: `It seems that you haven't logged in yet Please login for better user experience`,
        };
      }

      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("user_id", authData.user.id);

      if (userError) {
        dispatch(userSlice.actions.checkedAuthentication());
        return {
          wasSuccessful: false,
          message: `It seems that you haven't logged in yet Please login for better user experience`,
        };
      }

      const [user] = userData;

      const imageLink =
        "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
        user.user_id +
        "/profile-image.png";

      user.profileImage = imageLink;

      userName = user.UserName;

      user.Connections = user.Connections ? JSON.parse(user.Connections) : [];
      user.Activity = user.Activity ? JSON.parse(user.Activity) : [];

      dispatch(userSlice.actions.authenticating(user));
    }

    return {
      wasSuccessful: true,
      message: userName,
    };
  };
};

const getUser = (username) => {
  return async (dispatch) => {
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("user_id,UserName,Bio,Connections")
      .eq("UserName", username);

    if (userError || userData.length === 0) {
      return false;
    }

    let [user] = userData;

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      user.user_id +
      "/profile-image.png";

    user.profileImage = imageLink;

    user.Connections = user.Connections ? JSON.parse(user.Connections) : [];

    dispatch(searchSlice.actions.selectUser(user));
  };
};

// profile image does not update immediately

const updateUser = (formData, user_id) => {
  return async (dispatch) => {
    const result = await checkUserName(formData.userName);

    if (result.isExist && result.userId !== user_id)
      return {
        wasSuccessful: false,
        message: "Username is already taken",
      };

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .update({
        FullName: formData.fullName,
        UserName: formData.userName,
        Birthday: formData.birthday,
        Gender: formData.gender,
        Bio: formData.bio,
      })
      .eq("user_id", user_id)
      .select();

    if (userError) {
      console.log(userError);
      return {
        wasSuccessful: false,
        message: "Something went wrong, please try again",
      };
    }

    const [updatedUser] = userData;

    const { error: postError } = await supabase
      .from("Posts")
      .update({
        UserName: formData.userName,
      })
      .eq("user_id", user_id);

    if (postError)
      return {
        wasSuccessful: false,
        message: "Something went wrong, please try again",
      };

    if (formData.profileImage !== "Edit Mode") {
      const { error: storageError } = await supabase.storage
        .from("User-Images")
        .update(`${user_id}/profile-image.png`, formData.profileImage);

      if (storageError) {
        console.log(storageError);
        return {
          wasSuccessful: false,
          message: "Something went wrong, please try again",
        };
      }
    }

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      user_id +
      "/profile-image.png";

    updatedUser.profileImage = imageLink;

    updatedUser.Connections = updatedUser.Connections
      ? JSON.parse(updatedUser.Connections)
      : [];
    updatedUser.Activity = updatedUser.Activity
      ? JSON.parse(updatedUser.Activity)
      : [];

    dispatch(userSlice.actions.updateUser(updatedUser));

    return {
      wasSuccessful: true,
      message:
        "Successfully updated (if you update your profile, it takes some time to update your picture)",
    };
  };
};

const newPost = (postData) => {
  return async (dispatch) => {
    const { data, error: postError } = await supabase
      .from("Posts")
      .insert([
        {
          user_id: postData.userId,
          UserName: postData.userName,
          Date: new Date().toLocaleString(),
          Data: postData.value,
          Likes: null,
        },
      ])
      .select();

    if (postError) {
      return {
        wasSuccessful: false,
        message: postError.message,
      };
    }

    const post = data[0];
    post.Likes = post.Likes ? JSON.parse(post.Likes) : [];

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      post.user_id +
      "/profile-image.png";

    post.userProfile = imageLink;

    dispatch(postSlice.actions.addPost(post));

    return {
      wasSuccessful: true,
      message: "Successfully posted",
    };
  };
};

const getPosts = (count, currentPostCount) => {
  return async (dispatch) => {
    let result = null;

    const { data } = await supabase.auth.getUser();

    if (data.user === null) {
      result = await supabase
        .from("Posts")
        .select("*")
        .range(0, count - 1)
        .order("id", { ascending: false });

      const allPostsLoaded = managePosts(
        dispatch,
        result.data,
        currentPostCount
      );

      return allPostsLoaded ? true : null;
    }

    const user_id = data.user.id;

    const connectionsIds = await getUserConnectionsIds(user_id, dispatch);

    if (connectionsIds.length === 0) {
      result = await supabase
        .from("Posts")
        .select("*")
        .range(0, count - 1)
        .order("id", { ascending: false });

      const allPostsLoaded = managePosts(
        dispatch,
        result.data,
        currentPostCount
      );

      return allPostsLoaded ? true : null;
    }

    result = await supabase
      .from("Posts")
      .select()
      .in("user_id", connectionsIds)
      .range(0, count - 1)
      .order("id", { ascending: false });

    const allPostsLoaded = managePosts(dispatch, result.data, currentPostCount);

    if (allPostsLoaded) {
      return true;
    }

    if (result.error) {
      return {
        wasSuccessful: false,
        message: `Could'nt fetch posts, please try again`,
      };
    }
  };
};

const getUserConnectionsIds = async (userId, dispatch) => {
  const { data: userData } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", userId);

  let connections = userData[0].Connections
    ? JSON.parse(userData[0].Connections)
    : [];

  await dispatch(userSlice.actions.updateUserConnections(connections));

  if (connections.length === 0) {
    return connections;
  }

  let connectionsIds = [];

  connections.forEach((connection) => {
    if (connection.status === "confirmed") {
      connectionsIds.push(connection.id);
    }
  });

  if (connectionsIds.length === 0) {
    return connectionsIds;
  }

  connectionsIds.push(userId);

  return connectionsIds;
};

const managePosts = (dispatch, posts, currentPostCount) => {

  if (posts.length === currentPostCount) {
    return true;
  }

  if (posts.length === 0) {
    dispatch(postSlice.actions.getPosts(posts));

    return;
  }

  posts.forEach((post) => {
    const userId = post.user_id;

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      userId +
      "/profile-image.png";

    post.userProfile = imageLink;

    let Likes = post.Likes;

    Likes = Likes !== null ? JSON.parse(Likes) : [];

    post.Likes = Likes;
  });

  dispatch(postSlice.actions.getPosts(posts));
};

const getUserPosts = (userName) => {
  return async (dispatch) => {
    const { data: postData, error: postError } = await supabase
      .from("Posts")
      .select("*")
      .eq("UserName", userName)
      .order("id", { ascending: false });

    if (postError) {
      return false;
    }

    postData.forEach((post) => {
      const userId = post.user_id;

      const imageLink =
        "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
        userId +
        "/profile-image.png";

      post.userProfile = imageLink;

      let Likes = post.Likes;

      Likes = Likes !== null ? JSON.parse(Likes) : [];

      post.Likes = Likes;
    });

    dispatch(postSlice.actions.getUserPosts(postData));
  };
};

const search = (parameter) => {
  return async (dispatch) => {
    const { data: searchData, error: searchError } = await supabase
      .from("Users")
      .select("UserName,FullName,user_id")
      .ilike("UserName", `${parameter}%`)
      .range(0, 9);

    if (searchError) return false;

    const search = {
      searchParameter: parameter,
      searchResult: searchData,
    };

    search.searchResult.forEach((item) => {
      const imageLink =
        "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
        item.user_id +
        "/profile-image.png";

      item.ProfileImage = imageLink;
    });

    dispatch(searchSlice.actions.search(search));

    return true;
  };
};

const connectionRequest = async (requestData) => {
  const { requester, receiver } = requestData;

  const { data: requesterData, error: requesterError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", requester.id);

  if (requesterError) {
    console.log(requesterError.message);
    return false;
  }

  let requesterConnections = requesterData[0].Connections;
  requesterConnections = requesterConnections
    ? JSON.parse(requesterConnections)
    : [];

  requesterConnections.push({
    id: receiver.id,
    userName: receiver.userName,
    status: "pending",
    from: requester.id,
  });

  const { data: receiverData, error: receiverError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", receiver.id);

  if (receiverError) {
    console.log(receiverError.message);
    return false;
  }

  let receiverConnections = receiverData[0].Connections;
  receiverConnections = receiverConnections
    ? JSON.parse(receiverConnections)
    : [];

  receiverConnections.push({
    id: requester.id,
    userName: requester.userName,
    status: "pending",
    from: requester.id,
  });

  requesterConnections = JSON.stringify(requesterConnections);
  receiverConnections = JSON.stringify(receiverConnections);

  const { error: requesterUpdateError } = await supabase
    .from("Users")
    .update({ Connections: requesterConnections })
    .eq("user_id", requester.id);

  if (requesterUpdateError) {
    return false;
  }

  const { error: receiverUpdateError } = await supabase
    .from("Users")
    .update({ Connections: receiverConnections })
    .eq("user_id", receiver.id);

  if (receiverUpdateError) {
    return false;
  }

  return JSON.parse(requesterConnections);
};

const allowConnection = async (receiver, requesterId) => {
  const { data: receiverData, error: receiverError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", receiver.id);

  if (receiverError) {
    console.log(receiverError.message);
    return {
      status: false,
      message: "",
    };
  }

  let receiverConnections = receiverData[0].Connections;
  receiverConnections = receiverConnections
    ? JSON.parse(receiverConnections)
    : [];

  const receiverConnection = receiverConnections.find(
    (connection) => connection.id === receiver.connectionId
  );

  if (!receiverConnection) {
    return {
      status: false,
      message: "something has changed, please refresh",
    };
  }

  receiverConnection.status = "confirmed";

  receiverConnections = JSON.stringify(receiverConnections);

  const { error: receiverUpdateError } = await supabase
    .from("Users")
    .update({ Connections: receiverConnections })
    .eq("user_id", receiver.id);

  if (receiverUpdateError) {
    console.log(receiverUpdateError.message);
    return {
      status: false,
      message: "",
    };
  }

  const { data: requesterData, error: requesterError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", requesterId);

  if (requesterError) {
    console.log(requesterError.message);
    return {
      status: false,
      message: "",
    };
  }

  let requesterConnections = requesterData[0].Connections;
  requesterConnections = requesterConnections
    ? JSON.parse(requesterConnections)
    : [];

  const requesterConnection = requesterConnections.find(
    (connection) => connection.id === receiver.id
  );

  if (!requesterConnection) {
    return {
      status: false,
      message: "something has changed, please refresh",
    };
  }

  requesterConnection.status = "confirmed";

  requesterConnections = JSON.stringify(requesterConnections);

  const { error: requesterUpdateError } = await supabase
    .from("Users")
    .update({ Connections: requesterConnections })
    .eq("user_id", requesterId);

  if (requesterUpdateError) {
    console.log(requesterUpdateError.message);
    return {
      status: false,
      message: "",
    };
  }

  console.log(receiverConnections);

  return {
    status: true,
    data: receiverConnections ? JSON.parse(receiverConnections) : [],
  };
};

const rejectConnection = async (receiver, requesterId) => {
  const { data: receiverData, error: receiverError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", receiver.id);

  if (receiverError) {
    console.log(receiverError.message);
    return {
      status: false,
      message: "",
    };
  }

  let receiverConnections = receiverData[0].Connections;
  receiverConnections = receiverConnections
    ? JSON.parse(receiverConnections)
    : [];

  const receiverConnectionIndex = receiverConnections.findIndex(
    (connection) => connection.id === receiver.connectionId
  );

  if (receiverConnectionIndex === -1) {
    return {
      status: false,
      message: "something has changed, please refresh",
    };
  }

  receiverConnections.splice(receiverConnectionIndex, 1);

  receiverConnections =
    receiverConnections.length !== 0
      ? JSON.stringify(receiverConnections)
      : null;

  const { error: receiverUpdateError } = await supabase
    .from("Users")
    .update({ Connections: receiverConnections })
    .eq("user_id", receiver.id);

  if (receiverUpdateError) {
    console.log(receiverUpdateError.message);
    return {
      status: false,
      message: "",
    };
  }

  const { data: requesterData, error: requesterError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", requesterId);

  if (requesterError) {
    console.log(requesterError.message);
    return {
      status: false,
      message: "",
    };
  }

  let requesterConnections = requesterData[0].Connections;
  requesterConnections = requesterConnections
    ? JSON.parse(requesterConnections)
    : [];

  const requesterConnectionIndex = requesterConnections.findIndex(
    (connection) => connection.id === receiver.id
  );

  if (requesterConnectionIndex === -1) {
    return {
      status: false,
      message: "something has changed, please refresh",
    };
  }

  requesterConnections.splice(requesterConnectionIndex, 1);

  requesterConnections =
    requesterConnections.length !== 0
      ? JSON.stringify(requesterConnections)
      : null;

  const { error: requesterUpdateError } = await supabase
    .from("Users")
    .update({ Connections: requesterConnections })
    .eq("user_id", requesterId);

  if (requesterUpdateError) {
    console.log(requesterUpdateError.message);
    return {
      status: false,
      message: "",
    };
  }

  return {
    status: true,
    data: receiverConnections ? JSON.parse(receiverConnections) : [],
  };
};

const cancleConnectionRequest = async (requestData) => {
  const { receiver, requester } = requestData;

  const { data: requesterData, error: requesterError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", requester.id);

  if (requesterError) {
    console.log(requesterError.message);
    return false;
  }

  let requesterConnections = requesterData[0].Connections;
  requesterConnections = requesterConnections
    ? JSON.parse(requesterConnections)
    : [];

  const requesterConnectionIndex = requesterConnections.findIndex(
    (connection) => connection.id === receiver.id
  );
  if (requesterConnectionIndex !== -1) {
    requesterConnections.splice(requesterConnectionIndex, 1);
  }

  const { data: receiverData, error: receiverError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("user_id", receiver.id);

  if (receiverError) {
    console.log(receiverError.message);
    return false;
  }

  let receiverConnections = receiverData[0].Connections;
  receiverConnections = receiverConnections
    ? JSON.parse(receiverConnections)
    : [];

  const receiverConnectionIndex = receiverConnections.findIndex(
    (connection) => connection.id === requester.id
  );
  if (receiverConnectionIndex !== -1) {
    receiverConnections.splice(receiverConnectionIndex, 1);
  }

  requesterConnections =
    requesterConnections.length !== 0
      ? JSON.stringify(requesterConnections)
      : null;
  receiverConnections =
    receiverConnections.length !== 0
      ? JSON.stringify(receiverConnections)
      : null;

  const { error: requesterUpdateError } = await supabase
    .from("Users")
    .update({ Connections: requesterConnections })
    .eq("user_id", requester.id);

  if (requesterUpdateError) {
    console.log(requesterError);
    return false;
  }

  const { error: receiverUpdateError } = await supabase
    .from("Users")
    .update({ Connections: receiverConnections })
    .eq("user_id", receiver.id);

  if (receiverUpdateError) {
    console.log(receiverError);
    return false;
  }

  return requesterConnections ? JSON.parse(requesterConnections) : [];
};

const updateUserConnections = async (userName) => {
  const { data: userData, error: userError } = await supabase
    .from("Users")
    .select("Connections")
    .eq("UserName", userName);

  if (userError) {
    console.log(userError.message);
    return;
  }

  let connections = userData[0].Connections;

  connections = connections ? JSON.parse(connections) : [];

  return connections;
};

const updateActivities = (activities, userName) => {
  return async (dispatch) => {
    activities = activities.length !== 0 ? JSON.stringify(activities) : null;

    const { error: userUpdateError, data: userUpdateData } = await supabase
      .from("Users")
      .update({ Activity: activities })
      .eq("UserName", userName)
      .select("Activity");

    if (userUpdateError) {
      console.log(userUpdateError.message);
      return false;
    }

    let updatedActivities = userUpdateData[0].Activity;
    updatedActivities = updatedActivities ? JSON.parse(updatedActivities) : [];

    await dispatch(userSlice.actions.updateUserActivity(updatedActivities));

    return true;
  };
};

const getRandomPosts = async () => {
  const { data, error } = await supabase.from("Posts").select("*").range(0, 29);

  if (error) {
    console.log(error.message);
    return false;
  }

  const uniquePosts = data.filter((record, index, self) => {
    return self.findIndex((r) => r.user_id === record.user_id) === index;
  });

  uniquePosts.forEach((post) => {
    const userId = post.user_id;

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      userId +
      "/profile-image.png";

    post.userProfile = imageLink;

    let Likes = post.Likes;

    Likes = Likes !== null ? JSON.parse(Likes) : [];

    post.Likes = Likes;
  });

  return uniquePosts;
};

const getUserIdByUserName = async (userName) => {
  const { data: userData, error: userError } = await supabase
    .from("Users")
    .select("user_id")
    .eq("UserName", userName);

  if (userError) {
    console.log(userError.message);
    return;
  }

  const userId = userData[0].user_id;

  return userId;
};

const likeHandler = (postId, userId, type) => {
  return async (dispatch) => {
    const { data, error } = await supabase
      .from("Posts")
      .select("*")
      .eq("id", postId);

    if (error) {
      console.log(error.message);
      return false;
    }

    let { id, user_id, UserName, Date, Data, Likes } = data[0];

    Likes = Likes !== null ? JSON.parse(Likes) : [];

    const likeIndex = Likes.findIndex((like) => like.userId === userId);

    if (likeIndex === -1) {
      if (type) {
        Likes.push({
          userId: userId,
        });
      }
    } else {
      if (!type) {
        Likes.splice(likeIndex, 1);
      }
    }

    const strLikes = Likes.length !== 0 ? JSON.stringify(Likes) : null;

    const { error: updateError } = await supabase
      .from("Posts")
      .update({
        Likes: strLikes,
      })
      .eq("id", postId);

    if (updateError) {
      console.log(updateError.message);
      return false;
    }

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      user_id +
      "/profile-image.png";

    const newPost = {
      id,
      user_id,
      UserName,
      Date,
      Data,
      Likes,
      userProfile: imageLink,
    };

    dispatch(postSlice.actions.updatePost({ newPost, postId }));

    return true;
  };
};

const getPostsByIds = async (ids) => {
  const { data, error } = await supabase.from("Posts").select().in("id", ids);

  if (error) {
    console.log(error.message);
    return false;
  }

  let posts = data;

  posts.forEach((post) => {
    const userId = post.user_id;

    const imageLink =
      "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
      userId +
      "/profile-image.png";

    post.userProfile = imageLink;

    let Likes = post.Likes;

    Likes = Likes !== null ? JSON.parse(Likes) : [];

    post.Likes = Likes;
  });

  return posts;
};

export {
  signUp,
  login,
  getUser,
  updateUser,
  newPost,
  getPosts,
  getUserPosts,
  search,
  connectionRequest,
  allowConnection,
  rejectConnection,
  cancleConnectionRequest,
  updateUserConnections,
  updateActivities,
  getRandomPosts,
  getUserIdByUserName,
  likeHandler,
  getPostsByIds,
};