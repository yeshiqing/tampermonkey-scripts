// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        0.0.3
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

const VIDEOAUTOPLAY = true

document.onreadystatechange = () => {
    setTimeout(() => { // 等待 xhr 成功返回数据
        let ele_title = document.querySelector('.video-title') || document.querySelector('j-panel-title h1')
        ele_title && (document.title = ele_title.innerHTML)

        let ele_video = document.querySelector('.vjs-big-play-button')
        if (VIDEOAUTOPLAY && ele_video) {
            ele_video.click()
            let ele_fullWin = document.querySelector('.video-js-fullwindow-button')
            ele_fullWin && ele_fullWin.click()
        }
    }, 2000)
}


window.addEventListener('keydown', (e) => {
    let nodeList = document.querySelectorAll('.task-name')
    let length = nodeList.length
    let span_nextTask = nodeList[length - 1]
    if (e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
        span_nextTask.click()
    }
})