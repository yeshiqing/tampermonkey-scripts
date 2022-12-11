// ==UserScript==
// @name           Chrome DevTools console
// @description    "console.log()" and "console.dir()" faster in the DevTools of Chrome
// @author         yeshiqing
// @license        MIT
// @run-at         document-start
// @match          *://*/*
// @grant          none
// @version        0.0.2
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

let isFn = function (x) { return (x instanceof Function) }

let generate_console = function (...props) {
    props.forEach((prop, i) => {
        let cover = null
        Object.defineProperty(window, prop, {
            "configurable": true,
            "enumerable": false,
            get() {
                return function (...args) {
                    cover && isFn(cover) && cover()
                    console[prop](...args)
                }
            },
            set(v) {
                console.warn(`试图对 window.${prop} 进行赋值`)
                cover = v
            }
        })
    })
}

let extend_Object_prototype = function (...props) {
    props.forEach((prop, i) => {
        if (Object.prototype[prop] == null) {
            Object.prototype[prop] = function () {
                console[prop](this)
            }
        }
    })
}

generate_console('log', 'dir')

extend_Object_prototype('log', 'dir')