
![Cover](https://github.com/CikeyQi/mijia-plugin/assets/61369914/05df02b0-dbe4-40b9-ae73-14b12a94ec9d)

# Mijia-plugin

基于Yunzai-Bot的米家插件，在任何地方控制家中米家生态设备

# 如何登录

暂时只支持 **小米账号** 与 **密码** 登录，安全性有待提高，建议私聊登录，将来可能会支持扫码登录

安装插件后，发送 `#米家登录` ，根据提示登录即可

⚠️注意：**小米账号**是指小米账号ID，手机号，邮箱均不可以登录，请打开手机自行查看小米账号ID。如果登陆时遇到设备锁提示，请在机器人运行的设备上打开 `https://account.xiaomi.com/` 登录一遍小米账号，等待10分钟左右即可正常登录

# 如何写适配器

🌟由于米家设备数量大，种类复杂，作者无法做到全部适配，但是写适配器非常简单，所以建议自己配置，如果看完本教程实在是不会可以加群 **551081559** 或者在 **[issue](https://github.com/CikeyQi/mijia-plugin/issues/new)** 留下你的设备型号，我会尽量给大家适配 

适配器文件保存在插件根目录下的 **/adapter** 文件夹，适配器文件的文件名为设备型号（可发送 **#米家设备** 查看你所拥有的设备型号），一个型号对应一个适配器

接下来打开网站[小米/米家产品库](https://home.miot-spec.com/)，在搜索框直接搜索设备型号，找到自己的设备型号，点击 **规格**，选择最新的 **released**，进入开发文档

![image](https://github.com/CikeyQi/mijia-plugin/assets/61369914/c2dc380b-35a4-4017-b283-107497ec6d2c)

看到图中，SIID是功能分类ID，里面有很多设备属性ID，就是PIID，一个SSID加上一个PIID即可定位到一个属性，可以看到图中，当SSID为2，PIID为1时，控制的就是灯的开关

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
# 如何操作设备

以操作 **台灯** 为例，使用命令 **#米家台灯状态** 即可查看台灯状态。使用 **#米家控制台灯** 即可控制台灯，修改相关值。使用 **#米家设备** 即可列出所有设备

# 声明

此项目仅用于学习交流，请勿用于非法用途

## 爱发电

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力  
当然，你可以对我爱发电赞助，呜咪~❤️

<details>
<summary>展开/收起</summary>

<p>
  </a>
    <img src="https://github.com/CikeyQi/mijia-plugin/assets/61369914/cadeabc6-2d4c-4312-84c9-8e8beeca174c">
  </a>
</p>

</details>

# 我们

<a href="https://github.com/CikeyQi/mijia-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CikeyQi/mijia-plugin" />
</a>
