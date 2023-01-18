// ==UserScript==
// @name           Disable yuque website hotkeys
// @description    Disable website hotkeys which is implemented by JavaScript API "addEventListener" and "stopImmediatePropagation".
// @author         yeshiqing
// @license        MIT
// @run-at         document-start
// @match          https://www.yuque.com/*
// @grant          none
// @version        0.0.7
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-1d5a2ebbd33475e1.png
// ==/UserScript==

// Disable these keys when no keyboard modifier is pressed
let std_keys = new Set([
    // 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'
])

// Disable these keys when Meta key is pressed.
let meta_keys = new Set([
    'Enter' // Command + enter
])

// Disable these keys when Alt key is pressed.
let alt_keys = new Set([
    // 's' // Alt + s
])

let platform = navigator.userAgentData?.platform || navigator.platform
let isMac = platform.includes('macOS') || platform.includes('Mac')

window.addEventListener('keydown', function (e) {
    let key
    if (isMac ? e.metaKey : e.ctrlKey) {
        key = meta_keys
    } else if (e.altKey) {
        key = alt_keys
    } else {
        key = std_keys
    }

    if (key.has(e.key)) {
        e.stopImmediatePropagation()
    }
}, true)