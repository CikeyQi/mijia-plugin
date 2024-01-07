import plugin from '../../../lib/plugins/plugin.js'
import { login_config } from '../components/LoginApi.js'
import Init from '../model/init.js'

// 临时存储数据
var listen = []

export class Login extends plugin {
  constructor() {
    super({
      name: 'login',
      dsc: '配置参数',
      event: 'message',
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '#?米家登录$',
          /** 执行方法 */
          fnc: 'login'
        },
        {
          /** 命令正则匹配 */
          reg: '',
          /** 执行方法 */
          fnc: 'listen',
          /** 关闭日志 */
          log: false
        }
      ]
    })
  }

  async login(e) {
    e.reply("请发送小米账号：")
    listen[e.user_id] = {
      "step": 1,
      "user": "",
      "password": ""
    }
  }
  async listen(e) {
    if (listen[e.user_id] == undefined) return false

    if (listen[e.user_id].step == 1) {
      listen[e.user_id].user = e.raw_message
      listen[e.user_id].step = 2
      e.reply("请发送小米账号密码：")
      return false
    }

    if (listen[e.user_id].step == 2) {
      listen[e.user_id].password = e.raw_message
      e.reply("正在登录中...")
      let login_status = await login_config(e.user_id, listen[e.user_id].user, listen[e.user_id].password);
      if (login_status) {
        e.reply("登录成功")
      } else {
        e.reply("登录失败，请检查账号密码是否正确")
      }
      listen[e.user_id] = undefined
      return false
    }
  }
}
