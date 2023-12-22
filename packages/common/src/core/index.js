import * as Cesium from "cesium"
import {isNumber, isUndefined} from "lodash-es"
import {handleWarning, setStyle} from "./common.js"

/**
 * 默认options
 * @type {import('track-model').TrackModelOptions}
 */
const defaultOptions={
    fly:false,
    show:'beforeFly',
    useObserver:true,
    autoScale:false
}

export class TrackModel{

    /**
     * 弹窗根DOM wrapper层
     * @type {HTMLElement}
     */
    _$root

    /**
     *
     */

    /**
     * 弹窗uid
     * @type {number}
     */
    uid
    /**
     * viewer对象
     * @type {import('cesium').Viewer}
     * @private
     */
    _viewer
    /**
     * 弹窗对应的cesium位置
     * @type {import('cesium.js').Cartesian3}
     */
    _position

    /**
     * 弹窗偏移量
     * @type {{x:number;y:number}}
     * @private
     */
    _offset

    /**
     * 监听函数
     * @type {null | (() => void)}
     * @private
     */
    _moveListener

    /**
     * @type {import('cesium.js').DistanceDisplayCondition}
     * @private
     */
    _distanceDisplayCondition

    /**
     *
     * @type {import('cesium.js').NearFarScalar}
     * @private
     */
    _scaleByDistance

    /**
     * 传入的选项参数
     * @type {import('track-model').TrackModelOptions}
     * @private
     */
    _options

    /**
     * 加载完成?
     * @type {boolean}
     * @private
     */
    _loaded;

    /**
     * 弹窗已经挂载
     * @type {boolean}
     * @private
     */
    _mounted;

    /**
     *
     * @param {import('track-model').TrackModelOptions} options
     */
    constructor(options) {
        this._options ={
            ...defaultOptions,
            ...options
        }
        //初始化
        this._init()
    }

    /**
     * 手动挂载节点，以支持某些异步渲染框架的情况
     * @param {HTMLElement} rootEl
     * @param {boolean} mounted 是否在TrackModel外部完成了挂载，这样TrackModel就不会自行挂载了
     */
    setRootEl(rootEl,mounted=false){
        this._$root = rootEl
        this._mounted=mounted
    }

    /**
     * 更新弹窗的位置
     * @type {import('cesium').Cartesian3}
     * @param position
     */
    updatePosition(position){
        this._position =position
    }

    /**
     * 相机飞行到指定的位置
     */
    flyToPoint(){
        const _this = this;
        const options = this._options;
        const longitude = options.coordinate.longitude +(options?.flyOffset?.longitude ?? 0);
        const latitude =options.coordinate.latitude+(options?.flyOffset?.latitude ?? 0);
        const height =(options?.coordinate?.height ??0) +(options?.flyOffset?.height ?? 0);
        const viewer =this._viewer;
        const heading = isNumber(options?.flyOffset?.heading)? Cesium.Math.toRadians(options.flyOffset.heading):viewer.camera.heading;
        const pitch =isNumber(options?.flyOffset?.pitch)? Cesium.Math.toRadians(options.flyOffset.pitch):viewer.camera.pitch;
        const roll = isNumber(options?.flyOffset?.roll)? options.flyOffset.roll : 0;

        const flyOptions={
            destination:Cesium.Cartesian3.fromDegrees(longitude,latitude,height),
            orientation:{
                heading,
                pitch,
                roll
            }
        };
        if(options.show === 'afterFly'){
            flyOptions.complete=function (){
                _this._mountedModel()
            }
        }
        if(isNumber(options?.flyOffset?.duration)){
            flyOptions.duration = options.flyOffset.duration
        }
        viewer.camera.flyTo(flyOptions)
    }

    /**
     * 销毁弹窗
     */
    destroy(){
        if(!this._$root || !this._mounted){
            //为挂载销毁给出警告
           handleWarning("The TrackModel doesn't finish mounting, please use [destroy] method later.")
            return
        }
        this._$root?.remove?.()
        this._clearListener()
    }

    /**
     * 初始化
     * @private
     */
    _init(){
        const options = this._options;
        this._loaded = false;
        this._mounted = false;
        this.uid = options.id;
        //说明一下,指定弹窗的根DOM可以在初始化完成，也可以通过setMountEl完成，但总要选择一样
        //之所以这样设计，是为了适配更多的框架，例如react
        if(options.rootEl){
            this._$root = options.rootEl
        }
        //set viewer instance
        this._viewer= options.viewer
        //set model offset
        this._offset={
            x:options?.offset?.x ?? 0,
            y:options?.offset?.y ?? 0,
            height:options?.height ?? 0
        }
        //set position
        this._position =new Cesium.Cartesian3.fromDegrees(
            options.coordinate.longitude,
            options.coordinate.latitude,
            options?.coordinate?.height ?? 0
        );
        //set scale
        if(options.autoScale){
            this._scaleByDistance= options?.scaleByDistance
            this._distanceDisplayCondition =options?.distanceDisplayCondition
        }
        //mounted dom to widget
        if(options.show === 'beforeFly' || (!options.fly && options.show === 'afterFly')){
            //show为beforeFly 飞之前渲染弹窗，当不飞但是把show设置为了afterFly也要渲染弹窗
            //TODO:后面的情况在开发模式中抛出警告
            this._mountedModel()
        }
        //要飞就去飞吧
        if(options.fly){
            this.flyToPoint()
        }
        //用变量设置加载完成了
        this._loaded=true
    }

