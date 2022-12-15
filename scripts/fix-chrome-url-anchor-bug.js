// ==UserScript==
// @name           Fix Chrome URL anchor bug
// @description    URL with anchor in Chrome can't jump to the specified position
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://developer.mozilla.org/
// @grant          none
// @version        0.0.1
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

// 目前仅在 MDN 有效
const DEBUG_Mode = false
let isChrome = window.navigator.userAgent.includes('Chrome')
if (isChrome) {
    let location = window.location // 有 getter/setter
    let old_hash = location.hash
    if (old_hash !== '') {
        if (DEBUG_Mode === true) {
            // Chrome 地址栏输入 http://localhost:64338/temporary.html#demo 首次回车，会触发 scroll 事件；之后回车不会触发。
            let scrollFn = (e) => {
                // console.log('scroll')
                // document.removeEventListener('scroll', scrollFn)
            }
            document.addEventListener('scroll', scrollFn)
        }

        function method1() {
            let timestamp = Date.now()
            window.location = `#${timestamp}`
            setTimeout(() => {
                // console.log('modify hash')
                window.location = old_hash
            }, 50)
        }
        function method2() {
            setTimeout(() => {
                let ele = document.querySelector(old_hash)
                ele && ele.scrollIntoView()
            }, 0)
        }
        function method3() {
            window.location = window.location.href.replace(/#[A-Za-z0-9_]*$/, '') + old_hash
        }
        function method4() {
            window.location = old_hash
        }
        window.addEventListener('load', (e) => { // DOM节点加载完毕，页面图片和样式都已加载完毕
            // method1()
            // method2()
            // method3()
            method4()
        })

    }
}