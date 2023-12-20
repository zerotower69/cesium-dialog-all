import * as Cesium from 'cesium';
import {isString} from "lodash-es";
import * as turf from "@turf/turf"
import * as cesium from "cesium";

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Y2YzMzhjNy03MmViLTRlNjItOWMzMi1mYzg3MmZkMGE5ZjYiLCJpZCI6MTIwNzI1LCJpYXQiOjE2NzMyNDczMDF9.FVuv-GXxuLCZvztzncNHaHhKyqYLQKaS1GO7v1MvtGU';

export const CesiumWorld = {
  /**
   * @type {null|import('cesium').Viewer}
   */
  viewer: null,
  /**
   * 初始化地球
   * @param {string|HTMLElement} container
   * @param {import('cesium').Viewer.ConstructorOptions} options
   */
  init(container, options = {}) {
    if(isString(container)){
      container = document.getElementById(container);
    }
    //初始化viewer实例
     this.viewer = new Cesium.Viewer(container,{
      baseLayerPicker: false, // 地图切换控件(底图以及地形图)是否显示,默认显示true  （图中6）
      fullscreenButton: false, // 全屏按钮,默认显示true  （图中4）
      geocoder: false, // 地名查找,默认true  （图中9）
      homeButton: false, // 主页按钮，默认true  （图中8）
      infoBox: false, // 点击要素之后显示的信息,默认true
      selectionIndicator: false, // 选中元素显示,默认true
      CreditsDisplay: false, // 展示数据版权属性
      shouldAnimate: true,
      sceneModePicker: false, // 二三维切换按钮
      navigationHelpButton: false, // 问号图标，导航帮助按钮，显示默认的地图控制帮助
      contextOptions: {
        webgl: {
          preserveDrawingBuffer: true, // cesium状态下允许canvas转图片convertToImage
        },
      },
       timeline:false, //刻度尺
       animation:false,//动画仪表盘
      ...options,
    });
    //使用世界地形
    Cesium.createWorldTerrainAsync({
      requestVertexNormals: true, //开启地形光照
      requestWaterMask: true, // 开启水面波纹
    }).then((provider)=>{
      this.viewer.terrainProvider =provider
    })
    this.viewer.imageryLayers.addImageryProvider(gaodeVecBaseMapLayer);
    this.viewer.imageryLayers.addImageryProvider(gaodeImgBaseMapLayer);
    this.viewer.camera.flyTo({
      destination:Cesium.Cartesian3.fromDegrees(
          118.345332,
          32.18228,
          6721.35,
      ),
      orientation:{
        heading: Cesium.Math.toRadians(344.58),
        pitch: Cesium.Math.toRadians(-27.44),
        roll: 0,
      }
    })
    this.showCameraInfo()
  },
  clickPoint(callback) {
    const _this = this;
    const viewer = _this.viewer;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      //click.position 获取的是屏幕坐标
      // console.log('click',click)
      let cartesian = viewer.scene.pickPosition(click.position);
      // const point = _this.cartesian3ToWGS84(cartesian);
      // console.log('点击处的坐标为：',point)
      let pickingEntity = viewer.scene.pick(click.position); //获取三维坐标和点击的实体对象
      // console.log('entity===>',pickingEntity)
      let coord = null;
      //转经纬度坐标
      if (pickingEntity && pickingEntity.id && pickingEntity.id.position) {
        cartesian = pickingEntity.id.position.getValue();
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lontable = Number(
            Cesium.Math.toDegrees(cartographic.longitude).toFixed(7),
        );
        let lattable = Number(
            Cesium.Math.toDegrees(cartographic.latitude).toFixed(7),
        );
        let height = cartographic.height;
        coord = { longitude: lontable, latitude: lattable, height: height };
      } else {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lontable =
            //@ts-ignore
            Cesium.Math.toDegrees(cartographic.longitude).toFixed(5) * 1;
        let lattable =
            //@ts-ignore
            Cesium.Math.toDegrees(cartographic.latitude).toFixed(5) * 1;
        let height = cartographic.height;
        coord = { longitude: lontable, latitude: lattable, height: height };
      }
      if (callback !== undefined && typeof callback === "function") {
        callback(pickingEntity, coord);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //设置鼠标移动事件
    handler.setInputAction(() => {
      //TODO:移动事件逻辑
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    _this.handler = handler;
  },
  /**
   * 加载一些entity
   */
  loadIcon(){
    const _this =this;
    const pinBuilder = new Cesium.PinBuilder();
    const railUrl = Cesium.buildModuleUrl("Assets/Textures/maki/rail.png");
    const railPin = Promise.resolve(
        pinBuilder.fromUrl(railUrl,Cesium.Color.BLUE,48)
    ).then((canvas)=>{
      return _this.viewer.entities.add({
        name: "滁州北站",
        //118.3130465840632, latitude: 32.41150070937502, height: -6459.406066712726
        position: Cesium.Cartesian3.fromDegrees( 118.327853, 32.308027,0),
        billboard: {
          image: canvas.toDataURL(),
          // scale: 1.0,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          rotation: 0,
          heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000)
        },
      });
    })
  },
  /**
   * cartesian3 坐标转wgs84坐标
   * @param {import('cesium').Cartesian3} cartesian
   */
  cartesian3ToWGS84(cartesian){
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height ||0;
    return {
      longitude,
      latitude,
      height
    }
  },
  showCameraInfo(){
    const viewer =this.viewer;
    if(!document.getElementById('cesium-info')){
      const container = document.createElement('div');
      container.setAttribute('id','cesium-info');
      container.setAttribute('style','position:fixed;bottom:10px;right:100px;color:white;background-color:#222;width:1100px;min-width:800px;height:24px;display:flex;justify-content:center;align-items:center;')
      document.body.append(container)
    }
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(function(event){
      const point = new Cesium.Cartesian2(event.endPosition.x,event.endPosition.y);
      if(point) {
        const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(point), viewer.scene);
        if(cartesian) {
          const cart = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
          if(cart) {
            let e = viewer.scene.globe.getHeight(cart),
                t = Math.sqrt(
                    viewer.scene.camera.positionWC.x * viewer.scene.camera.positionWC.x +
                    viewer.scene.camera.positionWC.y * viewer.scene.camera.positionWC.y +
                    viewer.scene.camera.positionWC.z * viewer.scene.camera.positionWC.z
                ),
                i = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
                let r = [(cart.longitude / Math.PI) * 180, (cart.latitude / Math.PI) * 180];
            (e = e || 0), (t = t || 0), (i = i || 0), (r = r || [0, 0]);
            const cart2 = viewer.scene.camera.positionCartographic,
                longitude = Cesium.Math.toDegrees(cart2.longitude).toFixed(6),
                latitude = Cesium.Math.toDegrees(cart2.latitude).toFixed(6),
                height = cart2.height.toFixed(2),
                heading = Cesium.Math.toDegrees(viewer.scene.camera.heading),
                pitch = Cesium.Math.toDegrees(viewer.scene.camera.pitch),
                roll = Cesium.Math.toDegrees(viewer.scene.camera.roll),
                cameraInfo =
                    "相机坐标:(" +
                    longitude +
                    "," +
                    latitude +
                    "," +
                    height +
                    ") ,H:" +
                    heading.toFixed(2) +
                    ",P:" +
                    pitch.toFixed(2) +
                    ",R:" +
                    roll.toFixed(2),
                pointInfo =
                    "视角海拔高度:" +
                    (t - i).toFixed(2) +
                    "米  海拔:" +
                    e.toFixed(2) +
                    "米  经度：" +
                    r[0].toFixed(6) +
                    " 纬度：" +
                    r[1].toFixed(6);
            if(document.getElementById('cesium-info')){
              document.getElementById('cesium-info').innerHTML=`<span>${pointInfo}</span>&nbsp;&nbsp;<span>${cameraInfo}</span>`
            } else{
              const container = document.createElement('div');
              container.setAttribute('id','cesium-info');
              container.setAttribute('style','position:fixed;bottom:20px;right:100px;color:white;background-color:#222;')
              document.body.append(container)
            }
          }
        }
      }
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  },
};

//高德矢量地图数据图层，自带注记
export const gaodeVecBaseMapLayer = new Cesium.UrlTemplateImageryProvider({
  url: "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  layer: "tdtVecBasicLayer",
  style: "default",
  format: "image/png",
  tileMatrixSetID: "GoogleMapsCompatible",
});

//高德影像地图数据图层，自带注记
export const gaodeImgBaseMapLayer = new Cesium.UrlTemplateImageryProvider({
  url: "https://webst02.is.autonavi.com/appmaptile?lang=zh_cn&size=10&scale=10&style=8&x={x}&y={y}&z={z}",
  layer: "tdtVecBasicLayer",
  style: "default",
  format: "image/png",
  tileMatrixSetID: "GoogleMapsCompatible",
});

const featureCollection =[
    turf.point([118.31043124590713, 32.43247562021133,0],{
      name:'滁州北站'
    })
]

