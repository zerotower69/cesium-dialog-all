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
