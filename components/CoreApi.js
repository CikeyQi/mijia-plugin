import postData from './PostData.js';
import Config from './Config.js';

class CoreApi {
    async getAuthorize(user_id) {
        const config_data = await Config.getConfig();
        if (!config_data[user_id]) {
            return false;
        }
        return config_data[user_id];
    }

    async getUser(user_id) {
        const config_data = await Config.getConfig();
        if (!config_data[user_id]) {
            return false;
        }
        return config_data[user_id].userId;
    }

    async getDevices(authorize) {
        const uri = '/home/device_list';
        const data = {
            "getVirtualModel": false,
            "getHuamiDevices": 0
        }
        return await postData(uri, data, authorize);
    }

    async getDevAtt(params, authorize) {
        const uri = '/miotspec/prop/get';
        const data = {
            "params": params
        }
        return await postData(uri, data, authorize);
    }

    async setDevAtt(params, authorize) {
        const uri = '/miotspec/prop/set';
        const data = {
            "params": params
        }
        return await postData(uri, data, authorize);
    }

    async getRooms(authorize) {
        const uri = '/v2/homeroom/gethome';
        const data = {"fg": false, "fetch_share": true, "fetch_share_dev": true, "limit": 300, "app_ver": 7}
        return await postData(uri, data, authorize);
    }
}

export default new CoreApi();