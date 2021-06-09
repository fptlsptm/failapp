import * as React from 'react';
import {Text, View,StyleSheet, ToastAndroid, BackHandler,Alert,Platform,Toast,Linking ,NativeModules,TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
//import { getStatusBarHeight } from 'react-native-status-bar-height';
//import AsyncStorage from '@react-native-community/async-storage';
// import IntentLauncher from 'react-native-intent-launcher';
import axios from 'axios';
import  BackgroundGeolocation  from  "react-native-background-geolocation" ;
export default function CusWebview(props){
    
    const [urls, seTurls] = React.useState("");

    const webViews = React.useRef();
    
    const onShouldStartLoadWithRequest = (e) => {
        let wurl = e.url;
        let rs = true;
        var SendIntentAndroid = require('react-native-send-intent');
        if (!wurl.startsWith("http://")&& !wurl.startsWith("https://")&& !wurl.startsWith("javascript:")){
            if(Platform.OS=="android"){
                webViews.current.stopLoading();
                SendIntentAndroid.openChromeIntent(wurl)
                    .then(isOpened => {
                    if(!isOpened){ToastAndroid.show('어플을 설치해주세요.', ToastAndroid.SHORT);}
                });      
            }else{
                const supported = Linking.canOpenURL(wurl);
                if(supported){
                    Linking.openURL(wurl);
                }else{
                    alert("어플을 설치해주세요");
                }
            }
            rs = false;
        }
    
        return rs;
    }

    const handleBackButton = () => {
        if(urls == props.url || urls == props.url+"?ck_rn=react_native"){
            Alert.alert(
                '어플을 종료할까요?','',
                [
                { text: '네', onPress: () =>  BackHandler.exitApp()},
                {text: '아니요'}
                ]
            );
    
        }else {
            webViews.current.goBack();
        }
        return true;
    }
    let onLocation = (location) => {
        axios.post('https://softer069.cafe24.com/api/locaion_save.php', {
            location: JSON.stringify(location),
        })
    }
    let onError = (error) => {
        console.warn('[location] ERROR -', error);
    }
    let onMotionChange = (event) =>{
        console.log('[motionchange] -', event.isMoving, event.location);
      }
    React.useEffect(()=>{
        //BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        BackgroundGeolocation.onLocation(onLocation);
        BackgroundGeolocation.onMotionChange(onMotionChange);
        BackgroundGeolocation.ready({
            // Geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 5,
            // Activity Recognition
            stopTimeout: 1,
            heartbeatInterval:60,
            // Application config
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            enableHeadless:true,
            stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
  
          }, (state) => {
            console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
      
            if (!state.enabled) {
              BackgroundGeolocation.start(function() {
                console.log("- Start success");
              });
            }
        });
        
        BackgroundGeolocation.onHeartbeat((event) => {
            console.log("[onHeartbeat] ", event);
            
            // You could request a new location if you wish.
            BackgroundGeolocation.getCurrentPosition({
                samples: 1,
                persist: true
            }).then((location) => {
                axios.post('https://softer069.cafe24.com/api/locaion_save.php', {
                    location: JSON.stringify(location),
                })
            });
        })
      

    },[]);


    return (
        <View style={styles.container}>
            <View style={styles.webView}>
            <WebView
                ref={webViews}
                source={{uri: props.url}}
                //source={{uri: props.url+"?ck_rn=react_native"}}
                //onMessage={(event)=> Alert.alert(event.nativeEvent.data, ToastAndroid.SHORT) }
                onShouldStartLoadWithRequest= {onShouldStartLoadWithRequest}
                javaScriptEnabledAndroid={true}
                allowFileAccess={true}
                renderLoading={true}
                mediaPlaybackRequiresUserAction={false}
                setJavaScriptEnabled = {false}
                scalesPageToFit={false}
                allowsBackForwardNavigationGestures={true}
                originWhitelist={['*']}
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
               
            />
          
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth:1,
    borderColor:"#eee",
    flex: 1,
    backgroundColor: 'white',
  },
  webView: {
    flex: 12,
  },
  nav: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row'
  },
  nav_bnt: {
    width:"25%",
    height:"100%",
    backgroundColor: '#eee',
    textAlign:'center',
    justifyContent: 'center',
    alignItems:'center',
    lineHeight:50,
  },
  fonts:{
      fontSize:25,
  }

});
