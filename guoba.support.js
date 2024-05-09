import Config from "./components/Config.js";
import lodash from "lodash";
import path from "path";
import { pluginRoot } from "./model/path.js";

export function supportGuoba() {
  return {
    pluginInfo: {
      name: '米家控制插件',
      title: 'mijia-plugin',
      author: ['@CikeyQi'],
      authorLink: ['https://github.com/CikeyQi'],
      link: 'https://github.com/CikeyQi/mijia-plugin',
      isV3: true,
      isV2: false,
      showInMenu: true,
      description: '基于 Yunzai 的小米智能家居控制插件',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'cbi:xiaomi-logo',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#19cd90',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: path.join(pluginRoot, 'resources/readme/girl.png'),
    },
    configInfo: {
      schemas: [
        {
          field: "allow_others_control",
          label: "允许他人控制",
          bottomHelpMessage: "[极度危险]允许他人通过插件控制米家设备",
          component: "Switch",
        },
        {
          field: "allow_others_view",
          label: "允许他人查看",
          bottomHelpMessage: "[极度危险]允许他人通过插件查看米家设备",
          component: "Switch",
        },
      ],
      getConfigData() {
        let config = Config.getConfig()
        return config
      },

      setConfigData(data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, Config.getConfig(), config)
        Config.setConfig(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
