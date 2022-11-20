// ==UserScript==
// @name           jirengu video hotkeys
// @description    Control+Option+ArrowRight = next video
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          https://xiedaimala.com/tasks/*
// @match          https://jirengu.com/tasks/*
// @grant          none
// @version        0.0.4
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

const VIDEO_AUTOPLAY = true
const VOLUME_ADJUST_ARROWKEY_DOWN = 3
const IGNOREEVENTS = ['mousemove', 'mouseenter', 'mouseleave', 'mouseover'] // 用于研究事件劫持 // ['mousedown']
const DEBUG_MODE = true
const ESCAPE_HIJACK = true
const VIDEO_CLICK_DISABLE = false
const EVENTS_CONFIG = {

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

// disable double click to fullscreen. I don't use fullscreen and it may unintentionally be triggered when toggle application.
let video = document.querySelector('video')
video && video.addEventListener('dblclick', (e) => {
    e.stopImmediatePropagation()
}, true)

let $hijack = {
    events: {
        'keyup': [{
            'eventName': 'keyup',
            'key': 'Escape',
            'this': document,
            'fn': 'keyup-Escape-document',
            'hijack': ESCAPE_HIJACK,
            'disable': false
        }],
        'click': [{
            'eventName': 'click',
            'key': null,
            'this': video,
            'fn': 'click-video',
            'disable': VIDEO_CLICK_DISABLE
        }]
    },
    'keyup-Escape-document'(event) {
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
            (hijack || disable) && fn(event)

            return disable
        }
        return false
    },
    getEvent(event) {
        let arr = $hijack._getEventsArr(event)
        if (arr) {
            return $hijack._getEvent(event, arr)
        }
        return null
    },
    _getEvent(event, arr) {
        let currentTarget = event.currentTarget
        let key = event.key
        let obj = arr.find((el, i) => {
            return el['this'] === currentTarget && (el[key] ? el[key] === key : true)
        })
        return obj || null
    },
    _getEventsArr(event) {
        let eventName = event.type
        return $hijack.events[eventName] || null
    },
    getFn(event) {
        let arr = $hijack._getEventsArr(event)
        if (arr) {
            let obj = $hijack._getEvent(event, arr)
            if (obj) {
                return $hijack[obj.fn]
            } else {
                return function () { }
            }
        }
        return function () { }
    },
    has(event) {
        let eventName = event.type
        let currentTarget = event.currentTarget
        let key = event.key
        let arr = $hijack.events[eventName]
        if (arr) {
            return !!(arr.find((el, i) => {
                return el['this'] === currentTarget && (el[key] ? el[key] === key : true)
            }))
        }
        return false
    }
}

let video_status = 'loadedmetadata' // loadedmetadata playing play waiting pause ended
let setVideoStatus = function (event) {
    const VIDEO_EVENTNAME = ['playing', 'play', 'waiting', 'pause', 'ended', 'loadedmetadata']
    let eventName = event.type
    VIDEO_EVENTNAME.includes(eventName) && (video_status = eventName)
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
        setVideoStatus(event)

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
                }),
                    t.listen(),
                    document.addEventListener("onQuestionFormDialogToggle", function (e) {
                        e.detail ? t.pause() : t.listen()
                    })
            })
        }
    }, [ID3145])
}