/*
 * @Author: Xiaolu xiaolutan@apexglobe.com
 * @Date: 2023-06-25 22:55:01
 * @LastEditors: Xiaolu xiaolutan@apexglobe.com
 * @LastEditTime: 2023-06-26 01:15:50
 * @FilePath: /Goby/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
AppRegistry.registerComponent(appName, () => App);
