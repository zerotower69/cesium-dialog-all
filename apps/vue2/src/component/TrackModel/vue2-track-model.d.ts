declare module '@vue2/track-model'{
    import {TrackModelOptions} from "track-model"
    import {Properties,PropertiesHyphen} from "csstype"

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
    interface Vue2TrackModelOptions extends TrackModelOptions {}
    interface CreateOptions extends TrackModelOptions{
        //组件动画时长，单位ms。为0时动画消失，默认1000ms(1s)。
        duration:number
    }
    type ContentSlot = {name:string,props:Record<string, unknown>}
    interface CSSProperties extends Properties<string | number>, PropertiesHyphen<string | number> {
        /**
         * The index signature was removed to enable closed typing for style
         * using CSSType. You're able to use type assertion or module augmentation
         * to add properties or an index signature of your own.
         *
         * For examples and more information, visit:
         * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
         */
        [v: `--${string}`]: string | number | undefined;
    }
    export {Vue2TrackModelOptions,CreateOptions,TrackModelProps,ContentSlot,CSSProperties}
}