    /**
     * 设置回调
     * @private
     */
    _setListener(){
        const _this =this;
        const options = this._options;
        const viewer = this._viewer
        let screenPoint = {
            x:options?.coordinate?.longitude,
            y:options?.coordinate?.latitude,
            height:options?.coordinate?.height ?? 0
        }
         let screen = viewer.scene.cartesianToCanvasCoordinates(_this._position);
        _this._updateStyle(screen,_this._offset);
        //每一帧渲染结束后，都去更新弹窗的位置
        this._moveListener= function (){
            //84坐标转屏幕坐标
            screen = viewer.scene.cartesianToCanvasCoordinates(_this._position);
            if (screen) {
                if (screenPoint.x !== screen.x || screenPoint.y !== screen.y) {
                    //坐标发生变化就去更新弹窗位置
                    _this._updateStyle(screen,_this._offset);
                    screenPoint = screen;
                }
            }
        }
        this._viewer.scene.postRender.addEventListener(this._moveListener)
    }

    /**
     * 移除回调
     * @private
     */
    _clearListener(){
        if(this._moveListener) {
            this._viewer.scene.postRender.removeEventListener(this._moveListener)
        }
        this._moveListener=null
    }

    /**
     * 更新弹窗的style样式
     * @param {{x:number;y:number}} screen 屏幕坐标
     * @param {{x:number;y:number}} offset 弹窗偏移量
     * @private
     */
    _updateStyle(screen,offset){
        //防止错误
        if(isUndefined(screen) || isUndefined(screen.x) || isUndefined(screen.y)){
            //TODO:抛出警告
            return
        }
        const options=this._options
        const el = this._$root
        if(!el || !this._mounted){
            //挂载操作还没结束
            return
        }
        const viewer = this._viewer
        //set translate3d
        let offsetX = el.offsetWidth / 2 - (offset?.x ?? 0);
        let offsetY = el.offsetHeight - (offset?.y ?? 0);
        //set scale
        let scale3d = `scale3d(1,1,1)`;
        //缩放逻辑
        let scaleX = 1,
            scaleY = 1;
        const up = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
            this._position,
            new Cesium.Cartesian3()
        );
        //相机位置
        const cp = viewer.camera.positionWC;
        //相机方位
        const cd = viewer.camera.direction;
        const distance = Cesium.Cartesian3.distance(this._position, cp); //弹窗在地图中的位置和相机位置的距离
        const isFront = Cesium.Cartesian3.dot(cd, up) <= 0;
        if(options.autoScale){
            let scaleByDistance = this._scaleByDistance;
            if (distance && scaleByDistance) {
                let near = scaleByDistance.near || 0.0;
                let nearValue = scaleByDistance.nearValue || 1.0;
                let far = scaleByDistance.far || Number.MAX_VALUE;
                let farValue = scaleByDistance.farValue || 0.0;
                let f = distance / far;
                if (distance < near) {
                    scaleX = nearValue;
                    scaleY = nearValue;
                } else if (distance > far) {
                    scaleX = farValue;
                    scaleY = farValue;
                } else {
                    const scale = farValue + (1 - f) * (nearValue - farValue);
                    scaleX = scale;
                    scaleY = scale;
                }
            }
            scale3d = `scale3d(${scaleX},${scaleY},1)`;
        }

        const x = Math.round(screen.x - offsetX);
        const y = Math.round(screen.y - offsetY);
        const translate3d = `translate3d(${x}px,${y}px, 0)`;
        // set condition
        let isDisplay = true;
        const distanceDisplayCondition = this._distanceDisplayCondition;
        if (distance && distanceDisplayCondition) {
            isDisplay = this._isBetween(
                distance,
                distanceDisplayCondition.near || 0.0,
                distanceDisplayCondition.far || Number.MAX_VALUE
            );
        }
        //update style
        setStyle(el, {
            transformOrigin:'center bottom',
            transform: `${translate3d} ${scale3d}`,
            display: isDisplay && isFront ? "block" : "none"
        });
    }

    /**
     * 某个值b在区间[a,c]里
     * @param a
     * @param b
     * @param c
     * @return {boolean}
     * @private
     */
    _isBetween(a, b, c){
        return (a = parseFloat(a) || 0) >= parseFloat(b) && a <= parseFloat(c);
    }

    /**
     * 挂载弹窗DOM
     * @private
     */
    _mountedModel(){
        if(!this._$root){
            handleWarning('You must set the mounted HTMLElement, the mounting has been stopped.')
            return
        }
        const options = this._options
        const _this = this;
        if(!this._mounted){
            document.body.appendChild(this._$root)
            _this._mounted = true;
        }
        //设置异步监听DOM的原因是初始化DOM造成的变化不需要被监听,并防止初始动画造成的DOM变化被监听
        Promise.resolve().then(()=>{
            //设置监听器
            this._setListener()
        })
       setTimeout(()=>{
           _this._watchDOMChange();
       },isNumber(options.observerDuration)?options.observerDuration:0)
    }

    /**
     * 使用MutationObserver观察内容区的变化
     * @private
     */
    _watchDOMChange() {
        const _this = this;
        const options = this._options;
        if (this._mounted && options.useObserver) {
            const viewer = this._viewer;
            const offset = this._offset;
            //监听DOM
            const watchEl = options?.observerEl ?? this._$root;
            //使用MutationObserver观察内容区trackModelContent以及所有子节点的变化，子节点发生了变化了，其实就是弹窗大小变化了的，手动触发一次updateTrackModelStyle
            const observer = new MutationObserver(function (mutations, observer) {
                // console.log(mutations, observer);
                const screen = viewer.scene.cartesianToCanvasCoordinates(_this._position);
                for (const mutation of mutations) {
                    if (mutation.target !== watchEl) {
                        if (screen) {
                            _this._updateStyle(screen, offset);
                            break;
                        }
                    }
                }
            });
            observer.observe(watchEl, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

}
