import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import Log from '../utils/logs.js';

function generateSignedNonce(secret, nonce) {
    const sha = crypto.createHash('sha256');
    sha.update(Buffer.from(secret, 'base64'));
    sha.update(Buffer.from(nonce, 'base64'));
    return Buffer.from(sha.digest()).toString('base64');
}

function generateSignature(uri, signedNonce, nonce, data) {
    const sign = uri + "&" + signedNonce + "&" + nonce + "&data=" + data;
    const mac = crypto.createHmac('sha256', Buffer.from(signedNonce, 'base64'));
    mac.update(sign);
    return Buffer.from(mac.digest()).toString('base64');
}

async function postData(uri, data, authorize) {
    data = JSON.stringify(data);
    let serviceToken, securityToken;
    try {
        serviceToken = authorize.serviceToken;
        securityToken = authorize.securityToken;
    } catch (error) {
        Log.e('serviceToken not found, Unauthorized');
        return null;
    }
    const tempStr = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nonce = '';
    for (let i = 0; i < 16; i++) {
        nonce += tempStr[Math.floor(Math.random() * tempStr.length)];
    }
    const signedNonce = generateSignedNonce(securityToken, nonce);
    const signature = generateSignature(uri, signedNonce, nonce, data);

    const formData = new FormData();
    formData.append('_nonce', nonce);
    formData.append('data', data);
    formData.append('signature', signature);

    const userAgent = 'APP/com.xiaomi.mihome APPV/6.0.103 iosPassportSDK/3.9.0 iOS/14.4 miHSTS';
    try {
        const response = await axios.post('https://api.io.mi.com/app' + uri, formData, {
            headers: {
                'User-Agent': userAgent,
                'x-xiaomi-protocal-flag-cli': 'PROTOCAL-HTTP2',
                'Cookie': `PassportDeviceId=${authorize.deviceId};userId=${authorize.userId};serviceToken=${serviceToken};`
            }
        });
        return response.data;
    } catch (error) {
        Log.e(error);
    }
}

export default postData;