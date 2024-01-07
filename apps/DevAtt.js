import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../components/CoreApi.js'
import Adapter from '../components/Adapter.js'

// 临时存储数据
var listen = []
var timeout = []

export class DevAtt extends plugin {
  constructor() {
    super({
      name: 'devices',
      dsc: '设备控制',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '#?米家(.*)状态$',
          fnc: 'devAtt_get'
        },
        {
          reg: '#?米家控制(.*)$',
          fnc: 'devAtt_set'
        },
        {
          /** 命令正则匹配 */
          reg: '',
          /** 执行方法 */
          fnc: 'listen',
          /** 关闭日志 */
          log: false
        }]
    })
  }

  async devAtt_get(e) {
    const authorize = await CoreApi.getAuthorize(e.user_id)
    if (!authorize) {
      return e.reply('请先绑定米家账号')
    }
    const devices = await CoreApi.getDevices(authorize)
    if (!devices) {
      return e.reply('获取设备列表失败')
    }

    let devName = e.msg.match(this.rule[0].reg)[1]

    let model = null
    let did = null
    devices.result.list.forEach((item) => {
      if (item.name == devName) {
        model = item.model
        did = item.did
      }
    })

    if (!model) {
      e.reply('未找到设备：' + devName + '请使用命令 [#米家设备] 查看设备列表')
      return true
    }

    // 在适配器文件中查找是否有该设备的适配器
    const adapter = await Adapter.getAdapter(model)
    if (!adapter) {
      e.reply('暂不支持该设备，请将型号为 ' + model + ' 的适配器文件放入adapter文件夹')
      return true
    }

    // 获取设备的属性列表
    let viewList = []
    adapter.viewable.forEach((item) => {
      viewList.push({
        "name": item.name,
        "did": did,
        "siid": item.siid,
        "piid": item.piid
      })
    })

    let viewmsg = "=== " + devName + " 的状态 ==="
    for (let i = 0; i < viewList.length; i++) {
      const devAtt = await CoreApi.getDevAtt([{
        "did": viewList[i].did,
        "siid": viewList[i].siid,
        "piid": viewList[i].piid
      }], authorize)
      if (devAtt.code != 0) {
        e.reply('设置失败，错误码：' + devAtt.code)
        return true
      }
      let value_next = devAtt.result[0].value
      
      if (devAtt.result[0].value === true) {
        value_next = '开';
      } else if (devAtt.result[0].value === false) {
        value_next = '关';
      }

      viewmsg += '\n' + '[' + viewList[i].name + ']：' + value_next
    }
    await e.reply(viewmsg)
    return true
  }
  async devAtt_set(e) {
    const authorize = await CoreApi.getAuthorize(e.user_id)
    if (!authorize) {
      return e.reply('请先绑定米家账号')
    }
    const devices = await CoreApi.getDevices(authorize)
    if (!devices) {
      return e.reply('获取设备列表失败')
    }

    let devName = e.msg.match(this.rule[1].reg)[1]

    let model = null
    let did = null
    devices.result.list.forEach((item) => {
      if (item.name == devName) {
        model = item.model
        did = item.did
      }
    })

    if (!model) {
      e.reply('未找到设备：' + devName + '请使用命令 [#米家设备] 查看设备列表')
      return true
    }

    // 在适配器文件中查找是否有该设备的适配器
    const adapter = await Adapter.getAdapter(model)
    if (!adapter) {
      e.reply('暂不支持该设备，请将型号为 ' + model + ' 的适配器文件放入adapter文件夹')
      return true
    }

    // 给出设备的属性列表
    let keyList = '=== ' + devName + ' 的可调参数 ==='
    adapter.actionable.forEach((item) => {
      keyList += '\n' + '[' + item.name[0] + ']： ' + item.desc
    })
    await e.reply(keyList)
    listen[e.user_id] = {
      "step": 1,
      "authorize": authorize,
      "devName": devName,
      "key": "",
      "adapter": adapter,
      "did": did,
      "siid": null,
      "piid": null,
      "value_regexp": null,
      "value": ""
    }
    timeout[e.user_id] = setTimeout(() => {
      if (listen[e.user_id] != undefined && listen[e.user_id].step == 1) {
        listen[e.user_id] = undefined
        e.reply('操作已超时，已取消本次操作')
      }
    }, 60000)
    return true
  }

  async listen(e) {
    if (listen[e.user_id] == undefined) return false
    if (listen[e.user_id].step == 1) {
      let siid = null
      let piid = null
      let value_regexp = null
      listen[e.user_id].adapter.actionable.forEach((item) => {
        if (item.name.includes(e.msg)) {
          siid = item.siid
          piid = item.piid
          value_regexp = item.value_regexp
        }
      })
      if (!siid) {
        e.reply('不支持该参数：' + e.msg)
        return true
      }
      e.reply("请输入要设置的参数：")
      listen[e.user_id].step = 2
      listen[e.user_id].siid = siid
      listen[e.user_id].piid = piid
      listen[e.user_id].value_regexp = value_regexp
      clearTimeout(timeout[e.user_id])
      timeout[e.user_id] = setTimeout(() => {
        if (listen[e.user_id] != undefined && listen[e.user_id].step == 2) {
          listen[e.user_id] = undefined
          e.reply('操作已超时，已取消本次操作')
        }
      }, 60000)
      return true
    }

    if (listen[e.user_id].step == 2) {

      // 检查值是否符合正则
      if (!eval(listen[e.user_id].value_regexp).test(e.msg)) {
        e.reply('不支持该值：' + e.msg)
        return true
      }

      let value_next = e.msg

      // 如果值为bool型，转换为bool型
      if (e.msg == '开') {
        value_next = true
      } else if (e.msg == '关') {
        value_next = false
      }

      // 如果值为数字型，转换为数字型
      if (!isNaN(e.msg)) {
        value_next = Number(e.msg)
      }
      const devAtt = await CoreApi.setDevAtt([{
        "did": listen[e.user_id].did,
        "siid": listen[e.user_id].siid,
        "piid": listen[e.user_id].piid,
        "value": value_next
      }], listen[e.user_id].authorize)
      if (devAtt.code != 0) {
        e.reply('设置失败，错误码：' + devAtt.code)
        return true
      }
      e.reply('已将 ' + listen[e.user_id].devName + ' 的 ' + listen[e.user_id].key + ' 设置为 ' + e.msg)
      listen[e.user_id] = undefined
      clearTimeout(timeout[e.user_id])
      return true
    }
  }
}
