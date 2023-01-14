// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        1.0.0
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

// ==用户可修改的配置项==
// *_DISABLE 表示禁用原有事件
// *_HIJACK 表示劫持原事件，插入 hook
const VOLUME_ADJUST_ARROWKEY_DOWN = 4      // 左右方向键调整视频快进快退的粒度，以秒为单位
const VIDEO_DBLCLICK_DISABLE = true        // 禁用视频原有的鼠标双击切换「全屏」。当切换应用时会误触发切换至「全屏」。
const F_KEYUP_HIJACK_AFTER = true          // 按 f 键，切换「网页全屏」。
const AUTO_FULLWINDOW = true               // 视频是否自动「网页全屏」
const VIDEO_AUTOPLAY = true                // 视频是否自动播放
// ==/用户可修改的配置项==

// ==Config For Development==
const DEBUG_EVENT = false
const EVENTS_DISABLE = ['mouseenter', 'mouseleave', 'mouseover'] // 禁用事件，根本不绑定这些事件
const CMD_KEYDOWN_DISABLE = false
const ESCAPE_KEYUP_HIJACK_AFTER = true     // escape keyup 在原事件之后加入 hook
const TRIGGER_WEBPACKJSONP_API = true      // 调用饥人谷提供的 webpackJsonp API
const VIDEO_CLICK_DISABLE = false          // 用于调试，不触发源代码中与 video click 事件相关的函数。按快捷键前需要点击一下聚焦 video。
const LOG_VIDEO_STATUS = false
const EVENTS_CONFIG = {
    'rawEvents': {
        'keyup': [{
            'eventName': 'keyup',
            'key': 'Escape', // event.key
            'this': document, // 针对 this=document, e.key='Escape', e.type='keyup' 的事件进行 hijack
            'fn': null, // 在原有事件处理程序之前插入 hook 的函数名
            'hijack': false, // 是否在原有事件处理程序之前插入 hook
            'fnAfter': 'pauseVideo', // 在原有事件处理程序之后插入 hook 的函数名
            'hijackAfter': ESCAPE_KEYUP_HIJACK_AFTER, // 是否在原有事件处理程序之后插入 hook
            'disable': false         // 是否禁用原有事件处理程序
        }, {
            'eventName': 'keyup',
            'key': 'f',
            'this': document,
            'fnAfter': 'switchWebsiteScreen',
            'hijackAfter': F_KEYUP_HIJACK_AFTER,
            'disable': true
        }],
        'keydown': [{
            'eventName': 'keydown',
            'key': 'Meta',
            'this': document,
            'disable': CMD_KEYDOWN_DISABLE
        }, {
            'eventName': 'keydown',
            'key': 'ArrowRight',
            'this': document,
            'fnAfter': 'fastForward',
            'hijackAfter': true,
            'disable': true

        }, {
            'eventName': 'keydown',
            'key': 'ArrowLeft',
            'this': document,
            'fnAfter': 'fastRewind',
            'hijackAfter': true,
            'disable': true

        }],
        'click': [{
            'eventName': 'click',
            'this': 'video',
            'disable': VIDEO_CLICK_DISABLE
        }],
        'dblclick': [{
            'eventName': 'dblclick',
            'this': 'video',
            'disable': VIDEO_DBLCLICK_DISABLE
        }],
    },
    // 自定义。与 rawEvents 有不同数据结构
    'videoEvents': {
        'eventName': ['playing', 'play', 'waiting', 'pause', 'ended', 'loadedmetadata'],
        'key': null,
        'this': 'video',
        'fn': 'setVideoStatus',
        'hijack': true,
        'disable': false
    },
}
// ==/Config For Development==

/**
 * 触发 hijack 和 hijackAfter 所绑定的事件
 */
