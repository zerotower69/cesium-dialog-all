declare module '@vue3/track-model' {
  import { VNode, CSSProperties } from 'vue';
  import { TrackModelOptions } from 'track-model';
  //关闭前执行的钩子,返回true关闭弹窗，返回false不关闭弹窗
  // eslint-disable-next-line no-unused-vars
  type BeforeCloseHook = (...args) => boolean;
  //关闭弹窗后执行的钩子
  // eslint-disable-next-line no-unused-vars
  type AfterCloseHook = (...args) => void;
  //弹窗外壳组件TrackModel的props
  type TrackModelProps = {
    //关闭前执行的钩子,返回true关闭弹窗，返回false不关闭弹窗
    beforeClose?: BeforeCloseHook;
    //关闭后执行的逻辑，可用于清除绘制的点位实体等
    afterClose?: AfterCloseHook;
    //弹窗背景图片,建议使用require传入
    bgImage?: string;
    //弹窗关闭按钮处的css样式
    closeStyle?: CSSProperties;
    //弹窗的标题
    title?: string;
    //标题文字的css样式
    titleStyle?: CSSProperties;
    //内容区域盒子的css样式
    contentStyle?: CSSProperties;
    //内容区的宽度，如果未指定，内容区宽度为“fix-content”
    width?: number;
    //内容区的高度，如果未指定，内容区高度为“fix-content”
    height?: number;
  };
  //创建方法选项
  interface CreateOptions extends TrackModelOptions {
    //组件动画时长，点位为ms。默认是1000，为0时关闭动画
    duration?: number;
  }
  //弹窗的内容
  type TrackContent =
    // eslint-disable-next-line no-unused-vars
    | ((args: never[]) => VNode)
    | {
        //内容组件名(默认插槽)
        name: string;
        //组件的props
        props?: Record<string, never>;
      };
  //Vue3TrackModel的实例化选项参数
  interface Vue3TrackModelOptions extends TrackModelOptions {}
  export { CreateOptions, TrackContent, TrackModelProps, Vue3TrackModelOptions };
}
