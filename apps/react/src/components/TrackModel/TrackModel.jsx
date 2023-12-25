import { useEffect, useState, forwardRef, useRef } from "react";

import "./trackModel.scss";
import { isNumber, isString, isFunction } from "lodash-es";
import closeImg from "./img/icon_close.png";
import clickCloseImg from "./img/icon_close_click.png";
import bgImg from "./img/bg_title.png";

// eslint-disable-next-line react/display-name
const TrackModel = forwardRef((props, ref) => {
  const [isHover, setHover] = useState(false);
  const rootRef = useRef();
  const [styleState, setStyleState] = useState(() => ({
    top: "0px",
    left: "0px",
    width: "fit-content",
    height: "fit-content",
  }));
  function handleOver() {
    setHover(true);
  }
  function handleLeave() {
    setHover(false);
  }
  function handleClose() {
    if (isFunction(props.beforeClose)) {
      if (props.beforeClose()) {
        props?.afterClose?.();
      }
    } else {
      props?.afterClose?.();
    }
  }
  useEffect(() => {
    const newStyleState = {};
    newStyleState.top = getStyleValue(props.top, 0);
    newStyleState.left = getStyleValue(props.left, 0);
    newStyleState.width = getStyleValue(props.width, "fit-content");
    newStyleState.height = getStyleValue(props.height, "fit-content");
    setStyleState(newStyleState);
    const $el = rootRef.current;
    props?.setInstanceEl?.($el);
  }, []);
  return (
    <div
      className="trackModel"
      ref={rootRef}
      style={{
        position: "absolute",
        left: styleState.left,
        top: styleState.top,
      }}
    >
      <div
        className="trackModelContent move-in"
        style={{
          ...(props?.contentStyle ?? {}),
          width: styleState.width,
          height: styleState.height,
        }}
      >
        <div className="trackModelTitle" style={props.titleStyle}>
          <div>{props.title}</div>
        </div>
        <img className="titleImage" src={bgImg} alt="title" />
        <div className="trackModelBody">{props?.children ?? <></>}</div>
        <div
          className="closeIcon"
          onMouseOver={handleOver}
          onMouseLeave={handleLeave}
          onClick={() => {
            handleClose();
          }}
          style={props.closeStyle}
        >
          {isHover ? (
            <img src={clickCloseImg} alt="closeOverImage" />
          ) : (
            <img src={closeImg} alt="closeImage" />
          )}
        </div>
      </div>
    </div>
  );
});
export default TrackModel;

function getStyleValue(value, defaultVal) {
  if (isNumber(value)) {
    return value + "px";
  } else if (isString(value)) {
    return value;
  } else {
    return defaultVal;
  }
}
