// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        0.0.7
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

/**
 * *_DISABLE 表示禁用原有事件
 * *_HIJACK 表示劫持原事件，插入 hook
 */
const IGNOREEVENTS = ['mousemove', 'mouseenter', 'mouseleave', 'mouseover'] // 用于研究事件劫持 // ['mousedown']
const TRIGGER_WEBPACKJSONP_API = true      // 调用饥人谷提供的 webpackJsonp API
const VOLUME_ADJUST_ARROWKEY_DOWN = 3      // 左右方向键调整视频快进快退的粒度
const ESCAPE_KEYUP_HIJACK = true           // escape keyup 加入 hook
const VIDEO_DBLCLICK_DISABLE = true        // 禁用视频原有的双击事件，即取消切换「全屏」。I don't use fullscreen and it may unintentionally be triggered when toggle application.
const VIDEO_CLICK_DISABLE = false          // 用于调试，不触发源代码中的函数。按快捷键前需要点击一下聚焦 video。
const CMD_KEYDOWN_DISABLE = false
const F_KEYUP_HIJACK = true
const F_KEYUP_DISABLE = true
const AUTO_FULLWINDOW = false              // 自动「网页全屏」
const LOG_VIDEO_STATUS = false
const VIDEO_AUTOPLAY = true
const DEBUG_EVENT = false

const EVENTS_CONFIG = {
    'keyup': [{
        'eventName': 'keyup',
        'key': 'Escape',
        'this': document,
        'fn': 'pauseVideo',
        'hijack': ESCAPE_KEYUP_HIJACK, // 是否插入 hook
        'disable': false         // 是否禁用原有事件处理程序
    }, {
            'eventName': 'keyup',
            'key': 'f',
            'this': document,
            'fn': 'websiteScreen',
            'hijack': F_KEYUP_HIJACK,
            'disable': F_KEYUP_DISABLE
        }],
    'keydown': [{
        'eventName': 'keydown',
        'key': 'Meta',
        'this': document,
        'disable': CMD_KEYDOWN_DISABLE
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
    }]
}

window.onload = () => {
    setTimeout(() => { // wait for xhr done
        let ele_title = document.querySelector('.video-title') || document.querySelector('j-panel-title h1')
        ele_title && (document.title = ele_title.innerHTML)

        // video auto play
        if (VIDEO_AUTOPLAY) {
            let ele_playButton = document.querySelector('.vjs-big-play-button')
            ele_playButton && ele_playButton.click()
            if (AUTO_FULLWINDOW) {
                let ele_fullWin = document.querySelector('.video-js-fullwindow-button')
                ele_fullWin && ele_fullWin.click()
            }
        }
    }, 2000)
}


// control + option + arrowRight = next video
window.addEventListener('keydown', (e) => {
    let nodeList = document.querySelectorAll('.task-name')
    let length = nodeList.length
    let span_nextTask = nodeList[length - 1]
    if (span_nextTask && e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
        span_nextTask.click()
    }
})

