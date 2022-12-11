本脚本适用于 Chrome 开发者工具（DevTools）

目前提供的功能：

- `log()` 全局函数代替 `console.log()`
- `dir()` 全局函数代替 `console.dir()`
- 对象类型的数据增加 `log()` 方法
- 对象类型的数据增加 `dir()` 方法
  ```js
  let obj = {foo: 'foo'}
  obj.log() // {foo: 'foo'}
  obj.dir() // {foo: 'foo'}
  ```

以上功能支持 Mac、Windows、Linux 系统。