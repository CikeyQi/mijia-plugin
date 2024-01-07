import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import config from './Config.js';
import Log from '../utils/logs.js';

function generateDeviceId() {
  let deviceId = '';
  const tempStr = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 16; i++) {
    deviceId += tempStr[Math.floor(Math.random() * tempStr.length)];
  }
  return deviceId;
}

async function login(sid, user, pwd) {
  const msgUrl = `https://account.xiaomi.com/pass/serviceLogin?sid=${sid}&_json=true`;
  const loginUrl = `https://account.xiaomi.com/pass/serviceLoginAuth2`;
  const deviceId = generateDeviceId();
  const userAgent = 'APP/com.xiaomi.mihome APPV/6.0.103 iosPassportSDK/3.9.0 iOS/14.4 miHSTS';

  const instance = axios.create({
    headers: {
      'User-Agent': userAgent,
      'Accept': '*/*',
      'Accept-Language': 'zh-tw',
      'Cookie': `deviceId=${deviceId}; sdkVersion=3.4.1`
    },
    withCredentials: true
  });

  let msg = await instance.get(msgUrl);
  let result = JSON.parse(msg.data.slice(11));

  const formData = new FormData();
  formData.append('qs', result['qs']);
  formData.append('sid', result['sid']);
  formData.append('_sign', result['_sign']);
  formData.append('callback', result['callback']);
  formData.append('user', user);
  formData.append('hash', crypto.createHash('md5').update(pwd).digest('hex').toUpperCase().padEnd(32, '0'));
  formData.append('_json', 'true');

  msg = await axios.post(loginUrl, formData, {
    headers: {
      'User-Agent': userAgent,
      'Accept': '*/*',
      'Accept-Language': 'zh-tw',
      'Cookie': `deviceId=${deviceId}; sdkVersion=3.4.1`
    },
    withCredentials: true
  });
  result = JSON.parse(msg.data.slice(11));

  if (result['code'] !== 0) {
    return {
      'code': result['code'],
      'message': result['desc']
    };
  }

  msg = await instance.get(result['location']);
  let cookies = {};
  msg.headers['set-cookie'].forEach(function (cookie) {
    const parts = cookie.split(';')[0].split('=');
    cookies[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return {
    ...cookies,
    'code': 0,
    'sid': sid,
    'userId': result['userId'],
    'securityToken': result['ssecurity'],
    'deviceId': deviceId,
    'message': '成功'
  };
}

async function login_config(user_id, user, password) {
  const authorize = await login("xiaomiio", user, password);
  L
  Log.i("登录米家账号 " + user + " 成功"); 
  if (authorize['code'] === 0) {
    const config_file = await config.getConfig();
    config_file[user_id] = authorize;
    config.setConfig(config_file);
    return true;
  }
  return false;
}

export { login_config };