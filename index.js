/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import  BackgroundGeolocation  from  "react-native-background-geolocation" ;

import axios from 'axios';

AppRegistry.registerComponent(appName, () => App);
let BackgroundGeolocationHeadlessTask = async (event) => {
    let params = event.params;
     console.log("[BackgroundGeolocation HeadlessTask] -", event.name, params);
  
     switch (event.name) {
       case "heartbeat":
         // Use await for async tasks
            let location = await BackgroundGeolocation.getCurrentPosition({
                samples: 1,
                persist: false
            });
            console.log("[BackgroundGeolocation HeadlessTask] - getCurrentPosition:");
            axios.post('https://softer069.cafe24.com/api/locaion_save.php', {
                location: JSON.stringify(location),
            })

        break;
     }
  }
  
  BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);