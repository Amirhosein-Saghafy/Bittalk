import { Suspense, lazy, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { login } from "./Config/Request";
import Loader from "./Components/Loader";
import Modal from "./Components/Modal";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

const Index = lazy(() => import("./Pages/Index"));
const Home = lazy(() => import("./Pages/Home"));
const Bookmark = lazy(() => import("./Pages/Bookmark"));
const Connections = lazy(() => import("./Pages/Connections"));
const EditProfile = lazy(() => import("./Pages/EditProfile"));
const Explore = lazy(() => import("./Pages/Explore"));
const Login = lazy(() => import("./Pages/Login"));
const NewPost = lazy(() => import("./Pages/NewPost"));
const Notification = lazy(() => import("./Pages/Notifications"));
const Profile = lazy(() => import("./Pages/Profile"));
const Register = lazy(() => import("./Pages/Register"));
const SearchResult = lazy(() => import("./Pages/SearchResult"));
const Settings = lazy(() => import("./Pages/Settings"));
const Theme = lazy(() => import("./Pages/Theme"));

export default function App() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [loader, setLoader] = useState(true);
  const [modal, setModal] = useState({
    showModal: false,
    title: "",
    text: "",
    icon: null,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const container = document.getElementById("container");

  const autoLogin = async function () {
    
    const res = await dispatch(login());

    setModal({
      showModal: true,
      title: res.wasSuccessful ? "Success" : "Att ention",
      text: res.wasSuccessful ? `Welcome dear ${res.message}` : res.message,
      icon: res.wasSuccessful
        ? {
            name: faCircleCheck,
            color: "green",
          }
        : {
            name: faTriangleExclamation,
            color: "yellow",
          },
    });

    setLoader(false);
  };

  const closeModalHandler = function () {
    if (modal.title === "Attention") {
      navigate("/login", { replace: false });
    }

    if (modal.title === "Success") {
      navigate("/", { replace: false });
    }

    setModal({
      showModal: false,
      title: "",
      icon: null,
      text: "",
    });
  };

  useEffect(() => {
    autoLogin();
    // eslint-disable-next-line
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Index />}>
          {loader || <Route index element={<Home />} />}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {isLoggedIn && <Route path="/bookmark" element={<Bookmark />} />}
          {isLoggedIn && (
            <Route path="/connections" element={<Connections />} />
          )}
          {isLoggedIn && (
            <Route path="/edit-profile/:username" element={<EditProfile />} />
          )}
          {isLoggedIn && <Route path="/explore" element={<Explore />} />}
          {isLoggedIn && <Route path="/new-post" element={<NewPost />} />}
          {isLoggedIn && (
            <Route path="/notifications" element={<Notification />} />
          )}
          {isLoggedIn && (
            <Route path="/profile/:username" element={<Profile />} />
          )}
          {isLoggedIn && (
            <Route path="/search-result" element={<SearchResult />} />
          )}
          {isLoggedIn && <Route path="/settings" element={<Settings />} />}
          {isLoggedIn && <Route path="/theme" element={<Theme />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
      {modal.showModal &&
        createPortal(
          <Modal
            title={modal.title}
            icon={modal.icon}
            text={modal.text}
            onCloseModal={closeModalHandler}
          />,
          container
        )}
      {loader && createPortal(<Loader />, container)}
    </Suspense>
  );
}
