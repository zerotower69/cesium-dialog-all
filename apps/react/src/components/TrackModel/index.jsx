//组件映射集合
import { ReactTrackModel } from "@/components/TrackModel/track-model.js";
import {
  cloneElement,
  createElement,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { createRoot } from "react-dom/client";
import TrackModel from "./TrackModel.jsx";
import { isNumber, isObject } from "lodash-es";
import { createPortal, flushSync } from "react-dom";

const componentMap = loadAllComponents();

/**
 * 生成的弹窗都会以上下文的方式保存在数组中，以支持未来页面中同时存在多个弹窗
 * @type {import('./track-model').ReactTrackModel[]}
 */
const modelInstances = [];

/**
 * 默认创建配置
 * @type {import('@react/track-model').CreateOptions}
 */
const defaultModelOptions = {
  global: true,
  fly: false,
  show: "beforeFly",
  autoScale: false,
};

/**
 * 关闭按钮默认样式
 * @type {import('react').CSSProperties}
 */
const defaultCloseStyle = {
  position: "absolute",
  right: "5px",
  top: "5px",
  cursor: "pointer",
};

/**
 * 内容默认样式（content）
 * @type {import('react').CSSProperties}
 */
const defaultContentStyle = {
  background: "rgba(24, 50, 70, 0.8)",
  border: "#00a3cc solid 1px",
  boxShadow: "0.5px 1.5px 1.5px 0 rgba(10, 31, 47, 0.5)",
  width: "480px",
  minHeight: "40px",
  position: "relative",
};

/**
 * 标题默认样式
 * @type {import('react').CSSProperties}
 */
const defaultTitleStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "5px 4px 7px 20px",
  fontSize: "16px",
  zIndex: 1,
};

/**
 * trackModel默认的props
 * @type {import('@react/track-model').TrackModelProps}
 */
const defaultProps = {
  beforeClose: () => true,
};

class ReactTrackModelError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReactTrackModelError";
  }
}

let seed = 1;
let Component = null;

/**
 *
 * @param {import('@react/track-model').ContentChild} content
 * @param {import('@react/track-model').CreateOptions} options
 * @param {import('@react/track-model').TrackModelProps} modelProps
 */
export function createTrackModel(content, options, modelProps) {
  // return new Promise((resolve, reject) => {
  //step1:参数处理
  if (isObject(content)) {
    if (Reflect.has(content, "name")) {
      Component = componentMap.get(content.name);
      if (!Component) {
        //TODO:抛出警告，组件不存在
        return;
      }
    } else {
      //
      return;
    }
  } else {
    //TODO:抛出警告
    return;
  }
  //计算并合并trackModel的props
  /**
   * 关闭按钮的样式
   * @type {import('react').CSSProperties}
   **/
  const closeStyle = {
    ...defaultCloseStyle,
    ...(modelProps?.closeStyle ?? {}),
    position: "absolute",
  };
  /**
   * 标题的样式
   * @type {import('react').CSSProperties}
   **/
  const titleStyle = {
    ...defaultTitleStyle,
    ...(modelProps?.titleStyle ?? {}),
    position: "absolute",
  };
  /**
   * 内容区的样式
   * @type {import('react').CSSProperties}
   **/
  const contentStyle = {
    ...defaultContentStyle,
    ...(modelProps?.contentStyle ?? {}),
    position: "relative",
  };
  options = {
    ...defaultModelOptions,
    ...options,
  };
  //step2:构建vNode
  //弹窗id
  const instanceId = seed++;
  const afterClose = function () {
    //找到对应的实例
    const selfInstance = getModelInstanceById(instanceId);
    //执行弹窗自带的关闭方法
    selfInstance?.destroy?.();
    //执行传入的关闭方法
    modelProps?.afterClose?.();
  };
  //合并最终的props
  const renderModelProps = {
    ...defaultProps,
    ...modelProps,
    closeStyle,
    afterClose,
    titleStyle,
    contentStyle,
    duration: 1000,
  };
  //设置动画时间
  if (isNumber(options.duration)) {
    renderModelProps.duration = options.duration;
    Reflect.deleteProperty(options, "duration");
  }
  const isGlobal = options.global;
  //如果是单例模式的弹窗，移除所有的弹窗
  if (isGlobal && modelInstances.length > 0) {
    //TODO:移除当前存在的弹窗
    while (modelInstances.length) {
      const getInstance = modelInstances.shift();
      getInstance?.close?.();
    }
  }
  const instance = new ReactTrackModel({
    id: instanceId,
    ...options,
  });
  modelInstances.push(instance);
  const modalElement = document.createElement("div");
  renderModelProps.setInstanceEl = function (el) {
    instance.setRootEl(el, true);
  };

  function TrackModelWrapper(props) {
    const childProps = content?.props ?? {};
    return createPortal(
      <TrackModel {...props} style={{ display: "none" }}>
        <Component {...childProps} />
      </TrackModel>,
      document.body,
    );
  }
  flushSync(() => {
    createRoot(modalElement).render(
      <TrackModelWrapper {...renderModelProps}></TrackModelWrapper>,
    );
  });

  return {
    close: instance.close,
    updatePosition: instance.updatePosition,
  };
}

/**
 * 加载所有的组件
 * @returns {Map<string, import('react').Component>}
 */
function loadAllComponents() {
  /**
   * 组件映射
   * @type {Map<string, import('react').Component>}
   */
  const map = new Map();
  const modules = import.meta.glob("./content/*.jsx", { eager: true });
  Object.entries(modules).forEach(([key, component]) => {
    const name = key.replace(/.\/content\/(\w+).jsx/, "$1");
    map.set(name, component.default);
  });
  // console.log(map);
  return map;
}

/**
 * 根据id找到弹窗
 * @param {number} id
 * @return {ReactTrackModel}
 */
function getModelInstanceById(id) {
  return modelInstances.find((modelInstance) => modelInstance.uid === id);
}

export function openModel(Component) {}