let $triggerHijackEvents = {
    video_status: 'loadedmetadata', // loadedmetadata, playing, play, waiting, pause, ended 
    _simulate_keyupEscape() {
        const event = new KeyboardEvent('keyup', {
            key: "Escape",
            view: window,
            bubbles: true,
            cancelable: true
        })
        document.dispatchEvent(event)
    },
    /**
     * 是否网页全屏 
     */
    _isWebsiteScreen() {
        let elm = document.querySelector('.video-wrapper')
        return elm && elm.matches('.fullWindow')
    },
    /**
     * f keyup trigger 切换「网页全屏」
     */
    switchWebsiteScreen(event) {
        if ($triggerHijackEvents._isWebsiteScreen()) {
            $triggerHijackEvents._simulate_keyupEscape()
        } else {
            document.dispatchEvent(new CustomEvent("videoToggleFullWindow"))
        }
    },
    _getVideo() {
        return document.querySelector('.vjs-tech') || document.querySelector('video')
    },
    /**
     * Escape keyup trigger
     */
    pauseVideo(event) {
        if (this._isWebsiteScreen()) {
            let video = $triggerHijackEvents._getVideo()
            video && video.pause()
        }
    },
    /**
     * 'videoEvents' trigger
     */
    setVideoStatus(event) {
        $triggerHijackEvents.video_status = event.type
        LOG_VIDEO_STATUS && console.log($triggerHijackEvents.video_status)
    },
    /**
     * ArrowRight keydown trigger
     */
    fastForward(event) {
        let video = $triggerHijackEvents._getVideo()
        video && (video.currentTime = video.currentTime + VOLUME_ADJUST_ARROWKEY_DOWN)
    },
    /**
     * ArrowLeft keydown trigger
     */
    fastRewind(event) {
        let video = $triggerHijackEvents._getVideo()
        video && (video.currentTime = video.currentTime - VOLUME_ADJUST_ARROWKEY_DOWN)
    }
}
let $hijack = {
    events: EVENTS_CONFIG,
    /**
     * 是否拦截原事件处理程序
     * @param {object} event
     * @returns {boolean}
     */
    isDisable(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { disable } = obj
            disable = (typeof disable === 'boolean' ? disable : false) // 默认 disable 为 false

            return disable
        }
        return false
    },
    /**
     * 在原本事件之前触发的 hook
     */
    trigger(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { hijack } = obj
            hijack = (typeof hijack === 'boolean' ? hijack : false) // 默认 hijack 为 false

            hijack && ($triggerHijackEvents[obj.fn] || function (e) { })(event)
        }
    },
    /**
     * 在原本事件之后触发的 hook
     */
    triggerAfter(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { hijackAfter } = obj
            hijackAfter = (typeof hijackAfter === 'boolean' ? hijackAfter : false) // 默认 hijackAfter 为 false

            hijackAfter && ($triggerHijackEvents[obj.fnAfter] || function (e) { }).call($triggerHijackEvents, event)
        }
    },
    getThis(selector) {
        if (selector instanceof Object) {
            return selector
        } else if (typeof selector === 'string') {
            return document.querySelector(selector)
        } else if (typeof selector === 'undefined') {
            console.warn(`add 'this' to 'EVENTS_CONFIG' or 'window' in default`)
            return window
        }
        throw new Error(`can't find element according to the selector: '${selector}'`,)
    },
    /**
     * 获取 EVENTS_CONFIG 中的事件信息
     */
    getEvent(event) {
        let eventName = event.type
        // get from 'videoEvents'
        const videoEvents = $hijack.events.videoEvents
        const VIDEO_EVENTNAME = videoEvents.eventName
        if (VIDEO_EVENTNAME.includes(eventName) || event.currentTarget.tagName === 'video') {
            return videoEvents
        }

        // get from 'rawEvents'
        let arr = $hijack.events.rawEvents[eventName] || null
        if (arr) {
            let currentTarget = event.currentTarget
            let key = event.key
            let obj = arr.find((el, i) => {
                return $hijack.getThis(el['this']) === currentTarget && (el.key ? el.key === key : true)
            })
            return obj || null
        }
        return null
    }
}
let $init = {
    setDocumentTitleToVideoTitle() {
        let ele_title = document.querySelector('.video-title') || document.querySelector('j-panel-title h1')
        ele_title && (document.title = ele_title.innerHTML)
    },
    disableWatermark() {
        let style = document.createElement('style')
        style.innerText = `
        #xdml-video-watermark{display:none;}
        `.trim()
        document.head.appendChild(style)
    },
    videoAutoPlay() {
        if (VIDEO_AUTOPLAY) {
            let ele_playButton = document.querySelector('.vjs-big-play-button')
            ele_playButton && ele_playButton.click()
            if (AUTO_FULLWINDOW) {
                let ele_fullWin = document.querySelector('.video-js-fullwindow-button')
                ele_fullWin && ele_fullWin.click()
            }
        }
    },
    /**
     * control + option + arrowRight = next video
     */
    createNewHotkeys() {
        // control + option + arrowRight = next video
        window.addEventListener('keydown', (e) => {
            let nodeList = document.querySelectorAll('.task-name')
            let length = nodeList.length
            let span_nextTask = nodeList[length - 1]
            if (span_nextTask && e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
                span_nextTask.click()
            }
        })
    },
    hijackOriginalHotkeys() {
        const OLD_ADD_EL = EventTarget.prototype.addEventListener
        EventTarget.prototype.addEventListener = function (eventName, fn, ...args) {
            if (EVENTS_DISABLE.includes(eventName)) {
                return
            }

            // worker inject error. `worker.addEventListener('message',fn)`
            if (this instanceof Worker) {
                OLD_ADD_EL.call(this, eventName, fn, ...args)
                return
            }

            OLD_ADD_EL.call(this, eventName, function foo(event) {
                if (DEBUG_EVENT && event.type === 'keydown' && event.key === 'ArrowRight' /* && event.currentTarget === video*/) {
                    debugger
                }

                $hijack.trigger(event)
                !$hijack.isDisable(event) && fn.call(this, event)
                $hijack.triggerAfter(event)
            }, ...args)
        }
    }
}

// init
window.onload = () => {
    setTimeout(() => { // wait for xhr done
        $init.setDocumentTitleToVideoTitle()
        $init.videoAutoPlay()
    }, 2000)

    $init.disableWatermark()
    $init.createNewHotkeys()
    $init.hijackOriginalHotkeys()
}