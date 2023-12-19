declare module 'track' {
  import { Viewer } from 'cesium';
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
  };
  export { CreateOptions };
}
