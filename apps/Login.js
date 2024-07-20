import plugin from '../../../lib/plugins/plugin.js'
import LoginApi from '../components/LoginApi.js'
import config from '../components/Config.js';
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
          reg: '^#?米家登录$',
          /** 执行方法 */
          fnc: 'login'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?米家扫码登录$',
          /** 执行方法 */
          fnc: 'qrlogin'
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

  async qrlogin(e) {
    let data = await LoginApi.QRlogin(e)
    if (data.status === true) {
      const config_file = await config.getConfig();
      config_file[e.user_id] = data.data;
      config.setConfig(config_file);
      e.reply("登录成功")
    } else {
      e.reply("登录失败，原因：" + data.msg)
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
      let data = await LoginApi.login(listen[e.user_id].user, listen[e.user_id].password)
      if (data.status === true) {
        const config_file = await config.getConfig();
        config_file[e.user_id] = data.data;
        config.setConfig(config_file);
        e.reply("登录成功")
      } else {
        e.reply("登录失败，原因：" + data.msg)
      }
      listen[e.user_id] = undefined
      return false
    }
  }
}
