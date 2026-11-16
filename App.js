import React, { Component } from "react";
import * as Font from "expo-font";
import { Rajdhani_600SemiBold } from "@expo-google-fonts/rajdhani";
import BottomTabNavigator from "./components/BottomTabNavigator";
import LoginScreen from "./screens/Login"
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator()

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      fontLoaded: false
    }
  }

  async loadFonts(){
    await Font.loadAsync({
      Rajdhani_600SemiBold: Rajdhani_600SemiBold
    })
    this.setState({fontLoaded:true})
  }

  componentDidMount(){
    this.loadFonts()
  }

  render() {
    const {fontLoaded} = this.state
    
    if(fontLoaded){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName = "Login" screenOptions={{headerShown: false}}>
          <Stack.Screen name = "Login" component = {LoginScreen}/>
          <Stack.Screen name = "BottomTab" component = {BottomTabNavigator}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
    }

    return null
  }
}