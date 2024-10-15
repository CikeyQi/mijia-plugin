import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../components/CoreApi.js'
import Config from '../components/Config.js'

export class Rooms extends plugin {
    constructor() {
        super({
            name: 'rooms',
            dsc: '房间管理',
            event: 'message',
            priority: 5000,
            rule: [{
                reg: '^#?米家房间$',
                fnc: 'rooms'
            }]
        })

    }

    async rooms(e) {
        const { allow_others_view } = await Config.getConfig();

        if (e.at && !allow_others_view) {
          return e.reply('主人关闭了查看权限，你不允许操作他人的设备');
        }
        
        const authorize = await CoreApi.getAuthorize(e.at && allow_others_view ? e.at : e.user_id);
        
        if (!authorize) {
          return e.reply('请先使用 #米家登录 绑定米家账号');
        }
        const rooms = await CoreApi.getRooms(authorize)
        if (!rooms) {
            return e.reply('获取设备列表失败')
        }
        let rooms_msg = "=== " + rooms.result.homelist[0].name + " 的房间列表 ==="
        rooms.result.homelist[0].roomlist.forEach((item) => {
            rooms_msg += `\n┏ 房间名称：${item.name}\n┣ 房间ID：${item.id}\n┗ 房间设备数：${item.dids.length}`
        })
        e.reply(rooms_msg)
        return true
    }
}
