// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        0.0.5
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

const VIDEO_AUTOPLAY = true
const VOLUME_ADJUST_ARROWKEY_DOWN = 3
const IGNOREEVENTS = ['mousemove', 'mouseenter', 'mouseleave', 'mouseover'] // 用于研究事件劫持 // ['mousedown']
const DEBUG_MODE = true
const LOG_VIDEO_STATUS = false
const VIDEO_DBLCLICK_DISABLE = true        // disable double click to fullscreen. I don't use fullscreen and it may unintentionally be triggered when toggle application.
const ESCAPE_KEYUP_HIJACK = true           // escape keyup 加入 hook
const VIDEO_CLICK_DISABLE = false          // 禁用单击视频事件
const TRIGGER_WEBPACKJSONP_API = true      // 调用饥人谷提供的 webpackJsonp API

const EVENTS_CONFIG = {
    'keyup': [{
        'eventName': 'keyup',
        'key': 'Escape',
        'this': document,
        'fn': 'pauseVideo',
        'hijack': ESCAPE_KEYUP_HIJACK, // 是否插入 hook
        'disable': false         // 是否禁用原有事件处理程序
    }],
    'click': [{
        'eventName': 'click',
        'key': null,
        'this': video,
        'fn': 'click-video',
        'hijack': true,
        'disable': VIDEO_CLICK_DISABLE
    }],
    'dblclick': [{
        'eventName': 'dblclick',
        'key': null,
        'this': 'video',
        'fn': 'video-dblclick-disable',
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
            if (!DEBUG_MODE) {
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
    if (span_nextTask) {
        if (e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
            span_nextTask.click()
        }
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
    'pauseVideo'(event) {
        // 停止播放
        setTimeout(() => { // 应对异步操作：UI 更新
            let btn = document.querySelector('.vjs-play-control.vjs-button')
            if (btn) {
                video.click()
            }
        }, 0)
    },
    'click-video'(event) {
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
            hijack = (typeof hijack === 'boolean' ? hijack : true) // 默认 hijack 为 true
            let fn = $hijack[obj.fn] || function (e) { };
            hijack && fn(event)

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
        return null
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
                return $hijack.getThis(el['this']) === currentTarget && (el[key] ? el[key] === key : true)
            })
            return obj || null
        }
        return null
    }
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
    const start_arr = TRIGGER_WEBPACKJSONP_API ? [ID3145] : []
    window.webpackJsonp([], {
        [ID3145]: function (e, t, n) {
            "use strict";
            var i = n(114)
                , r = n.n(i)
                , a = n(220)
                , s = n(619)
                , o = n(620)
                , u = {
                    " ": {
                        pressUp: function (e) {
                            e.paused() ? e.play() : e.pause()
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
                    f: {
                        pressUp: function (e) {
                            return e.isFullscreen() ? e.exitFullscreen() : e.requestFullscreen()
                        }
                    },
                    ArrowLeft: {
                        pressDown: function (e) {
                            return e.currentTime(e.currentTime() - VOLUME_ADJUST_ARROWKEY_DOWN)
                        }
                    },
                    ArrowRight: {
                        pressDown: function (e) {
                            return e.currentTime(e.currentTime() + VOLUME_ADJUST_ARROWKEY_DOWN)
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
                        pressUp: function (e) {
                            return document.dispatchEvent(new CustomEvent("videoExitFullWindow"))
                        }
                    },
                    w: {
                        pressUp: function (e) {
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