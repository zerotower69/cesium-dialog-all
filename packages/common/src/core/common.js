import { isObject } from "lodash-es";

/**
 * -分隔转驼峰 min-width ===>minWidth
 * @param {string} key
 */
export function camelize(key){
    return key.replace(/-([a-z])/g,function(all,i){
        return i.toUpperCase()
    })
}

/**
 * 设置style
 * @param {HTMLElement} element
 * @param {import('vue').CSSProperties | (keyof import('vue').CSSProperties) } styleName
 * @param {string|number} value
 */
export const setStyle = (element, styleName, value = "") => {
    if (!element || !styleName) return;

    if (isObject(styleName)) {
        entriesOf(styleName).forEach(([prop, value]) => setStyle(element, prop, value));
    } else {
        const key = camelize(styleName);
        element.style[key] = value;
    }
};

/**
 *
 * @param {T} arr
 * @return {import('type-fest').Entries<T>}
 */
export const entriesOf = (arr) => Object.entries(arr);

//define self Error class.
export class TrackModelError extends Error{
    constructor(message) {
        super(message);
        this.name = 'TrackModelError'
    }
}

/**
 * 输出警告信息
 * @param message
 */
export function handleWarning(message){
    message = `[TrackModel] ${message}`
    console.warn(message)
}

/**
 * 使用requestAnimationRequest执行函数
 * @param fn 函数
 * @param options
 */
export function useRafFn(fn,options={}){
    const {immediate=true,fpsLimit=undefined}=options
    const intervalLimit = fpsLimit ? 1000 / fpsLimit : null
    let previousFrameTimestamp = 0
    let rafId = null

    let isActive =false;

    //当前状态
    function getActive(){
        return isActive
    }

    /**
     * 循环执行函数
     * @param {DOMHighResTimeStamp} timestamp
     */
    function loop(timestamp){
        if(!isActive){
            return
        }

        const delta = timestamp - (previousFrameTimestamp || timestamp)

        if (intervalLimit && delta < intervalLimit) {
            rafId = window.requestAnimationFrame(loop)
            return
        }

        fn({ delta, timestamp })

        previousFrameTimestamp = timestamp
        rafId = window.requestAnimationFrame(loop)
    }

    function resume(){
        if(!isActive){
            isActive=true;
            rafId = window.requestAnimationFrame(loop)
        }
    }

    function pause(){
        isActive =false
        if(!rafId){
            window.cancelAnimationFrame(rafId)
            rafId=null
        }
    }

    if(immediate){
        resume()
    }

}
