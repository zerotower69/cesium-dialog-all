import { TrackModel } from '@common/common';
import {} from 'vue';

export class Vue3TrackModel extends TrackModel {
  /**
   * @type {import('vue').VNode}
   */
  _vNode;

  /**
   *
   * @param options
   */
  constructor(options) {
    super(options);
  }

  /**
   * 设置vNode
   * @param {import('vue').VNode} vNode
   */
  setVNode(vNode) {
    this._vNode = vNode;
  }
}
