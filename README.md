![mijia-plugin](https://socialify.git.ci/CikeyQi/mijia-plugin/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

<img decoding="async" align=right src="resources/readme/girl.png" width="35%">

# MIJIA-PLUGIN🍋

- 一个适用于 [Yunzai 系列机器人框架](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) 的米家插件，在任何地方控制家中米家生态设备

- 用奇怪的方式，让你在聊天框中控制米家设备，或者让群友控制你的米家设备（雾）

- **使用中遇到问题请加QQ群咨询：[707331865](https://qm.qq.com/q/TXTIS9KhO2)**

> [!TIP]
> 最近把家里的一些家具接入了米家，我也能享受智能家庭啦！闲的没事找了下米家的API，就写了这个插件。（其实也没太大用处对叭）

## 安装插件

#### 1. 克隆仓库

```
git clone https://github.com/CikeyQi/mijia-plugin.git ./plugins/mijia-plugin
```

> [!NOTE]
> 如果你的网络环境较差，无法连接到Github，可以使用 [GitHub Proxy](https://mirror.ghproxy.com/) 提供的文件代理加速下载服务
> ```
> git clone https://mirror.ghproxy.com/https://github.com/CikeyQi/mijia-plugin.git ./plugins/mijia-plugin
> ```

#### 2. 安装依赖

```
pnpm install --filter=mijia-plugin
```

## 插件配置

> [!CAUTION]
> 本插件已兼容 [Guoba-plugin](https://github.com/guoba-yunzai/guoba-plugin) ，你可以在锅巴插件中设置允许他人查看/控制你的智能设备，但这是很危险的操作，我们默认关闭了非主人控制，我们非常不建议你打开它。**如果你误操作导致任何财产损失，我们概不负责！**

<details> <summary>登录小米账号</summary>

暂时只支持 **小米账号** 与 **密码** 登录，安全性有待提高，建议私聊登录，将来可能会支持扫码登录

安装插件后，发送 `#米家登录` ，根据提示登录即可

⚠️注意：**小米账号**是指小米账号ID，手机号，邮箱均不可以登录，请打开手机自行查看小米账号ID。如果登陆时遇到设备锁提示，请在机器人运行的设备上打开 `https://account.xiaomi.com/` 登录一遍小米账号，等待10分钟左右即可正常登录

</details>

<details> <summary>自己写适配器</summary>

🌟由于米家设备数量大，种类复杂，作者无法做到全部适配，但是写适配器非常简单，所以建议自己配置，如果看完本教程实在是不会可以加群 [707331865](https://qm.qq.com/q/TXTIS9KhO2) 或者在 **[issue](https://github.com/CikeyQi/mijia-plugin/issues/new)** 留下你的设备型号，我会尽量给大家适配 

适配器文件保存在插件根目录下的 **/adapter** 文件夹，适配器文件的文件名为设备型号（可发送 **#米家设备** 查看你所拥有的设备型号），一个型号对应一个适配器

接下来打开网站 [小米/米家产品库](https://home.miot-spec.com/)，在搜索框直接搜索设备型号，找到自己的设备型号，点击 **规格**，选择最新的 **released**，进入开发文档

![image](https://github.com/CikeyQi/mijia-plugin/assets/61369914/c2dc380b-35a4-4017-b283-107497ec6d2c)

看到图中，SIID是功能分类ID，里面有很多设备属性ID，就是PIID，一个SIID加上一个PIID即可定位到一个属性，可以看到图中，当SIID为2，PIID为1时，控制的就是灯的开关

⚠️注意：权限栏有标注 **读**，则这个属性可以读取值，标注 **写**，则这个属性可以传入值，比如说例子中灯的开关，读是获取灯是开着的还是关着的，写是使灯开着或者关着

![image](https://github.com/CikeyQi/mijia-plugin/assets/61369914/dcac30f1-1829-4267-8bc3-4492440826b8)

以下是插件自带的适配器示例 **yeelink.light.lamp1.yaml**，actionable部分是 **写**，viewable部分是 **读**

```
actionable:                                 # 权限"写"接口
  - name: ["开关"]                          # 操作名称
    desc: "台灯开关，可用值：开、关"          # 操作描述与值范围提示，操作设备时会提示
    siid: 2                                 # 功能分类ID
    piid: 1                                 # 设备属性ID
    value_regexp: '/(开|关)/g'               # 值的正则表达式，避免用户传入不符合规范的值
  - name: ["亮度"]
    desc: "调整台灯亮度，可用值：1-100"
    siid: 2
    piid: 2
    value_regexp: '/([1-9]|[1-9][0-9]|100)/g'
  - name: ["色温"]
    desc: "调整台灯色温，可用值：2700-6500"
    siid: 2
    piid: 3
    value_regexp: '/(27[0-9]{2}|6[0-4][0-9]{2}|6500)/g'
  - name: ["模式"]
    desc: "调整台灯模式，可用值：0 - 阅读 / 1 - 计算机 / 2 - 夜读 / 3 - 防蓝光 / 4 - 有效工作 / 5 - 蜡烛 / 6 - 闪烁"
    siid: 2
    piid: 4
    value_regexp: '/(0|1|2|3|4|5|6)/g'
viewable:                                 # 权限"读"接口
  - name: '灯泡状态'                       # 展示名称
    siid: 2                               # 功能分类ID
    piid: 1                               # 设备属性ID
    unit: ''                              # 值的单位，可不填
  - name: '灯泡亮度'
    siid: 2
    piid: 2
    unit: '%'
  - name: '灯泡色温'
    siid: 2
    piid: 3
    unit: 'K'
```

`开` 与 `关` 对应值 `true` 与 `false`，已经做了内置处理，其他的值需要完全对应产品库中的值

</details>

<details> <summary>如何控制设备</summary>

以操作 **台灯** 为例，使用命令 **#米家台灯状态** 即可查看台灯状态。使用 **#米家控制台灯** 即可控制台灯，修改相关值。使用 **#米家设备** 即可列出所有设备

</details>

## 功能列表

- [x] 查看设备状态
- [x] 控制设备
- [x] 查看房间

## 常见问题
1. 插件安全吗？
    + 插件只与米家API交互，插件本身不会收集你任何信息也不会主动控制你的设备
    + 不确保插件被滥用，建议使用时小心谨慎，不要被有心群友使用

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力， 当然，你可以对我 [爱发电](https://afdian.net/a/sumoqi) 赞助，呜咪~❤️

有意见或者建议也欢迎提交 [Issues](https://github.com/CikeyQi/mijia-plugin/issues) 和 [Pull requests](https://github.com/CikeyQi/mijia-plugin/pulls)。

## 许可证
本项目使用 [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) 作为开源许可证。
