import TrackModelMain from './TrackModel.vue';
import Vue from 'vue';
import { isNumber, isObject } from 'lodash-es';
import { Vue2TrackModel } from '@/component/TrackModel/track-model';
const TrackModelConstructor = Vue.extend(TrackModelMain);

/**
 * 组件映射
 * @type {Map<string, import('vue').Component>}
 */
const componentMap = loadAllContentComponents();

/**
 * 生成的弹窗都会以上下文的方式保存在数组中，以支持未来页面中同时存在多个弹窗
 * @type {import('./track-model').Vue2TrackModel[]}
 */
const modelInstances = [];

/**
 * 默认创建配置
 * @type {import('@vue2/track-model').CreateOptions}
 */
const defaultModelOptions = {
  global: true,
  fly: false,
  show: 'beforeFly',
  autoScale: false,
};

/**
 * 关闭按钮默认样式
 * @type {import('@vue2/track-model').CSSProperties}
 */
const defaultCloseStyle = {
  position: 'absolute',
  right: '5px',
  top: '5px',
  cursor: 'pointer',
};

/**
 * 内容默认样式（content）
 * @type {import('vue').CSSProperties}
 */
const defaultContentStyle = {
  background: 'rgba(24, 50, 70, 0.8)',
  border: '#00a3cc solid 1px',
  boxShadow: '0.5px 1.5px 1.5px 0 rgba(10, 31, 47, 0.5)',
  width: '480px',
  minHeight: '40px',
  position: 'relative',
};

/**
 * 标题默认样式
 * @type {import('vue').CSSProperties}
 */
const defaultTitleStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '5px 4px 7px 20px',
  fontSize: '16px',
  zIndex: 1,
};

/**
 * trackModel默认的props
 * @type {import('@vue3/track-model').TrackModelProps}
 */
const defaultProps = {
  beforeClose: () => true,
};

class TrackModelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TrackModelError';
  }
}

let seed = 1;

/**
 * 创建弹窗
 * @param {import('@vue2/track-model').ContentSlot} slot
 * @param {import('@vue2/track-model').CreateOptions} options
 * @param {import('@vue2/track-model').TrackModelProps} modelProps
 */
export function createTrackModel(slot, options, modelProps) {
  //step1:参数归一化处理
  let component;
  if (isObject(slot) && Reflect.has(slot, 'name')) {
    component = componentMap.get(slot.name);
    if (!component) {
      console.error(new TrackModelError(`The component name [${slot.name}] doesn't exit`));
      return;
    }
  }
  //* 插槽逻辑处理完毕
  //计算并合并trackModel的props
  /**
   * 关闭按钮的样式
   * @type {import('vue').CSSProperties}
   **/
  const closeStyle = {
    ...defaultCloseStyle,
    ...(modelProps?.closeStyle ?? {}),
    position: 'absolute',
  };
  /**
   * 标题的样式
   * @type {import('vue').CSSProperties}
   **/
  const titleStyle = {
    ...defaultTitleStyle,
    ...(modelProps?.titleStyle ?? {}),
    position: 'absolute',
  };
  /**
   * 内容区的样式
   * @type {import('vue').CSSProperties}
   **/
  const contentStyle = {
    ...defaultContentStyle,
    ...(modelProps?.contentStyle ?? {}),
    position: 'relative',
  };
  options = {
    ...defaultModelOptions,
    ...options,
  };
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
    Reflect.deleteProperty(options, 'duration');
  }
  const isGlobal = options.global;
  //如果是单例模式的弹窗，移除所有的弹窗
  if (isGlobal && modelInstances.length > 0) {
    //TODO:移除当前存在的弹窗
    while (modelInstances.length) {
      const getInstance = modelInstances.shift();
      getInstance?.destroy();
    }
  }

  //step2:构建VNode
  const vm = new TrackModelConstructor({
    propsData: {
      ...renderModelProps,
    },
  });
  const child = vm.$createElement(component, {
    props: {
      ...(slot?.props ?? {}),
    },
  });
  vm.$slots.default = [child];

  const rootEl = document.createElement('div');
  vm.$mount(rootEl);

  const $el = vm.$el;

  //step3: 实例化TrackModel
  const instance = new Vue2TrackModel({
    rootEl: $el,
    id: instanceId,
    ...options,
  });

  modelInstances.push(instance);

  return {
    close: instance.close,
    updatePosition: instance.updatePosition,
  };
}

/**
 * 根据id找到弹窗
 * @param {number} id
 * @return {Vue2TrackModel}
 */
function getModelInstanceById(id) {
  return modelInstances.find((modelInstance) => modelInstance.uid === id);
}
/**
 * 加载跟踪弹窗的内容组件
 * @return {Map<string, import('vue').Component>}
 */
export function loadAllContentComponents() {
  const files = require.context('./content', false, /\.vue$/);
  const map = new Map();
  files.keys().forEach((key) => {
    const mod = files(key).default;
    const name = mod?.name ?? key.replace(/.\/(\w+).vue/, '$1');
    if (mod) {
      map.set(name, mod);
    }
  });
  return map;
}
