# cesium点位跟随弹窗的全框架实现

> 通过抽取底层跟随逻辑，将UI部分分离交给各框架实现,
> 实现了一个可支持多个前端框架的点位跟随弹窗。

* 目前完成了Vue3、Vue2、React三个版本的具体实现，相关渲染过程以及调用方式请参考具体代码

## 功能说明
>目前除了基本的跟随功能，还实现了和Cesium实体（Entity）一样的超过指定相机高度自动隐藏（）,
根据地图缩放而缩放()，显示动画等。此外，还支持当实体对象移动时（例如指定轨迹运动），弹窗保持跟随的接口
(updatePosition)。

## 核心代码解读
请参考[packages/common/src/core/index.js](packages/common/src/core/index.js)，
或者阅读我的[掘金文章]()。

## 底层TrackModel说明

### 构造函数选项

|           参数           | 类型                              | 说明                                                         |
| :----------------------: | --------------------------------- | :----------------------------------------------------------- |
|            id            | number                            | `TrackModel`的唯一ID,用于通过id找到对应的实例                |
|          rootEl          | `HTMLElement`                     | `TrackModel`根DOM                                            |
|          viewer          | `Cesium.Viewer`                   | Cesium的Viewer实例对象                                       |
|       useObserver        | boolean                           | 使用`MutationObserver`观察弹窗DOM的大小变化，以确保弹窗未指定固定大小且大小发生改变时，弹窗位置不发生偏移。 |
|        observerEl        | `HTMLElement`                     | 指定`MutationObserVer`监听的DOM，可用来指定只观察指定且明确发生变化的内容区域，以避免非必要的DOM变化。 |
|     observerDuration     | number                            | 指定初始化后多久启用`MutaionObserver`，异步操作，为了确保初始化和动画引起的DOM变化不触发`MutaionObserver`。 |
|        coordinate        | object                            | 点位坐标，具体参数参考下方                                   |
|   coordinate.longitude   | number                            | 经度                                                         |
|   coordinate.latitude    | number                            | 纬度                                                         |
|    coordinate.height     | number                            | 可选项，坐标点位的高度                                       |
|          offset          | `Cesium.Cartesian2`               | 弹窗的屏幕偏移量，与`Entity.billboard`的偏移类似             |
|         offset.x         | number                            | 横向偏移量，屏幕向右为正。                                   |
|         offset.y         | number                            | 纵向偏移量，屏幕向下为正。                                   |
|          global          | boolean                           | 弹窗是否单例模式（每次加载都销毁之前的实例）                 |
|           fly            | boolean                           | 是否打开飞行模式(`camera.flyTo`)，配合下方的`flyOffset`使用。 |
|        flyOffset         | object                            | 飞行的相机坐标和点位坐标之间的偏移量，用于确定飞行后相机的坐标和姿态。如果使用，需将`fly`设置为`true` |
|   flyOffset.longitude    | number                            | 经度偏移量                                                   |
|    flyOffset.latitude    | number                            | 纬度偏移量                                                   |
|     flyOffset.height     | number                            | 高度偏移量                                                   |
|    flyOffset.heading     | number                            | 相机的heading，Degree模式。如果未指定，将默认相机当前heading |
|     flyOffset.pitch      | number                            | 相机的pitch，Degree模式。如果未指定，将默认相机当前pitch     |
|      flyOffset.roll      | number                            | 相机的roll。如果未指定，将默认相机当前的roll                 |
|    flyOffset.duration    | number                            | 使用`camera.flyTo`飞行时的duration，飞行时间。               |
|     completeCallback     | function                          | 相机飞行后执行的回调函数                                     |
|           show           | `"beforeFly" "afterFly"`          | 弹窗的显示时机，是飞行后显示还是飞行后显示。默认`beforeFly`。当`afterFly`时，需要先把`fly`设置为`true` |
|       loadInterval       | number                            | 弹窗加载延时，用来等待某些必要的操作完成后再加载弹窗         |
|        autoScale         | boolean                           | 弹窗是否需要自动缩放                                         |
| distanceDisplayCondition | `Cesium.DistanceDisplayCondition` | 根据点位到相机的距离控制弹窗显隐，当`autoScale`为`true`时有效 |
|     scaleByDistance      | `Cesium.NearFarScalar`            | 控制弹窗的缩放尺寸，当`autoScale`为`true`时有效              |

### API说明

#### `setRootEl`(rootEl,mounted)

该方法的使用可参考React版本的实现

```js
/**
* 手动挂载节点，以支持某些异步渲染框架的情况
* @param {HTMLElement} rootEl 弹窗的根DOM
* @param {boolean} mounted 是否在TrackModel外部完成了挂载，这样TrackModel就不会自行挂载了
*/
```

#### `updatePosition(cartesian)`

```js
/**
* 更新弹窗的位置
* @type {import('cesium').Cartesian3}
* @param position
*/
```

#### `flyToPoint()`

相机飞行到指定的位置

#### `destroy()`

销毁弹窗


## 各框架具体实现
* Vue3版本实现请参考[这里](apps/vue3/src/components/TrackModel/index.jsx)


* Vue2版本实现请参考[这里](apps/vue2/src/component/TrackModel/index.js)


* React版本实现请参考[这里](apps/react/src/components/TrackModel/index.jsx)

其它详细说明依旧欢迎你阅读我的[掘金文章]()

## TypeScript版本实现
> 为了方便喜欢TypeScript的小伙伴，将增加TypeScript的支持，相关代码在typescript分支中，
> 请切换分支后查看。

## 本文的最后
如果觉得不错，请给勤劳的作者一个star吧。

如有问题欢迎给我提issue，或者加入我的QQ群: [前端摸鱼夺冠群：434063310]

