/*
 * @Author: Xiaolu xiaolutan@apexglobe.com
 * @Date: 2023-06-25 22:55:01
 * @LastEditors: Xiaolu xiaolutan@apexglobe.com
 * @LastEditTime: 2023-06-26 01:24:10
 * @FilePath: /Goby/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, {useEffect} from 'react';
import {Text, Button, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();

const HomeScreen = ({navigation}) => {
  return (
    <Button
      title="Go to Jane's profile"
      onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
    />
  );
};
const ProfileScreen = ({navigation, route}) => {
  return <Text>This is {route.params.name}'s profile</Text>;
};

const App = () => {
  // 20200626 JustCode: FCM implementation
  const processNotification = (remoteMessage, fromBackground) => {
    let title = '';
    let body = '';
    let alertBtns = [];
    if (remoteMessage) {
      if (remoteMessage.notification) {
        title = remoteMessage.notification.title;
        body = remoteMessage.notification.body;
      }

      if (remoteMessage.data) {
        // If user tab on the notification when the app is in background or not running
        if (fromBackground && remoteMessage.data.msgType) {
          switch (remoteMessage.data.msgType) {
            case 'Search':
              this.forwardToSearchPage(remoteMessage.data.word);
              return; // terminate the method here

            // More cases in when app get bigger
          }
        }

        // Notification arrive while the app is running in foreground
        if (!fromBackground && remoteMessage.data.msgType) {
          switch (remoteMessage.data.msgType) {
            case 'Search':
              alertBtns = [
                {
                  text: localizedStrings.DailyWord.View,
                  onPress: () => {
                    this.forwardToSearchPage(remoteMessage.data.word);
                  },
                },
                {
                  text: localizedStrings.DailyWord.Close,
                  onPress: () => console.log('Close Pressed'),
                  style: 'cancel',
                },
              ];
              break;

            case 'VersionUpgrade':
              if (
                Number.parseInt(remoteMessage.data.nextVer) >
                Number.parseInt(VersionNumber.buildVersion)
              ) {
                title = localizedStrings.VersionUpgrade.Title;
                body = localizedStrings.VersionUpgrade.Msg;
                alertBtns = [
                  {
                    text: localizedStrings.VersionUpgrade.View,
                    onPress: () => {
                      Linking.openURL(
                        Platform.OS === 'ios'
                          ? remoteMessage.data.ios
                          : remoteMessage.data.android,
                      );
                    },
                  },
                  {
                    text: localizedStrings.VersionUpgrade.Close,
                    onPress: () => console.log('Close Pressed'),
                    style: 'cancel',
                  },
                ];
              }
              break;

            // More cases in when app get bigger
          }
        }
      }

      if (!fromBackground) {
        if (title.length > 0 && body.length > 0) {
          Alert.alert(
            title,
            body,
            alertBtns.length > 0 ? alertBtns : undefined,
          );
        }
      }
    }
  };
  useEffect(() => {
    messaging()
      .requestPermission()
      .then(authStatus => {
        console.log('APN Status:', authStatus);

        if (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        ) {
          messaging()
            .getToken()
            .then(token => {
              console.log('messaging.getToken: ', token);
            });

          messaging().onTokenRefresh(token => {
            console.log('messaging.onTokenRefresh: ', token);
          });

          messaging()
            .subscribeToTopic('dailyword')
            .then(() => console.log('Subscribed to topic - dailyword!'));

          messaging()
            .subscribeToTopic('version_upgrade')
            .then(() => console.log('Subscribed to topic - version_upgrade!'));

          fcmUnsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', remoteMessage);
            processNotification(remoteMessage, false);
            // Alert.alert(
            //   localizedStrings.DailyWord.Title,
            //   localizedStrings.DailyWord.Msg.replace('{0}', remoteMessage.data.word),
            //   [
            //     {
            //       text: localizedStrings.DailyWord.View,
            //       onPress: () => {
            //         this.forwardToSearchPage(remoteMessage.data.word);
            //       }
            //     },
            //     {
            //       text: localizedStrings.DailyWord.Close,
            //       onPress: () => console.log('Close Pressed'),
            //       style: 'cancel'
            //     }
            //   ]
            // );
          });

          messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
              'Notification caused app to open from background state:',
              remoteMessage,
            );
            processNotification(remoteMessage, true);
            //this.forwardToSearchPage(remoteMessage.data.word);
          });

          messaging()
            .getInitialNotification()
            .then(remoteMessage => {
              if (remoteMessage) {
                console.log(
                  'Notification caused app to open from quit state:',
                  remoteMessage,
                );
                processNotification(remoteMessage, true);
                // this.forwardToSearchPage(remoteMessage.data.word);
              }
            });
        } else {
          console.log('requestPermission Denied');
        }
      })
      .catch(err => {
        console.log('messaging.requestPermission Error: ', err);
      });
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
