// ==UserScript==
// @name           Fix Chrome URL anchor bug
// @description    URL with anchor in Chrome can't jump to the specified position
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://developer.mozilla.org/*
// @match          https://*.vuejs.org/*
// @grant          none
// @version        0.0.3
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

let isChrome = window.navigator.userAgent.includes('Chrome')
if (isChrome) {
    let location = window.location
    let old_hash = location.hash
    if (old_hash !== '') {
        window.addEventListener('load', (e) => { // DOM节点加载完毕，页面图片和样式都已加载完毕
            setTimeout(() => {
                window.location = old_hash
            }, 100) // 应对文档异步加载
        })

    }
}