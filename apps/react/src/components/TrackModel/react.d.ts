declare module "@react/track-model"{
    //@ts-ignore
    import {TrackModelOptions} from "track-model"
    import {CSSProperties} from "react"
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
    interface ReactTrackModelOptions extends TrackModelOptions{

    }
    interface ContentChild {
        name:string;
        props:Record<string, any>
    }
    interface CreateOptions extends TrackModelOptions{
        //动画时长，单位ms.
        duration:number
    }
    export {TrackModelOptions,ContentChild,CreateOptions,TrackModelProps}
}