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

#### 获取 SDK 版本相关信息
```js

ZBY.version   //string, zby-live-sdk 版本信息，如： '1.0.0.0'

ZBY.extensionVersion //object , zby-live-sdk 所依赖的扩展版本信息
// {
//     rtc: '1.0.0.0',
//     zego: '1.0.0.0'
// }
```

## 设备检测
### deviceCheckerInit 

- 功能描述：一种需要进行设备检测时所调用的初始化方法，区别于 `init` 方法, 该方法调用之后，可以使用的 SDK 能力有限，可以获取设备列表，开关摄像头、麦克风、扬声器等方法，但还不能实现推流和拉流
  
- 类型: `deviceCheckerInit(cb: function, extension: object) : Promise`
  
::: tip
注意，该方法调用完毕之后，返回的是一个 Promise 对象，`SDK` 初始化需要对当前电脑设备底层进行一些操作，如摄像头、麦克风等的初始化等属于异步操作，返回 Promise 对象是为了方便你在当前动作执行完毕后，再进行下一步操作。参考 `async await` 用法。
:::
`deviceCheckerInit`方法是专为设备检测进行的初始化，调用之后，可以使用和硬件设备相关的一些方法：
```js
* getCameraDeviceList() : Promise // 获取摄像头列表
* setCameraDevice(deviceId: string) : Promise // 指定摄像头
* openOrCloseCamera(operation: boolean) : Promise // 开/关摄像头
* openMicVolumeCb(open: boolean) : void // 开启/关闭麦克风音量回调
* getMicrophoneDeviceList() : Promise // 获取麦克风列表
* setMicrophoneDevice(deviceId: string) : Promise // 指定麦克风
* openOrCloseMicrophone(operation: boolean) : Promise // 开/禁麦
* getOrLocateVideo(args: object) : Promise // 获取视频 src 或者将视频绑定到某一个 <video> 标签上
* getSpeakerDeviceList() : Promise // 获取系统扬声器列表
* setSpeakerDevice(deviceId: string) : Promise // 指定系统扬声器
* getSpeakerVolume() : Promise  // 获取系统扬声器音量，返回 number
* setSpeakerVolume(volume: number) : Promise // 设置系统扬声器音量
``` 
关于上述方法的详细使用情况，请查看下文详情

- 示例及参数说明:
```js
//用来处理设备检测阶段 SDK 通知消息的回调函数
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
async function testDevices(){
    await ZBY.deviceCheckerInit(dealWithSDKMsg, extension)
    // ...待上步操作执行完毕，再进行后续操作
}
testDevices()
```
对于上面例子中 `dealWithSDKMsg` (当然也可以是自定义的其他函数名) 方法接收到的 `obj` 参数，根据不同的检测动作，会收到不同的事件回调，列举如下：
```js
//麦克风检测
{
    type: 'real_time_mic_volume', //实时麦克风音量，默认未开启，需要执行 openMicVolumeCb 开启麦克风音量回调
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

### openMicVolumeCb
- 功能描述：开启或关闭麦克风音量回调，控制是否接收 `real_time_mic_volume` 消息 
- 类型: `openMicVolumeCb(open: Boolean) : void`
- 示例及参数说明:
```js
ZBY.openMicVolumeCb(true) // 打开接收麦克风音量回调
```

## 初始化方法
### init
- 功能描述: SDK 的完全初始化方法，该方法执行完毕之后，所有 SDK 方法均可调用
- 类型: `init(options: object, dealSDKMsg: function) ：Promise`
- 示例及参数说明:
```js
//初始化所需要的参数对象
const options = {
  userId, // string | number,用户 id,必选
  sid, // string, 转录视频流所需要的推流目标 sid ,必选
  institutionId, // string | number,机构id,必选
  userName, // string,小组内用户名,必选
  role, // string,'teacher' | 'student',必选
  roomId, // string | number, 小组房间id,即组 id,必选
  teacherId, //string | number, 当前课程的老师 id,必选
  channelToken, // string,信道 token, 必选

  //以下为执行过设备检测后，需要指定设备进行初始化时才需要传递 devices 参数，如不需要指定，可以不传， SDK 会使用系统默认设备进行初始化
  devices: {
    camera, // string,摄像头设备 id,可选
    microphone, // string,麦克风设备 id,可选
    speaker // string,扬声器设备 id,可选
  },

  extension: { // object,扩展相关信息,必选
    version: {
      tool, // string,比如'1.0.0.0',必选
      rtc, // string,比如'1.0.0.0',必选
      zego // string,比如'1.0.0.0',必选
    }
  },
}

