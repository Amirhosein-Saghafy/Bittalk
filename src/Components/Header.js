import styles from "./Header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useRef, useState } from "react";
import Modal from "./Modal";
import Loader from "./Loader";
import { createPortal } from "react-dom";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { search } from "../Config/Request";

const Header = () => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { color, theme } = useSelector((state) => state.custom);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    showModal: false,
    title: "",
    text: "",
    icon: null,
  });

  const navigate = useNavigate();
  const searchInputRef = useRef();
  const container = document.getElementById("container");
  const dispatch = useDispatch();

  const registerHandler = () => {
    navigate("/register", {
      replace: false,
    });
  };

  const searchHandler = async () => {
    if (!isLoggedIn) {
      setModal({
        showModal: true,
        title: "Failed",
        text: "Please login or register first",
        icon: {
          name: faCircleXmark,
          color: "red",
        },
      });

      return;
    }

    const searchValue = searchInputRef.current.value;

    if (searchValue === "") {
      setModal({
        showModal: true,
        title: "Error",
        text: "Please enter valid username",
        icon: {
          name: faCircleXmark,
          color: "red",
        },
      });

      return;
    }

    setIsLoading(true);

    const res = await dispatch(search(searchValue));

    setIsLoading(false);

    if (!res) {
      setModal({
        showModal: true,
        title: "Error",
        icon: {
          name: faCircleXmark,
          color: "red",
        },
        text: "Something went wrong, please try again",
      });

      return;
    }

    navigate("/search-result", {
      replace: false,
    });
  };

  const closeModalHandler = function () {
    setModal({
      showModal: false,
      title: "",
      icon: null,
      text: "",
    });
  };

  return (
    <header className={`${styles["header"]} ${styles[theme]}`}>
      <div className={styles["header-container"]}>
        <div className={styles["header-content"]}>
          <div className={styles["header-logo"]}>
            <h2 className={`${styles["header-logo-text"]} ${styles[theme]}`}>
              bittalk
            </h2>
          </div>
          <div className={`${styles["header-search"]} ${styles[theme]}`}>
            <button
              className={styles["header-search-button"]}
              onClick={searchHandler}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className={`${styles["header-search-icon"]} ${styles[color]}`}
              />
            </button>
            <input
              type="text"
              className={`${styles["header-search-bar"]} ${styles[theme]}`}
              placeholder="Search something, Find someone . . ."
              ref={searchInputRef}
            />
          </div>
          <div className={styles["header-profile"]}>
            {!isLoggedIn && (
              <button
                className={`${styles["header-register"]} ${styles[color]}`}
                to={"/register"}
                onClick={registerHandler}
              >
                Register
              </button>
            )}
            {isLoggedIn && (
              <Link
                to={`/profile/${user.UserName}`}
                className={styles["header-profile-link"]}
              >
                <img
                  src={user.profileImage}
                  alt="user profile"
                  className={styles["header-profile-image"]}
                />
              </Link>
            )}
          </div>
        </div>
      </div>
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
      {isLoading && createPortal(<Loader />, container)}
    </header>
  );
};

export default Header;
