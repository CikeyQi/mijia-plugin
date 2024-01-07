import YAML from 'yaml'
import fs from 'fs'
import { pluginRoot } from '../model/path.js'
import Log from '../utils/logs.js'

class Adapter {
  getAdapter(model_name) {
    if (fs.existsSync(`${pluginRoot}/adapter/${model_name}.yaml`)) {
      try {
        const config_data = YAML.parse(
          fs.readFileSync(`${pluginRoot}/adapter/${model_name}.yaml`, 'utf8')
        )
        return config_data
      } catch (err) {
        Log.e('加载适配器：' + model_name + '失败')
        return false
      }
    }
    return false
  }
}

export default new Adapter()
