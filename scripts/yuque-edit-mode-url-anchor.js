// ==UserScript==
// @name           Fix Chrome URL anchor bug
// @description    URL with anchor in Chrome can't jump to the specified position
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://www.yuque.com/*/edit*
// @grant          none
// @version        0.0.1
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-1d5a2ebbd33475e1.png
// ==/UserScript==

let isChrome = window.navigator.userAgent.includes('Chrome')
if (isChrome) {
    let location = window.location // 有 getter/setter
    let old_hash = location.hash
    if (old_hash !== '') {

        function method4() {
            window.location = old_hash
        }
        window.addEventListener('load', (e) => { // DOM节点加载完毕，页面图片和样式都已加载完毕
            setTimeout(() => {
                method4()
            }, 1000)
        })

    }
}