//用来处理设备检测阶段 SDK 通知消息的回调函数 [可以与设备检测时传递的回调函数相同]
function dealWithSDKMsg(obj:{type:string, data:object}){
    //接收到的 obj 为一个消息对象，包含消息类型 type，和数据 data  
        // obj格式如下：
        {
        type, // string，回调事件类型
        data // object，与回调事件对应的回调数据
        }
}

async function startToUseSDK(){
    await ZBY.init(options, dealWithSDKMsg) 
    // 之后可以进行开关摄像头、获取本地预览视频，推流等操作
}
startToUseSDK()
```
与设备检测时相同，`dealWithSDKMsg` 函数也会接收到`SDK`传递回来的多种消息：

1.通知 SDK 加载状态时，obj 数据结构:
```js
{   
    type: 'sdk_status',
    data:  //根据 SDK 所处的时机和状态不同，返回数据结构有不同, 一次消息只会存在以下情况的其中一种

        1.SDK初始化之前 [关联 API : init ]
        {
        sdk_type : //string ,当前准备加载的SDK类型
        status: 'before_init' //当前所状态：sdk初始化之前
        }

        2.SDK初始化完成 [关联 API : init ]
        {
        sdk_type：//string ,当前加载完成的SDK类型
        status: 'init_finished' //当前所状态：
        }

        3.切换SDK之前 [关联 API : changeSDK ]
        {
        sdk_type : //string ,当前正在使用的SDK类型
        target_sdk_type : //string ，目标SDK类型
        status:'before_sdk_change'
        }

        4.切换SDK完成 [关联 API : changeSDK ]
        {
        sdk_type： //string ,切换完成后的SDK类型
        status: 'sdk_changed'
        }

        5.卸载SDK完成 [关联 API : leaveRoom ]
        {
        sdk_type : //string ,被卸载的SDK类型
        status: 'uninstall_finished'
        }

        6. 开始执行切换小组之前（切换方法被调用，但还未真正执行切换动作）[关联 API : changeGroup ]
        {
        sdk_type: //string ,当前SDK类型
        target_room_id: // 目标房间ID( 小班课小组ID)
        status: 'before_room_change' //切换房间完成前
        }

        7.切换小组完成 （切换到新小组的信道和SDK类型，都已完毕）[关联 API : changeGroup ]
        {
        sdk_type : //string ,切换完成后的SDK类型,
        room_id : // 当前房间ID( 小班课小组ID)
        status:'room_changed' //切换房间已完成
        }
}
```
2.收到同组用户的消息通知时，obj 数据结构:
```js
 1.表示有人进入到和当前用户相同的音视频房间了（但此时还不能看到他的画面）
{
    type:'user_join',
    data:{
        userId : //Number, 进入用户的userId
        userName: //String, 进入用户的姓名
        role: //String，进入用户的角色（'teacher'|'student'）
        }
}

2.表示刚才进入房间的用户的，设备状态信息
{
    type:'device_status',
    data:{
        userId : //Number, 进入用户的userId
        userName: //String, 进入用户的姓名
        role: //String，进入用户的角色（'teacher'|'student'）
        deviceType：//String 有状态变更的设备类型（'video'|'camera' 表示对方的 摄像头状态，'audio'|'microPhone', 表示对方的 麦克风状态），
        deviceStatus：//String 设备开关状态 （'open' 开启| 'closed'关闭）
        }  
}

