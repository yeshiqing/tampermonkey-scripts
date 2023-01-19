## 一、缘起

本人正在饥人谷学前端。在学习平台的深度使用中发现一个不便之处，在全屏状态下看完了某节课视频，想要继续看下一课视频，需要按 `esc` 退出全屏，然后点击视频右下角的 `下一节: xxx`。于是引发写一个油猴脚本对一些操作进行自定义。

## 二、网站默认提供的快捷键
| 功能                 | 按键       |
| -------------------- | ---------- |
| 播放/暂停            | 空格       |
| 3 倍速播放           | (按住)空格 |
| 切换「全屏」模式     | f          |
| 切换「网页全屏」模式 | w          |
| 退出全屏             | esc        |
| 快退 10 秒           | 左方向键   |
| 快进 10 秒           | 右方向键   |
| 音量降低 10%         | 下方向键   |
| 音量提高 10%         | 上方向键   |

## 三、本插件提供的配置项
| 字段                                 | 功能描述                                                     |
| :----------------------------------- | ------------------------------------------------------------ |
| `CUSTOM_EVENTS_CONFIG`               | Control + Option/Alt + ArrowRight 跳到下一节                 |
| `VOLUME_ADJUST_ARROWKEY_DOWN`        | 左右方向键调整视频快进快退的粒度，以秒为单位。               |
| `AUTO_FULLSCREEN`                    | 是否自动全屏                                                 |
| `AUTO_FULLSCREEN_MODE_WEBSITESCREEN` | 自动全屏是否采用「网页全屏」模式                             |
| `VIDEO_AUTOPLAY`                     | 视频是否自动播放                                             |
| `SHOW_VIDEO_TITLE`                   | 浏览器标签页的标题是否显示为视频标题。<br />便于「网页全屏」状态下，查看本节课主旨。 |
| `F_KEYUP_SWITCH_WEBSITESCREEN`       | f keyup 事件是否触发切换「网页全屏」。若为 false 则事件触发时切换「全屏」。 |
| `ESCAPE_KEYUP_PAUSE_VIDEO`           | esc keyup 事件触发退出全屏后，是否暂停播放。若为 false 则事件触发退出全屏后，保持原有播放状态。 |
| `VIDEO_DBLCLICK_DISABLE`             | 是否禁用视频原有的鼠标双击事件。<br />原有双击事件会切换「全屏」模式。当切换应用时会误触发双击事件，导致切换至「全屏」模式，而个人喜欢「网页全屏」模式。 |
| `VOLUMN_BTN_MOUSEOVER_DISABLE`       | 是否禁用音量调节按钮的 mouseover 事件。<br />禁用 mouseover 会使得鼠标悬浮到音量键上方时不显示音量，这样做的好处是当想精细调节进度时，滑动鼠标到进度条开头部分，不会误触发音量调节，属于个人喜好，我一般用键盘的音量键调节音量。 |

**配置项说明：**

- 为什么屏蔽视频的双击事件？  
    考虑这样的应用场景：做项目抄代码时，本人常使用「网页全屏」，而非「全屏」，并且经常在编辑器和浏览器之间切换应用。问题在于，当从编辑器切换到浏览器时，需要点两下才能继续播放视频，第一次聚焦浏览器窗口，第二次才真正触发播放。那么当这两下点击间隔过短，就会触发「全屏」，而这是我不想要的，所以屏蔽视频的双击事件。
- 为什么要自由调整左右方向键快进快退的粒度？  
    原因：方方老师语速较快，10s 的回退间距太大了，回退之后已经不是在说这个事而是在说上一个事了。

**其他说明：**

- 以上功能支持 Mac、Windows、Linux 系统，仅限 PC 端。

- 本油猴脚本不窃取用户隐私数据，可放心使用。

## 四、如何安装

1. 首先在浏览器中安装用户脚本管理器  
    - Chrome：[Tampermonkey 插件](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    - Microsoft Edge：[Tampermonkey 插件](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    - 其他浏览器：[Greasy Fork 官网教程](https://greasyfork.org/en/help/installing-user-scripts)
2. 访问提供用户脚本的网站 [jirengu video hotkeys | Greasy Fork](https://greasyfork.org/en/scripts/454346-jirengu-video-hotkeys)，安装脚本。