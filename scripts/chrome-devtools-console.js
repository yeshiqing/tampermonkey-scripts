// ==UserScript==
// @name           Chrome DevTools console
// @description    "console.log()" and "console.dir()" faster in the DevTools of Chrome
// @author         yeshiqing
// @license        MIT
// @run-at         document-idle
// @match          *://*/*
// @grant          none
// @version        0.0.9
// @namespace      https://github.com/yeshiqing/tampermonkey-scripts
// @icon           https://upload-images.jianshu.io/upload_images/1231311-26b5e3552753c5bb.png
// ==/UserScript==

// utils
let $utils = {
    defineProperty(obj, prop, getFn) {
        if (!obj.hasOwnProperty(prop)) {
            Object.defineProperty(obj, prop, {
                "configurable": true,
                "enumerable": false,
                "writable": true,
                "value": getFn
            })
        }
    },
    /**
     * @param {Array} domains
     */
    checkDomainIncluded(domains) {
        if (!Array.isArray(domains)) {
            throw new Error('domains is not array')
        }
        let flag = false
        for (let host of domains) {
            if (window.location.host.includes(host)) {
                flag = true
                break
            }
        }
        return flag
    }
}



let chromeDevTools = {
    generate_console(...props) {
        props.forEach((prop, i) => {
            $utils.defineProperty(window, prop, function (...args) {
                console[prop](...args)
            })
        })
    },
    _getInject() {
        const exclude_domain_contains = [
            "bilibili.com" /** */
        ]

        let inject = true
        for (let host of exclude_domain_contains) {
            if (window.location.host.includes(host)) {
                inject = false
                break
            }
        }
        return inject
    },
    inject_objectPrototype(props) {
        props.forEach((item) => {
            let { prop, value, options } = item
            if (options.domainsExcluded && $utils.checkDomainIncluded(options.domainsExcluded)) {
                return
            }

            if (options.domainsDelay && $utils.checkDomainIncluded(options.domainsDelay)) {
                setTimeout(() => {
                    $utils.defineProperty(Object.prototype, prop, value)
                }, options.delay)
            } else {
                $utils.defineProperty(Object.prototype, prop, value)
            }
        })
    }
}



// init
chromeDevTools.generate_console('log', 'dir')
chromeDevTools.inject_objectPrototype([{
    "prop": 'log',
    "value": function logCustom() { console.log(this) },
    "options": {
        domainsExcluded: [
            "bilibili.com" // "search.bilibili.com, 'log' property conflicts for the unknown reason"
        ]
    }
}, {
    "prop": 'dir',
    "value": function dirCustom() { console.dir(this) },
    "options": {
        domainsDelay: [
            "juejin.cn" // "应对“掘金”主页，对象存在重名键 dir"
        ],
        delay: 1000
    }
}])