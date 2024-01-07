import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../components/CoreApi.js'

export class Devices extends plugin {
  constructor() {
    super({
      name: 'devices',
      dsc: '设备管理',
      event: 'message',
      priority: 5000,
      rule: [{
        reg: '#?米家设备$',
        fnc: 'devices'
      }]
    })

  }

  async devices(e) {
    const authorize = await CoreApi.getAuthorize(e.user_id)
    if (!authorize) {
      return e.reply('请先绑定米家账号')
    }
    const devices = await CoreApi.getDevices(authorize)
    if (!devices) {
      return e.reply('获取设备列表失败')
    }
    let deviceList = []
    devices.result.list.forEach((item) => {
      deviceList.push(`┏ 设备名称：${item.name}\n┣ 设备型号：${item.model}\n┗ 设备状态：${item.isOnline ? '在线' : '离线'}`)
    })
    const user = await CoreApi.getUser(e.user_id)
    let msg = `=== ${user} 的设备列表 ===\n`
    msg += deviceList.join('\n')
    e.reply(msg)
  }
}
