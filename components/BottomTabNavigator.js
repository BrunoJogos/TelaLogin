import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";


import TransactionScreen from "../screens/Transaction";
import SearchScreen from "../screens/Search";


const Tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component {
  render() {
    return (

      
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Transação") {
                iconName = focused ? "book" : 'book-outline'
              } else if (route.name === "Pesquisa") {
                iconName = focused ? "search" : 'search-outline'
              }
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "orange",
            tabBarInactiveTintColor: "black",
            tabBarLabelPosition: "beside-icon",

            tabBarStyle: {
              height: 130,
              borderTopWidth: 0,
              backgroundColor: "#5653d4",
            },
            tabBarLabelStyle: {
              fontSize: 20,
              fontFamily: "Rajdhani_600SemiBold",
            },
            tabBarItemStyle: {
              marginTop: 25,
              marginLeft: 10,
              marginRight: 10,
              borderRadius: 30,
              borderWidth: 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#5653d4",
            },
          })}
        >
          <Tab.Screen name="Transação" component={TransactionScreen} />
          <Tab.Screen name="Pesquisa" component={SearchScreen} />
        </Tab.Navigator>
      

    );
  }
}
