import { TrackModel } from '@common/common';

export class Vue2TrackModel extends TrackModel {
  /**
   * 实例
   * @type {import('vue').Component}
   * @private
   */
  _vm;

  /**
   * 构造函数
   * @param {import('@vue2/track-model').Vue2TrackModelOptions} options
   */
  constructor(options) {
    super(options);
  }
  setInstance(vm) {
    this._vm = vm;
  }
}
