import { TrackModel } from '@common/common';
import { isNumber } from 'lodash-es';

export class Vue3TrackModel extends TrackModel {
  /**
   * @type {import('vue').VNode}
   * @private
   */
  _vNode;

  /**
   * @type {import('vue').ComponentInternalInstance}
   * @private
   */
  _vm;

  /**
   * @param {import('@vue3/track-model').Vue3TrackModelOptions} options
   */
  constructor(options) {
    if (isNumber(options.duration)) {
      options.observerDuration = options.duration;
    }
    Reflect.deleteProperty(options, 'duration');
    super(options);
  }

  /**
   * 设置vNode
   * @param {import('vue').VNode} vNode
   */
  setVNode(vNode) {
    this._vNode = vNode;
    this._vm = vNode.component;
  }
}
