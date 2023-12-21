import React, { useEffect, useState } from "react";

import "./trackModel.scss";
import { isNumber, isString } from "lodash-es";
import closeImg from "./img/icon_close.png";
import clickCloseImg from "./img/icon_close_click.png";
import bgImg from "./img/bg_title.png";

function TrackModel1(props) {
  const [isHover, setHover] = useState(false);
  const [styleState, setStyleState] = useState(() => ({
    top: "0px",
    left: "opx",
    width: "fit-content",
    height: "fit-content",
  }));
  function handleOver() {
    console.log("ppppppp");
    setHover(true);
  }
  function handleLeave() {
    setHover(false);
  }
  function handleClose() {}
  function handleSetOver(value = false) {
    console.log("over=====", value);
    setHover(value);
  }
  function getStyleValue(value, defaultVal) {
    if (isNumber(value)) {
      return value + "px";
    } else if (isString(value)) {
      return value;
    } else {
      return defaultVal;
    }
  }
  useEffect(() => {
    const newStyleState = {};
    newStyleState.top = getStyleValue(props.top, 0);
    newStyleState.left = getStyleValue(props.left, 0);
    newStyleState.width = getStyleValue(props.width, "fit-content");
    newStyleState.height = getStyleValue(props.height, "fit-content");
    setStyleState(newStyleState);
  }, [props]);
  return (
    <div className="trackModel">
      <div
        className="trackModelContent"
        style={{
          position: "absolute",
          left: styleState.left,
          top: styleState.top,
        }}
      >
        <div
          className="content-box move-in"
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
    </div>
  );
}

function getStyleValue(value, defaultVal) {
  if (isNumber(value)) {
    return value + "px";
  } else if (isString(value)) {
    return value;
  } else {
    return defaultVal;
  }
}

export default class TrackModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      left: "0px",
      right: "0px",
      width: "fit-content",
      height: "fit-content",
      isHover: false,
    };
  }

  componentDidMount() {
    this.setState({
      left: getStyleValue(this.props.left, "0px"),
      top: getStyleValue(this.props.top, "0px"),
      width: getStyleValue(this.props.width, "fit-content"),
      height: getStyleValue(this.props.height, "fit-content"),
    });
  }

  handleOver = (e) => {
    console.log("over", e);
    this.setState({
      isHover: true,
    });
  };
  handleLeave = (e) => {
    this.setState({
      isHover: false,
    });
  };
  handleClose = (e) => {};
  render() {
    return (
      <div className="trackModel">
        <div
          className="trackModelContent"
          style={{
            position: "absolute",
            left: this.state.left,
            top: this.state.top,
          }}
        >
          <div
            className="content-box move-in"
            style={{
              ...(this.props?.contentStyle ?? {}),
              width: this.state.width,
              height: this.state.height,
            }}
          >
            <div className="trackModelTitle" style={this.props.titleStyle}>
              <div>{this.props.title}</div>
            </div>
            <img className="titleImage" src={bgImg} alt="title" />
            <div className="trackModelBody">{this.props.children}</div>
            <div
              className="closeIcon"
              onMouseOver={this.handleOver}
              onMouseLeave={this.handleLeave}
              onClick={this.handleClose}
              style={this.props.closeStyle}
            >
              {this.state.isHover ? (
                <img src={clickCloseImg} alt="closeOverImage" />
              ) : (
                <img src={closeImg} alt="closeImage" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
