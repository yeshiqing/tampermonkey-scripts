// ==UserScript==
// @name           Chrome DevTools console
// @description    "console.log()" and "console.dir()" faster in the DevTools of Chrome
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          *://*/*
// @grant          none
// @version        0.0.8
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

let defineProperty = (obj, prop, getFn) => {
    if (!obj.hasOwnProperty(prop)) {
        Object.defineProperty(obj, prop, {
            "configurable": true,
            "enumerable": false,
            "writable": true,
            "value": getFn
        })
    }
}

let generate_console = function (...props) {
    props.forEach((prop, i) => {
        defineProperty(window, prop, function (...args) {
            console[prop](...args)
        })
    })
}

generate_console('log', 'dir')


{
    let excludedDomain = ["bilibili.com"]
    let injectObjectPrototype = true
    for (let host of excludedDomain) {
        if (window.location.host.includes(host)) {
            injectObjectPrototype = false
            break
        }
    }

    if (injectObjectPrototype === false) {
        return
    }

    defineProperty(Object.prototype, 'log', function logCustom() { console.log(this) })

    setTimeout(() => { // 应对“掘金”主页，对象存在重名键 dir
        defineProperty(Object.prototype, 'dir', function dirCustom() { console.dir(this) })
    }, 1000)
}