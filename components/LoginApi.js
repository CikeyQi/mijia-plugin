import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import QRCode from 'qrcode';
import querystring from 'querystring';
import url from 'url';

const msgUrl = 'https://account.xiaomi.com/pass/serviceLogin?sid=xiaomiio&_json=true';
const loginUrl = 'https://account.xiaomi.com/pass/serviceLoginAuth2';
const qrUrl = 'https://account.xiaomi.com/longPolling/loginUrl';
const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Edg/126.0.0.0';

class LoginApi {
  constructor() {
    this.deviceId = null;
    this.instance = null;
    this.init();
  }

  async init() {
    this.deviceId = crypto.randomBytes(8).toString('hex');
    this.instance = axios.create({
      headers: {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cookie': `deviceId=${this.deviceId}; sdkVersion=3.4.1`
      },
      withCredentials: true,
    });
  }

  async getIndex() {
    try {
      const ret = await this.instance.get(msgUrl);

      if (ret.status !== 200) {
        return false;
      }

      const retData = JSON.parse(ret.data.substring(11));
      const data = { deviceId: this.deviceId };

      ['qs', '_sign', 'callback', 'location'].forEach(key => {
        if (retData.hasOwnProperty(key)) {
          data[key] = retData[key];
        }
      });

      return data;
    } catch (error) {
      return false;
    }
  }

  async login(username, password) {
    try {
      const result = await this.getIndex();
      if (!result) {
        return { status: false, msg: '获取登录索引失败' };
      }

      const form = new FormData();
      form.append('qs', result.qs);
      form.append('_sign', result._sign);
      form.append('callback', result.callback);
      form.append('sid', 'xiaomiio');
      form.append('_json', 'true');
      form.append('user', username);
      form.append('hash', crypto.createHash('md5').update(password).digest('hex').toUpperCase().padEnd(32, '0'));

      const loginRes = await axios.post(loginUrl, form, {
        headers: form.getHeaders(),
      });

      if (loginRes.status !== 200) {
        return { status: false, msg: `登录失败，状态码: ${loginRes.status}` };
      }

      const retData = JSON.parse(loginRes.data.substring(11));

      if (retData.code !== 0) {
        return { status: false, msg: `登录失败，${retData.desc}` };
      }

      if (!retData.location) {
        return { status: false, msg: '登陆遇到设备锁，请使用[#米家扫码登录]' };
      }

      return this.processLoginResponse(retData, result.deviceId);
    } catch (error) {
      return { status: false, msg: `登录失败，错误信息: ${error.message}` };
    }
  }

  async processLoginResponse(retData, deviceId) {
    try {
      const authData = {
        userId: retData.userId,
        ssecurity: retData.ssecurity,
        deviceId,
      };

      const locRes = await this.instance.get(retData.location);

      if (locRes.status !== 200) {
        return { status: false, msg: `登录失败，状态码: ${locRes.status}` };
      }

      const cookie = locRes.headers['set-cookie']
        .map(item => item.split(';')[0])
        .join('; ');

      const serviceTokenMatch = cookie.match(/serviceToken=([^;]+)/);
      if (!serviceTokenMatch) {
        return { status: false, msg: '登录失败，未能找到serviceToken' };
      }
      authData.serviceToken = serviceTokenMatch[1];

      return { status: true, data: authData };
    } catch (error) {
      return { status: false, msg: `登录失败，错误信息: ${error.message}` };
    }
  }

  async QRlogin(e) {
    try {
      const result = await this.getIndex();
      if (!result) {
        return { status: false, msg: '获取登录索引失败' };
      }

      const urlWithParams = this.buildQRUrl(result);
      const qrRes = await this.instance.get(urlWithParams);

      if (qrRes.status !== 200) {
        return { status: false, msg: `登录失败，状态码: ${qrRes.status}` };
      }

      const qrData = JSON.parse(qrRes.data.substring(11));
      if (qrData.code !== 0) {
        return { status: false, msg: `登录失败，${qrData.desc}` };
      }

      await e.reply(['请使用米家APP扫码登录\n', segment.image('base64://' + (await QRCode.toDataURL(qrData.loginUrl)).replace(/^data:image\/png;base64,/, ''))]);

      const ret = await this.pollLoginStatus(qrData.lp);
      if (ret.status !== 200) {
        return { status: false, msg: `登录失败，状态码: ${ret.status}` };
      }

      const retData = JSON.parse(ret.data.substring(11));
      if (retData.code !== 0) {
        return { status: false, msg: `登录失败，${retData.desc}` };
      }

      return this.processLoginResponse(retData, result.deviceId);
    } catch (error) {
      return { status: false, msg: `登录失败，${error.message}` };
    }
  }

  buildQRUrl(result) {
    const location = result.location;
    const locParsed = querystring.parse(url.parse(location).query);
    const params = {
      '_qrsize': 240,
      'qs': result.qs,
      'bizDeviceType': '',
      'callback': result.callback,
      '_json': 'true',
      'theme': '',
      'sid': 'xiaomiio',
      'needTheme': 'false',
      'showActiveX': 'false',
      'serviceParam': locParsed.serviceParam,
      '_local': 'zh_CN',
      '_sign': result._sign,
      '_dc': String(Date.now())
    };

    return `${qrUrl}?${querystring.stringify(params)}`;
  }

  async pollLoginStatus(lp) {
    try {
      return await this.instance.get(lp, { timeout: 60000, headers: { 'Connection': 'keep-alive' } });
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('登录超时');
      }
      throw error;
    }
  }
}

export default new LoginApi();