3.当 user_join 消息表示的用户本地推流成功后，会收到该消息
  表示该用户的视频画面，已经可以展示和观看
{
    type:'remote_video_ready',
    data:{
        userId : //Number, 进入用户的userId
        userName: //String, 进入用户的姓名
        role: //String，进入用户的角色（'teacher'|'student'）
        videoSrc : blobValue //表示一串blob形式的流地址, 使用blobValue, 赋值到 video标签的 src 属性中，即可展示观看）
        }
}

4.表示当前已经有用户在房间，对当前新进入房间用户的进行作出一次响应
{
    type:'user_response',
    data:{
        userId : //Number, 已在房间用户的userId
        userName: //String, 已在房间用户的姓名
        role: //String，已在房间用户的角色（'teacher'|'student'）
        }     
}

5.表示有用户离开当前房间
{
    type:'user_response',
    data:{
        userId : //Number, 已在房间用户的userId
        userName: //String, 已在房间用户的姓名
        role: //String，已在房间用户的角色（'teacher'|'student'）
        }     
}
```
3.本机用户接收到 SDK 主动通知的消息，obj 数据结构为:
```js
1.更新本地预览视频，在切换SDK完成之后，会重新调起本地摄像头，需要更新本地预览的画面
  [关联 API : changeSDK ]
{
    type: 'update_local_preview',
    data:{
        videoSrc :blobValue //表示一串blob流地址（使用blobValue,赋值到 video标签的 src 属性中，即可展示他人画面）
        }
}

2.超出最大可接收视频人数限制提醒
{
    type:'over_max_connect',
    data:{
    message: "service index over max "
    }
}

4.网络错误
{
    type:'network_error',
    data:{
        message: 'Network error'
        }
}

4.网络重连
{
    //TODO- network_reconnect
    type:'network_recovery',
    data:{
        //TODO- Network reconnect
        message: 'Network recovery'
        }
}

5.信道连接断开
{
    type:'channel_disconnect',
    data:{
        message: 'Channel disconnect'
        }
}

6.信道恢复连接
{
    type:'channel_disconnect',
    data:{
        message: 'Channel reconnect'
        }
}
```
4.设备相关信息通知，obj 数据结构为:
```js
1.麦克风检测
{
    type: 'real_time_mic_volume', //实时麦克风音量，默认未开启，需要执行 openMicVolumeCb 开启麦克风音量回调
    data: {
            volume // Number，实时麦克风音量大小，范围为 [0, 100]
            }
}

2.设备检测出错
{
    type: 'device_error', //设备检测出现问题
    data: {
        deviceType, // string，出现问题的设备类型，'microphone'|'camera'
        useDeviceId: deviceId, // string，当前使用的设备 id (以实际接收到的内容为准)
        useDeviceName: deviceName, // string，当前使用的设备名称
        deviceList: speakerData // array，当前的设备列表 (以实际接收到的内容为准)
    }
}

3.热插拔
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
5.推拉流质量相关信息通知，obj 数据结构为：
```js
1.推流质量
{
    type:'push_quality',
    data:{
            video: {
            bitrate, // Number，画面码率
            fps // Number，画面帧率
            }
        }
}

2.拉流质量
{
    type:'pull_quality',
    data:{
            video: {
            bitrate, // Number，画面码率
            fps, // Number，画面帧率
            userId, // Number，用户 id
            streamId, // String，流 id
            volume, // Number，音量
            realTimeVolume // Number，真实的实时音量
            }
        }
}
```

## 退出教室
### leaveRoom
- 功能说明: 退出教室，停止 SDK 提供的各种功能，如音视频推拉流等
- 类型: `leaveRoom() : Promise`
- 示例:
```js
    await ZBY.leaveRoom()
```

