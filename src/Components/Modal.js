import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Modal.module.css";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const Modal = ({ title, icon, text, onCloseModal }) => {
  const modalButton = useRef();
  const { color, theme } = useSelector((state) => state.custom);

  useEffect(() => {
    modalButton.current.focus();
  }, []);

  const stopPropagate = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles["background-layer"]} ${styles[theme]}`}
      onClick={onCloseModal}
    >
      <div
        className={`${styles["modal"]} ${styles[theme]}`}
        onClick={stopPropagate}
      >
        <div className={styles["modal-header"]}>
          <h4 className={`${styles["modal-title"]} ${styles[theme]}`}>
            {title}
          </h4>
        </div>
        <div className={styles["modal-body"]}>
          <FontAwesomeIcon
            icon={icon.name}
            className={`${styles["modal-icon"]} ${styles[icon.color]}`}
          />
          <p className={`${styles["modal-text"]} ${styles[theme]}`}>{text}</p>
        </div>
        <div className={styles["modal-footer"]}>
          <button
            className={`${styles["modal-button"]} ${styles[color]}`}
            onClick={onCloseModal}
            ref={modalButton}
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
