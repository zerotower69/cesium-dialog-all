import * as Cesium from "cesium"
import {isFunction, isNumber} from "lodash-es"
import {setStyle} from "./common.js"
export class TrackModel{
    /**
     * 弹窗根DOM
     * @type {HTMLElement}
     */
    _$el
    /**
     * 内容区根dom
     * @type {HTMLElement}
     */
    _$content
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
     * @type {number}
     * @private
     */
    _uid

    /**
     * 传入的选项参数
     * @type {import('track-model').CreateOptions}
     * @private
     */
    _options

    /**
     *
     * @param {import('track-model').CreateOptions} options
     */
    constructor(options) {
        this._options =options
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
     *
     * @param {{longitude:number;latitude:number;height?;number}} coord
     * @param {{longitude?:number;latitude?:number;height?:number}} flyOffset
     * @param {{heading?:number;pitch?:number;roll?:number}} directOptions
     * @param {null |((...args:any)=>any)} completeCallback
     */
    flyToPoint(coord,flyOffset,directOptions,completeCallback=null){
        const viewer =this._viewer;
        const heading = isNumber(directOptions?.heading)? Cesium.Math.toRadians(directOptions.heading):viewer.camera.heading;
        const pitch =isNumber(directOptions?.pitch)? Cesium.Math.toRadians(directOptions.pitch):viewer.camera.pitch;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                coord.longitude +(flyOffset?.longitude ?? 0),
                coord.latitude - (flyOffset?.latitude ?? 0),
                flyOffset?.height ?? 0
            ),
            orientation: {
                heading: heading,
                pitch: pitch,
                roll: directOptions?.roll ?? 0
            },
            complete:function(){
                if(isFunction(completeCallback)){
                    completeCallback.call(null)
                }
            }
        })
    }

    /**
     * 初始化
     * @private
     */
    _init(){
        const options = this._options;
        //set viewer instance
        this._viewer= options.viewer
        //set model offset
        this._offset={
            x:options?.offset?.x ?? 0,
            y:options?.offset?.y ?? 0
        }
    }

    /**
     * 设置回调
     * @param {{ x: number; y: number; height?: number }} popPoint
     * @private
     */
    _setListener(popPoint){
        const _this =this;
        const options = this._options;
        const cartesian = new Cesium.Cartesian3.fromDegrees(popPoint.x, popPoint.y, popPoint.height);
        this._position = cartesian;
        let screenPoint = popPoint;
        //每一帧渲染结束后，都去更新弹窗的位置
        this._moveListener= function (){
            //84坐标转屏幕坐标
            let screen = _this._viewer.scene.cartesianToCanvasCoordinates(_this._position);
            if (screen) {
                if (screenPoint.x !== screen.x || screenPoint.y !== screen.y) {
                    //坐标发生变化就去更新弹窗位置
                    _this._updateStyle(screen,_this._offset);
                    screenPoint = screen;
                }
            }
        }
        this._viewer.scene.postRender.addEventListener(this._moveListener)
        //使用MutationObserver观察内容区trackModelContent以及所有子节点的变化，子节点发生了变化了，其实就是弹窗大小变化了的，手动触发一次updateTrackModelStyle
        const observer = new MutationObserver(function (mutations, observer) {
            // console.log(mutations, observer);
            for (const mutation of mutations) {
                if (mutation.target !== _this._$content) {
                    const screen = _this._viewer.scene.cartesianToCanvasCoordinates(_this._position);
                    _this._updateStyle(screen, _this._offset);
                    break;
                }
            }
        });
        observer.observe(this._$content, {
            childList: true,
            subtree: true,
            attributes: true
        });
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
        const options=this._options
        const el = this._$el
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
            //TODO:重新计算偏移量
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

    _isBetween(e, t, i){
        return (e = parseFloat(e) || 0) >= parseFloat(t) && e <= parseFloat(i);
    }

    /**
     * 挂载弹窗DOM
     * @private
     */
    _mountedModel(){
        const $widgetEl = this._viewer.cesiumWidget.container;
        $widgetEl.appendChild(this._$el)
    }

}