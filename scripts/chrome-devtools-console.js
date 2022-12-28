// ==UserScript==
// @name           Chrome DevTools console
// @description    "console.log()" and "console.dir()" faster in the DevTools of Chrome
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          *://*/*
// @grant          none
// @version        0.0.6
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

let isFn = function (x) { return (x instanceof Function) }

let defineProperty = (obj, prop, getFn) => {
    Object.defineProperty(obj, prop, {
        "configurable": true,
        "enumerable": false,
        "writable": true,
        "value": getFn
    })
}

let generate_console = function (...props) {
    props.forEach((prop, i) => {
        (window.prop == undefined) &&
            defineProperty(window, prop, function (...args) {
                console[prop](...args)
            })
    })
}

let extend_Object_prototype = function (...props) {
    props.forEach((prop, i) => {
        let getFn = function () {
            console[prop](this)
        }
        Object.defineProperty(getFn, 'name', {
            "configurable": true,
            "enumerable": false,
            "writable": false,
            "value": prop
        })
        !(prop in Object.prototype) &&
            defineProperty(Object.prototype, prop, getFn)
    })
}


generate_console('log', 'dir')

setTimeout(() => { // 应对“掘金”主页，对象存在重名键 dir
    extend_Object_prototype('log', 'dir')
}, 1000)
