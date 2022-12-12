// ==UserScript==
// @name           Chrome DevTools console
// @description    "console.log()" and "console.dir()" faster in the DevTools of Chrome
// @author         yeshiqing
// @license        MIT
// @run-at         document-start
// @match          *://*/*
// @grant          none
// @version        0.0.4
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

let isFn = function (x) { return (x instanceof Function) }

let defineProperty = (obj, prop, getFn) => {
    let value
    Object.defineProperty(obj, prop, {
        "configurable": true,
        "enumerable": false,
        get() { return value ?? getFn },
        set(v) { value = v }
    })
}

let generate_console = function (...props) {
    props.forEach((prop, i) => {
        defineProperty(window, prop, function (...args) {
            console[prop](...args)
        })
    })
}

let extend_Object_prototype = function (...props) {
    props.forEach((prop, i) => {
        defineProperty(Object.prototype, prop, function () {
            console[prop](this)
        })
    })
}

generate_console('log', 'dir')

extend_Object_prototype('log', 'dir')