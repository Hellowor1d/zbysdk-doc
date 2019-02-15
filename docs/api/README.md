---
sidebar: auto
---

# SDK 提供的功能

<Bit/>


## 全局配置

### setConfig
- 功能描述: 配置一些基础参数，如是否需要 `SDK` 输出 `console` 信息，一般在开发模式下比较方便查看 `SDK` 反馈的一些过程信息，以及是否需要开启 `https` , 开发 or 生产环境等
- 类型: `setConfig( config : object ) : void`
  
- 示例及参数说明
```js
import ZBY from 'zby-live-sdk'

ZBY.setConfig({
    //配置环境、log、https 等开关
    weblog : false, // boolean, 开启或关闭 console 记录, 默认 false
    isHttps: false, // boolean, 设置 SDK 网络请求是否使用 https , 默认 false
    env    : 'test' // string ['test' | 'online'] 开发调均使用'test',生产环境设置 'online ', 默认 test
})
```
::: tip
全局配置功能应当在 `SDK` 初始化 `init` 之前进行调用，才能确保初始化后使用设定好的配置项
:::

## 设备检测

### deviceCheckerInit 

- 功能描述：一种需要进行设备检测时所调用的初始化方法，区别于 `init` 方法, 该方法调用之后，可以使用的 SDK 能力有限，可以获取设备列表，开关摄像头、麦克风、扬声器等方法，但还不能实现推流和拉流
  
- 类型: `deviceCheckerInit(cb: function, extension: object) : Promise`
  
::: tip
注意，该方法调用完毕之后，返回的是一个 Promise 对象，`SDK` 初始化需要对当前电脑设备底层进行一些操作，如摄像头、麦克风等的初始化等属于异步操作，返回 Promise 对象是为了方便你在当前动作执行完毕后，再进行下一步操作。参考 `async await` 用法
:::
- 示例及参数说明:
```js
//定义一个用来处理设备检测阶段 SDK 通知消息的回调函数
function dealWithSDKMsg(obj:{type:string, data:object}){
    //接收到的 obj 为一个消息对象，包含消息类型 type，和数据 data  
}
const extension = {
    //TODO - 更新 extension 依靠 SDK 检测后获取
    //目前可以先按照如下方式传递参数
    version: {
    rtc : '1.0.0.0',
    zego: '1.0.0.0',
    tool: '1.0.0.0'
    }
}
ZBY.deviceCheckerInit(dealWithSDKMsg, extension)
```
对于上面例子中 `dealWithSDKMsg` (当然也可以是自定义的其他函数名) 方法接收到的 `obj` 参数，根据不同的检测动作，会收到不同的事件回调，列举如下：
```js
//麦克风检测
{
    type: 'real_time_mic_volume', //实时麦克风音量
    data: {
            volume // Number，实时麦克风音量大小，范围为 [0, 100]
            }
}

//设备检测出错
{
    type: 'device_error', //设备检测出现问题
    data: {
        deviceType, // string，出现问题的设备类型，'microphone'|'camera'
        useDeviceId: deviceId, // string，当前使用的设备 id (以实际接收到的内容为准)
        useDeviceName: deviceName, // string，当前使用的设备名称
        deviceList: speakerData // array，当前的设备列表 (以实际接收到的内容为准)
    }
}

//热插拔
{
    type: 'plug_and_unplug', //当前有新设备插入或已有设备拔出
    data: {
            deviceType, // string，设备类型，'microphone'|'camera'
            useDeviceId: deviceId, // string，插拔后，当前使用的设备 id
            useDeviceName: deviceName, // string，插拔后，当前使用的设备名称
            deviceList: speakerData // array，插拔后，当前的设备列表
        }
}
```
