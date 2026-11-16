import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Text,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Alert // 1. Importado para alertas com título e mensagem
} from "react-native";


import firebase, { db } from "../config";


const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");
const backgroundImage = require("../assets/background2.png");


export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };
  }




    handleLogin = (email, password) => {
        firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("Sucesso", "Bem-vindo(a) " + user.email);
        this.props.navigation.navigate("BottomTab");
      })
      .catch((error) => {
        alert("Erro no login", `${error.code}: ${error.message}`);
      });
    };




  render() {
    const { email, password } = this.state;
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.content}>
            <View style={styles.upperContainer}>
              <Image source={appIcon} style={styles.appIcon} />
              <Image source={appName} style={styles.appName} />
            </View>


            <View style={styles.lowerContainer}>
              <TextInput
                style={styles.textinput}
                placeholder = "Insira Seu E-Mail"
                placeholderTextColor = "#FFFFFF"
                value={email}
                keyboardType = "email-address"
                onChangeText = {(text) => this.setState({email: text})}
              />

            <TextInput
                style={styles.textinput}
                placeholder = "Insira Sua Senha"
                placeholderTextColor = "#FFFFFF"
                value={password}
                secureTextEntry
                onChangeText = {(text) => this.setState({password: text})}
              />

              <Pressable style={styles.button}
              onPress={() => this.handleLogin(email,password)}
              >
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>

            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1
  },
  backgroundImage: {
    opacity: 0.95
  },
  content: {
    flex: 1,
    alignItems: "center"
  },
  button: {
    width: "88%",
    height: 58,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 12
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  upperContainer: {
    flex: 0.55,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 20
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.45,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20
  },
  textinput: {
    width: "88%",
    height: 56,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  }
});
