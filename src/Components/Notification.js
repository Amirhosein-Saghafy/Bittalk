import Card from "./UI/Card";
import styles from "./Notification.module.css";
import { useSelector, useDispatch } from "react-redux";
import { userSlice } from "../Store/Store";
import { allowConnection, rejectConnection } from "../Config/Request";
import Loader from "./Loader";
import Modal from "./Modal";
import { createPortal } from "react-dom";
import { useState } from "react";
import {
  faCircleXmark,
  faHandshake,
  faCheckCircle,
} from "@fortawesome/free-regular-svg-icons";

const Notification = (props) => {
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  const connections = [...user.Connections];

  const [modal, setModal] = useState({
    showModal: false,
    title: "",
    text: "",
    icon: null,
  });
  const [loader, setLoader] = useState(false);

  const container = document.getElementById("container");

  const closeModalHandler = () => {
    setModal({
      showModal: false,
      title: "",
      text: "",
      icon: null,
    });
  };

  const acceptHandler = async (e) => {
    setLoader(true);

    const connectionId = e.target.dataset.id;

    const receiver = {
      connectionId,
      id: user.user_id,
    };

    const res = await allowConnection(receiver, connectionId);

    if (!res.status) {
      setModal({
        showModal: true,
        title: "Faild",
        text: res.message || "Something went wrong, please try again",
        icon: {
          name: faCircleXmark,
          color: "red",
        },
      });
    }

    if (res.status) {
      await dispatch(userSlice.actions.updateUserConnections(res.data));

      setModal({
        showModal: true,
        title: "Success",
        text: `Congratulation, now you are connected`,
        icon: {
          name: faHandshake,
          color: "green",
        },
      });
    }

    setLoader(false);
  };

  const dislineHandler = async (e) => {
    setLoader(true);

    const connectionId = e.target.dataset.id;

    const receiver = {
      connectionId,
      id: user.user_id,
    };

    const res = await rejectConnection(receiver, connectionId);

    if (!res.status) {
      setModal({
        showModal: true,
        title: "Faild",
        text: res.message || `Something went wrong, please try again`,
        icon: {
          name: faCircleXmark,
          color: "red",
        },
      });
    }

    if (res.status) {
      await dispatch(userSlice.actions.updateUserConnections(res.data));

      setModal({
        showModal: true,
        title: "Success",
        text: `You rejected request`,
        icon: {
          name: faCheckCircle,
          color: "green",
        },
      });
    }

    setLoader(false);
  };

  return (
    <>
      <div
        className={`${styles["notify-container"]} ${
          props.className ? styles[props.className] : ""
        }`}
      >
        {connections.map((connection, index) => {
          if (
            connection.status === "pending" &&
            connection.from !== user.user_id
          ) {
            const imageLink =
              "https://imnkxuxetiewmyrcvsbz.supabase.co/storage/v1/object/public/User-Images/" +
              connection.id +
              "/profile-image.png";

            return (
              <Card className="notify-card" key={index}>
                <div className={styles["user-section"]}>
                  <img
                    src={imageLink}
                    alt="user profile"
                    className={styles["user-image"]}
                  />
                  <div className={styles["username"]}>
                    <span className={styles["user-id"]}>
                      {connection.userName}
                    </span>
                    <p className={styles["text"]}>
                      You have one connection request
                    </p>
                  </div>
                </div>
                <div className={styles["option-section"]}>
                  <button
                    className={`${styles["option-button"]} ${styles["disline"]}`}
                    data-id={connection.id}
                    onClick={dislineHandler}
                  >
                    Disline
                  </button>
                  <button
                    className={`${styles["option-button"]} ${styles["accept"]}`}
                    data-id={connection.id}
                    onClick={acceptHandler}
                  >
                    Accept
                  </button>
                </div>
              </Card>
            );
          }
          return "";
        })}
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
      {loader && createPortal(<Loader />, container)}
    </>
  );
};

export default Notification;
