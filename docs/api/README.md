---
sidebar: auto
---

# SDK 提供的功能

<Bit/>


## 全局配置

### setConfig
- 类型: `setConfig( config : Object ) : void`
  
- 示例及参数说明
```js
import ZBY from 'zby-live-sdk'

ZBY.setConfig({
    //配置环境、log、https 等开关
    weblog, // Boolean, 开启或关闭 console 记录, 默认关闭
    isHttps,// Boolean, 设置 SDK 网络请求是否使用 https , 默认 http
    env     // String ['test' | 'online'] 开发调均使用'test',生产环境设置 'online ', 默认 test
})
```
::: tip
全局配置功能应当在初始化 init 之前进行调用，才能确保初始化后使用设定好的配置项

