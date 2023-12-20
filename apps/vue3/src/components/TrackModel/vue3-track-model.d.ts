declare module '@vue3/track-model' {
  import { Viewer, DistanceDisplayCondition, NearFarScalar } from 'cesium';
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
  type CreateOptions = {
    //cesium viewer对象，不传就使用全局的Viewer实例
    viewer?: Viewer;
    //点位坐标,lon:经度，lat:纬度，height:高度
    coordinate: { longitude: number; latitude: number; height?: number };
    //弹窗位置的屏幕坐标偏移量，单位：px
    offset?: { x?: number; y?: number };
    //全局是否唯一，单例模式？默认为true
    global?: boolean;
    //是否飞到对应的位置？默认为false
    fly?: boolean;
    //飞行的点位偏移量(相机位置)以及方向调整，lon,lat,height是指定的偏移量
    flyOffset?: {
      //偏移的经度,相对于coord.lon，默认为0
      lon?: number;
      //相对于coord.lat偏移的纬度，默认为0
      lat?: number;
      //相对于coord.height偏移的高度，默认为6000
      height?: number;
      //相机方位的heading，默认为当前相机方位heading
      heading?: number;
      //相机方位的pitch，默认为当前相机方位的pitch
      pitch?: number;
      //相机方位的roll，默认为当前相机方位的roll，通常是0
      roll?: number;
    };
    //相机飞行后执行的complete回调函数
    // eslint-disable-next-line no-unused-vars
    completeCallback?: (...args) => void;
    //弹窗的显示时机，是飞行前显示还是飞之后才显示，默认为beforeFly
    show?: 'beforeFly' | 'afterFly';
    //弹窗加载延时，可以用来等待某些DOM或者数据加载完成后再显示弹窗，建议在show为"beforeFly"时使用
    loadInterval?: number;
    //自适应地图缩放
    autoScale?: boolean;
    //根据到相机距离控制显隐
    distanceDisplayCondition?: DistanceDisplayCondition;
    //通过距离决定缩放比例
    scaleByDistance?: NearFarScalar;
    //弹窗出现动画时长,默认1000ms(1s),设置为0表示禁用动画
    duration?: number;
  };
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