## 设备相关
### getCameraDeviceList
- 功能说明: 获取当前电脑上的摄像头列表
- 类型: `getCameraDeviceList() ：Promise`
### getMicrophoneDeviceList
- 功能说明: 获取当前电脑上的麦克风/话筒列表
- 类型: `getMicrophoneDeviceList() ：Promise`
### getSpeakerDeviceList
- 功能说明: 获取当前电脑上的扬声器/音箱/耳机列表
- 类型: `getSpeakerDeviceList() ：Promise`
- 示例及参数说明:
```js
    async function getDeviceList{

    const cameraList = await ZBY.getCameraDeviceList() // Array
    const microPhoneList = await ZBY.getMicrophoneDeviceList() // Array
    const speakerList = await ZBY.getSpeakerDeviceList() // Array
        //List 数据结构
        [
            {
            deviceId, // String，设备 id
            deviceName, // String，设备名称
            isDefault // Boolean，是否为系统默认设备，建议选择系统默认设备进行上课
            }
        ]
    }
```

### setCameraDevice
- 功能说明: 从`getCameraDeviceList`获取到的摄像头设备信息中，设定上课想要使用的具体摄像头；如未调用该方法，则 SDK 使用系统默认设备
- 类型: `setCameraDevice(deviceId: String)  ：Promise`
### setCameraDevice
- 功能说明: 从`setMicrophoneDevice`获取到的麦克风/话筒列表中，设定上课想要使用的具体麦克风；如未调用该方法，则 SDK 使用系统默认设备
- 类型: `setMicrophoneDevice(deviceId: String)  ：Promise`
### setCameraDevice
- 功能说明: 从`setSpeakerDevice`获取到的扬声器/音箱/耳机列表中，设定上课想要使用的具体扬声器；如未调用该方法，则 SDK 使用系统默认设备
- 类型: `setSpeakerDevice(deviceId: String)  ：Promise`
- 示例及参数说明:
```js
    //cameraDeviceList 即为 getCameraDeviceList 返回数据
    const selectedCameraDeviceId = cameraList[0].deviceId
    const selectedMicroPhoneDeviceId = microPhoneList[0].deviceId
    const selectedSpeakerDeviceId = speakerList[0].deviceId

    async function setDevice(){
        //第一种 ：顺序执行
        await ZBY.setCameraDevice(selectedCameraDeviceId) 
        await ZBY.setMicrophoneDevice(selectedMicroPhoneDeviceId) 
        await ZBY.setMicrophoneDevice(selectedSpeakerDeviceId)
        //第二种 ： 并发执行
        // Promise.all([
        //     ZBY.setCameraDevice(selectedCameraDeviceId),
        //     ZBY.setMicrophoneDevice(selectedMicroPhoneDeviceId) 
        //     ZBY.setMicrophoneDevice(selectedSpeakerDeviceId)
        // ]) 
    }
    setDevice()
```

### openOrCloseCamera
- 功能说明: 打开或关闭摄像头
    - 如果未调用过`setCameraDevice`方法，则开关的是系统默认摄像头；如果
    - 如果调用过`setCameraDevice`方法，则开关的`setCameraDevice`设定过的摄像头
- 类型: `openOrCloseCamera(operation: Boolean)  ：Promise`
### openOrCloseMicrophone
- 功能说明: 打开或关闭麦克风
    - 如果未调用过`setMicrophoneDevice`方法，则开关的是系统默认麦克风；如果
    - 如果调用过`setMicrophoneDevice`方法，则开关的`setCameraDevice`设定过的麦克风
- 类型: `openOrCloseMicrophone(operation: Boolean)  ：Promise`
- 示例及参数说明:
```js
    await ZBY.openOrCloseCamera(true) 
    await ZBY.openOrCloseMicrophone(true) 
```

## 业务功能
### changeGroup
- 功能说明：切换上课小组，该功能一般由（主讲、辅导）老师使用
- 类型：`changeGroup(groupId: string, channelToekn:string) : Promise`
- 示例及参数说明：
```js
    const groupId //目标小组的组 id
    const channelToekn // 目标小组所需要的信道 token, 由业务后端调用直播云 API 返回对应 token 值
    async function changeGroup(){
        await ZBY.changeGroup(groupId, channelToekn)
    }
    changeGroup()
```

