// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        0.0.10
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

// ==用户可修改的配置项==
// *_DISABLE 表示禁用原有事件
// *_HIJACK 表示劫持原事件，插入 hook
const VOLUME_ADJUST_ARROWKEY_DOWN = 4      // 左右方向键调整视频快进快退的粒度
const VIDEO_DBLCLICK_DISABLE = true        // 禁用视频原有的鼠标双击切换「全屏」。当切换应用时会误触发切换至「全屏」。
const F_KEYUP_HIJACK_AFTER = true          // 按 f 键，切换「网页全屏」。
const AUTO_FULLWINDOW = true               // 视频是否自动「网页全屏」
const VIDEO_AUTOPLAY = true                // 视频是否自动播放
// ==/用户可修改的配置项==

// ==Config For Development==
const DEBUG_EVENT = false
const EVENTS_DISABLE = ['mousemove', 'mouseenter', 'mouseleave', 'mouseover'] // 禁用事件，根本不绑定这些事件
const CMD_KEYDOWN_DISABLE = false
const ESCAPE_KEYUP_HIJACK_AFTER = true     // escape keyup 在原事件之后加入 hook
const TRIGGER_WEBPACKJSONP_API = true      // 调用饥人谷提供的 webpackJsonp API
const VIDEO_CLICK_DISABLE = false          // 用于调试，不触发源代码中与 video click 事件相关的函数。按快捷键前需要点击一下聚焦 video。
const LOG_VIDEO_STATUS = false
const EVENTS_CONFIG = {
    'rawEvents': {
        'keyup': [{
            'eventName': 'keyup',
            'key': 'Escape', 
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
                'fnAfter': 'websiteScreen',
                'hijackAfter': F_KEYUP_HIJACK_AFTER,
                'disable': true
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

window.onload = () => {
    setTimeout(() => { // wait for xhr done
        $init.getVideoTitle()
        $init.videoAutoPlay()
    }, 2000)

    $init.disableWatermark()
}

let $init = {
    getVideoTitle() {
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
    }
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

const GLOBAL = {
    Ft: null // 饥人谷原始代码中的 Ft 对象位于 show-pc 文件 2948 行，它有很多方法，比如控制 video 的 Ft.play() Ft.pause() Ft.exitFullscreen() Ft.requestFullscreen()
}
var video = document.querySelector('video')
let video_status = 'loadedmetadata' // loadedmetadata playing play waiting pause ended 
let $eventsHandler = {
    simulate_keyupEscape() {
        const event = new KeyboardEvent('keyup', {
            key: "Escape",
            view: window,
            bubbles: true,
            cancelable: true
        })
        document.dispatchEvent(event);
    },
    /**
     * 是否网页全屏 
     */
    isWebsiteScreen() {
        let elm = document.querySelector('.video-wrapper')
        return elm && elm.matches('.fullWindow')
    },
    // 切换「网页全屏」
    websiteScreen(event) {
        if ($eventsHandler.isWebsiteScreen()) {
            $eventsHandler.simulate_keyupEscape()
        } else {
            document.dispatchEvent(new CustomEvent("videoToggleFullWindow"))
        }
    },
    // 停止播放
    pauseVideo(event) {
        ($eventsHandler.isWebsiteScreen()) && GLOBAL.Ft && GLOBAL.Ft.pause()
    },
    setVideoStatus(event) {
        video_status = event.type
        LOG_VIDEO_STATUS && console.log(video_status);
    }
}
let $hijack = {
    events: EVENTS_CONFIG,
    /**
     * 在原本事件之前触发的 hook
     * @return {boolean} 是否拦截原事件处理程序
     */
    trigger(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { disable, hijack } = obj
            disable = (typeof disable === 'boolean' ? disable : false) // 默认 disable 为 false
            hijack = (typeof hijack === 'boolean' ? hijack : false) // 默认 hijack 为 false

            hijack && ($eventsHandler[obj.fn] || function (e) { })(event)

            return disable
        }
        return false
    },
    /**
     * 在原本事件之后触发的 hook
     */
    triggerAfter(event) {
        let obj = $hijack.getEvent(event)
        if (obj) {
            let { hijackAfter } = obj
            hijackAfter = (typeof hijackAfter === 'boolean' ? hijackAfter : false) // 默认 hijackAfter 为 false

            hijackAfter && ($eventsHandler[obj.fnAfter] || function (e) { })(event)

        }
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
        const videoEvents = $hijack.events.videoEvents
        const VIDEO_EVENTNAME = videoEvents.eventName
        if (VIDEO_EVENTNAME.includes(eventName) || event.currentTarget.tagName === 'video') {
            return videoEvents
        }

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

const OLD_ADD_EL = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = function (eventName, fn, ...args) {
    if (EVENTS_DISABLE.includes(eventName)) {
        return
    }

    // worker inject error. worker.addEventListener('message',fn) 
    if (this instanceof Worker) {
        OLD_ADD_EL.call(this, eventName, fn, ...args)
        return
    }

    OLD_ADD_EL.call(this, eventName, function foo(event) {

        if (DEBUG_EVENT && event.type === 'keyup' && event.key === 'f' /* && event.currentTarget === video*/) {
            // debugger
        }

        if (!$hijack.trigger(event)) {
            fn.call(this, event)
        }

        $hijack.triggerAfter(event)
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
    try {
        window.webpackJsonp([], {
            [DIGIT_RANDOM]: function () {
                // console.log(arguments);
            },
            [ID3145]: function (e, t, n) {
                "use strict";
                var i = n(114)
                    , r = n.n(i)
                    , a = n(220)
                    , s = n(621) // 官网更新代码时，需要变更
                    , o = n(622) // 官网更新代码时，需要变更
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
    } catch (error) {
        console.log(error);
    }

}