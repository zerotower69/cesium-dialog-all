import TrackModelConstructor from './TrackModel.vue';
import { isFunction, isNumber, isObject } from 'lodash-es';
import { h, createVNode, render, getCurrentInstance} from 'vue';
import { Vue3TrackModel } from '@/components/TrackModel/track-model';

/**
 * 内容组件映射
 * @type {Map<string, import('vue').Component>}
 */
const componentMap = loadAllContentComponents();
/**
 * 全局的应用上下文
 * @type {import('vue').AppContext}
 */
let globalAppContext;

/**
 * 生成的弹窗都会以上下文的方式保存在数组中，以支持未来页面中同时存在多个弹窗
 * @type {import('./track-model').Vue3TrackModel[]}
 */
const modelInstances = [];

/**
 * 默认创建配置
 * @type {import('@vue3/track-model').CreateOptions}
 */
const defaultModelOptions = {
  global: true,
  fly: false,
  show: 'beforeFly',
  autoScale: false,
};

/**
 * 关闭按钮默认样式
 * @type {import('vue').CSSProperties}
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
 * 创建跟随弹窗
 * @param {import('@vue3/track-model').TrackContent} slot
 * @param {import('@vue3/track-model').CreateOptions} options
 * @param {import('@vue3/track-model').TrackModelProps} modelProps
 */
export function createTrackModel(slot, options, modelProps) {
  //step1:参数归一化处理
  //处理内容组件插槽
  if (isObject(slot)) {
    if (Reflect.has(slot, 'name')) {
      const { name, props = {} } = slot;
      const component = componentMap.get(name);
      if (component) {
        slot = () => h(component, { ...(props ?? {}) });
      } else {
        console.error(new TrackModelError(`非法组件名[${name}]，不存在这个组件`));
        return;
      }
    } else {
      console.error(
        new TrackModelError('When typeof [content] is object, you must get the property: [name]'),
      );
      return;
    }
  } else if (!isFunction(slot)) {
    console.error(new TrackModelError('非法插槽类型，内容区插槽必须是一个函数或者对象'));
    return;
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
  //step2: 将组件渲染为VNode
  //*获取应用上下文
  const context = getCurrentInstance()?.appContext ?? globalAppContext;
  //*组件构建虚拟DOM
  const vNode = createVNode(
    TrackModelConstructor,
    {
      ...renderModelProps,
    },
    slot,
  );
  //设置上下文
  //console.log(context)
  vNode.appContext = context;
  //*指定挂载对象，处理为真实的DOM
  const rootEl = document.createElement('div');
  //渲染为html
  render(vNode, rootEl);
  const $appendEl = vNode.el;
  //*到这里，vue3的处理逻辑就结束了，剩下的过程已经是原生部分，任何框架下都一样了
  //step3:实例化trackModel
  const instance = new Vue3TrackModel({
    id: instanceId,
    rootEl: $appendEl,
    ...options,
  });
  vNode.component.exposed.instance = instance;
  instance.setVNode(vNode);
  modelInstances.push(instance);

  /**
   * 更新弹窗位置，以支持实时移动
   * @param {import('cesium').Cartesian3} cartesian
   */
  function updatePosition(cartesian) {
    return instance.updatePosition(cartesian);
  }
  return {
    destroy: instance.destroy,
    updatePosition,
  };
}

/**
 * 设置全局Vue应用App上下文
 * @param {import('vue').App} app
 */
export function setupTrackModel(app) {
  globalAppContext = app._context;
}

/**
 * 加载跟踪弹窗的内容组件
 * @return {Map<string, import('vue').Component>}
 */
function loadAllContentComponents() {
  //如果打包框架改用vue-cli(webpack),请使用require.context替代 import.meta.glob,具体参考vue2中的实现
  const modules = import.meta.glob('./content/*.vue', { eager: true });
  const map = new Map();
  Object.entries(modules).forEach(([key, component]) => {
    const name = key.replace(/.\/content\/(\w+).vue/, '$1');
    map.set(name, component.default);
  });
  return map;
}

/**
 * 根据id找到弹窗
 * @param {number} id
 * @return {Vue3TrackModel}
 */
function getModelInstanceById(id) {
  return modelInstances.find((modelInstance) => modelInstance.uid === id);
}

/**
 * 关闭所有的弹窗
 */
export function closeAllModel() {
  modelInstances.forEach((instance) => {
    instance?.destroy();
  });
}
