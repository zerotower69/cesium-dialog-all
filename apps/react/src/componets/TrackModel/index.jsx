//组件映射集合
import { ReactTrackModel } from "@/componets/TrackModel/track-model.js";
import { cloneElement } from "react";
import { createRoot } from "react-dom/client";
import TrackModelComponent from "./TrackModel.jsx";
import { isObject } from "lodash-es";
import { createPortal } from "react-dom";

const componentMap = loadAllComponents();

let seed = 1;

/**
 *
 * @param {import('@react/track-model').ContentChild} content
 * @param {import('@react/track-model').CreateOptions} options
 * @param {import('@react/track-model').TrackModelProps} modelProps
 */
export function createTrackModel(content, options, modelProps) {
  //step1:参数处理
  let component;
  if (isObject(content)) {
    if (Reflect.has(content, "name")) {
      component = componentMap.get(content.name);
      if (!component) {
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
  //step2:构建vNode
  const instanceId = seed++;
  const rootEl = document.createElement("div");
  const TrackModelContent = cloneElement(component, {
    ...(content?.props ?? {}),
  });
  const TrackModelWrapper = cloneElement(
    <TrackModelComponent>
      <TrackModelContent />
    </TrackModelComponent>,
    {},
  );
  createRoot(rootEl).render(<TrackModelWrapper />);
  const $appendEl = rootEl.firstElementChild;
  const $contentEl = $appendEl.querySelector(".trackModelContent");
  //step3:实例化TrackModel
  if (Reflect.has(options, "duration")) {
    Reflect.deleteProperty(options, "duration");
  }
  const instance = new ReactTrackModel({
    rootEl: $appendEl,
    contentEl: $contentEl,
    id: instanceId,
    ...options,
  });

  //step4:返回值

  /**
   * 更新弹窗位置，以支持跟随实体
   * @param {import('cesium').Cartesian3} cartesian
   */
  function updatePosition(cartesian) {
    instance.updatePosition(cartesian);
  }

  return {
    close: instance.close,
    updatePosition,
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
  console.log(map);
  return map;
}