var video = document.querySelector('video')
let video_status = 'loadedmetadata' // loadedmetadata playing play waiting pause ended 
let $hijack = {
    events: EVENTS_CONFIG,
    videoEvents: {
        'eventName': ['playing', 'play', 'waiting', 'pause', 'ended', 'loadedmetadata'],
        'key': null,
        'this': 'video', // 没有用到，用到需要转化成对象
        'fn': 'setVideoStatus',
        'hijack': true,
        'disable': false
    },
    // 切换「网页全屏」
    'websiteScreen'(event) {
        document.dispatchEvent(new CustomEvent("videoToggleFullWindow"))
    },
    'pauseVideo'(event) {
        // 停止播放
        setTimeout(() => { // 应对异步操作：UI 更新
            let btn = document.querySelector('.vjs-play-control.vjs-button')
            if (btn) {
                video.click()
            }
        }, 0)
    },
    'setVideoStatus'(event) {
        video_status = event.type
        LOG_VIDEO_STATUS && console.log(video_status);
    },
    /**
     * @return {boolean} 是否拦截原事件处理程序
     */
    trigger(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { disable, hijack } = obj
            disable = (typeof disable === 'boolean' ? disable : false) // 默认 disable 为 false
            hijack = (typeof hijack === 'boolean' ? hijack : false) // 默认 hijack 为 false

            hijack && ($hijack[obj.fn] || function (e) { })(event)

            return disable
        }
        return false
    },
    getThis(selector) {
        if (selector instanceof Object) {
            return selector
        } else if (typeof selector === 'string') {
            return document.querySelector(selector)
        }
        console.error("can't find the specified element")
        return window
    },
    getEvent(event) {
        let eventName = event.type
        const videoEvents = $hijack.videoEvents
        const VIDEO_EVENTNAME = videoEvents.eventName
        if (VIDEO_EVENTNAME.includes(eventName)) {
            return videoEvents
        }

        let arr = $hijack.events[eventName] || null
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
const GLOBAL = {
    Ft: null // Ft 对象位于 show-pc 文件 2948 行，它有很多方法，比如控制 video 的 Ft.play() Ft.pause() Ft.exitFullscreen() Ft.requestFullscreen()
}
const OLD_ADD_EL = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = function (eventName, fn, ...args) {
    if (IGNOREEVENTS.includes(eventName)) {
        return
    }

    // worker inject error. worker.addEventListener('message',fn) 
    if (this instanceof Worker) {
        OLD_ADD_EL.call(this, eventName, fn, ...args)
        return
    }

    OLD_ADD_EL.call(this, eventName, function foo(event) {

        if (DEBUG_EVENT && event.type === 'click' && event.currentTarget === video) {
            // debugger
        }

        if ($hijack.trigger(event)) {
            return
        }

        fn.call(this, event)
    }, ...args)
}

// use jirengu webpackJsonp API
{
    const DIGIT_RANDOM = Date.now();
    const ID3145 = Number('' + 3145 + DIGIT_RANDOM) // override ArrowRight & ArrowLeft hotkeys
    const start_arr = TRIGGER_WEBPACKJSONP_API ? [ID3145, DIGIT_RANDOM] : []
    let exportGlobal = function (Ft) {
        GLOBAL.Ft = GLOBAL.Ft || Ft // 利用 webpackJsonp API 导出 Ft
    }
    window.webpackJsonp([], {
        [DIGIT_RANDOM]: function () {
            console.log(arguments);
        },
        [ID3145]: function (e, t, n) {
            "use strict";
            var i = n(114)
                , r = n.n(i)
                , a = n(220)
                , s = n(619)
                , o = n(620)
                , u = {
                    " ": {
                        pressUp: function (Ft) {
                            exportGlobal(Ft)
                            Ft.paused() ? Ft.play() : Ft.pause()
                        },
                        longPressStart: function (e) {
                            e.paused() || o.a.explode({
                                newInstance: e
                            })
                        },
                        longPressEnd: function (e) {
                            e.paused() || o.a.resume()
                        }
                    },
                    // 进入/退出「全屏」模式
                    f: {
                        pressUp: function (Ft) {
                            exportGlobal(Ft)
                            return Ft.isFullscreen() ? Ft.exitFullscreen() : Ft.requestFullscreen()
                        }
                    },
                    ArrowLeft: {
                        pressDown: function (Ft) {
                            exportGlobal(Ft)
                            return Ft.currentTime(Ft.currentTime() - VOLUME_ADJUST_ARROWKEY_DOWN)
                        }
                    },
                    ArrowRight: {
                        pressDown: function (Ft) {
                            exportGlobal(Ft)
                            return Ft.currentTime(Ft.currentTime() + VOLUME_ADJUST_ARROWKEY_DOWN)
                        }
                    },
                    ArrowDown: {
                        pressDown: function (e) {
                            return e.volume(e.volume() < .1 ? 0 : e.volume() - .1)
                        }
                    },
                    ArrowUp: {
                        pressDown: function (e) {
                            return e.volume(e.volume() > .9 ? 1 : e.volume() + .1)
                        }
                    },
                    Escape: {
                        pressUp: function (Ft) {
                            exportGlobal(Ft)
                            return document.dispatchEvent(new CustomEvent("videoExitFullWindow"))
                        }
                    },
                    // 进入/退出「网页全屏」模式
                    w: {
                        pressUp: function (Ft) {
                            return document.dispatchEvent(new CustomEvent("videoToggleFullWindow"))
                        }
                    }
                };
            a.a.registerPlugin("keymapping", function () {
                var e = this
                    , t = new s.a;
                Object.entries(u).forEach(function (n) {
                    var i = r()(n, 2)
                        , a = i[0]
                        , s = i[1];
                    Object.entries(s).forEach(function (n) {
                        var i = r()(n, 2)
                            , s = i[0]
                            , o = i[1];
                        t.register(a, s, function (t) {
                            o(e)
                        })
                    })
                });
                t.listen();
                document.addEventListener("onQuestionFormDialogToggle", function (e) {
                    e.detail ? t.pause() : t.listen()
                });
            })
        }
    }, start_arr)
}