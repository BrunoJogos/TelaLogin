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
  ToastAndroid
} from "react-native";


const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");


import db from "../config";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  collection,
  addDoc,
  increment,
  updateDoc,
  query,
  where,
  orderBy,
  limit, getDocs
} from "firebase/firestore";


export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      book_name: "",
      studentName: ""
    };
  }


  handleTransaction = async () => {
    var { bookId, studentId } = this.state

    bookId = bookId.trim()
    studentId = studentId.trim()

    if(bookId == "" || studentId == ""){
      alert("Insira O Número Do Livro E/Ou Do Aluno")
      return
    }

    

    const bookExists = await this.getBookDetails(bookId)


    if (!bookExists) {
      this.setState({ bookId: "", studentId: "" })
      alert("Livro Não Existe")
      return
    }


    const studentExists = await this.getStudentDetails(studentId)


    if (!studentExists) {
      this.setState({ bookId: "", studentId: "" })
      return
    }


    var transactionType = await this.checkBookAvailability(bookId);




    if (!transactionType) {
      this.setState({ bookId: "", studentId: "" })
      alert("o livro nao existe no banco de dados da biblioteca")


    } else if (transactionType === "issue") {
      var isEligible = await this.checkStudentEligibilityForBookIssue(studentId);


      if (isEligible) {
        var { book_name, studentName } = this.state;
        await this.initiateBookIssue(bookId, studentId, book_name, studentName);


        alert("Livro entregue para o aluno!")
        //ToastAndroid.show("Livro entregue para o aluno!", ToastAndroid.LONG);
      }


    } else {
      var isEligible = await this.checkStudentEligibilityForBookReturn(bookId, studentId);
      console.log(isEligible)


      if (isEligible) {
        var { book_name, studentName } = this.state;
        console.log("entrou no if elegivel")


        await this.initiateBookReturn(bookId, studentId, book_name, studentName)
        console.log("Passou aqui e entrou na função de devolução do livro")
       
        alert("Livro devolvido à biblioteca!");
      }
      console.log("Rodou ate aqui return")
    }


  }


  initiateBookIssue = async (bookId, studentId, book_name, studentName) => {
    const docTransacData = {
      studentId: studentId,
      studentName: studentName,
      bookId: bookId,
      book_name: book_name,
      date: Timestamp.now().toDate(),
      transaction_type: "issued"
    }
    const docRef = await addDoc(collection(db, "transactions"), docTransacData)
    console.log(" documento com o id: ", docRef.id)


    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, { is_book_available: false })


    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, { number_of_books_issued: increment(1) })


    this.setState({
      bookId: "",
      studentId: ""
    });


  };


  initiateBookReturn = async (bookId, studentId, book_name, studentName) => {
    const docTransacData = {
      studentId: studentId,
      studentName: studentName,
      bookId: bookId,
      book_name: book_name,
      date: Timestamp.now().toDate(),
      transaction_type: "return"
    }
    const docRef = await addDoc(collection(db, "transactions"), docTransacData)
    console.log(" documento com o id: ", docRef.id)


    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, { is_book_available: true })


    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, { number_of_books_issued: increment(-1) })
   
    this.setState({
      bookId: "",
      studentId: ""
    });
  };


  getBookDetails = async (bookId) => {
    bookId = bookId.trim()
    console.log(bookId)
    const docRef = doc(db, "books", bookId)
    const docSnap = await getDoc(docRef)
    console.log("Livro existe?", docSnap.exists())
    console.log("Dados do livro:", docSnap.data())


    if (!docSnap.exists()) {
      alert("Aluno ou Livro não encontrado. Verifique os números.")
      return false
    }


    var dadosDoLivro = docSnap.data()
    this.setState({ book_name: dadosDoLivro.book_name })
    console.log("Passou aqui e pegou o nome do livro")
    return true
  }


  getStudentDetails = async (studentId) => {
    studentId = studentId.trim()
    const docRef = doc(db, "students", studentId)
    const docSnap = await getDoc(docRef)
    console.log("Aluno existe?", docSnap.exists())
    console.log("Dados do aluno:", docSnap.data())


    if (!docSnap.exists()) {
      alert("Aluno ou Livro não encontrado. Verifique os números.")
      return false
    }


    var dadoDoEstudante = docSnap.data()
    this.setState({ studentName: dadoDoEstudante.student_name })
    console.log("Passou aqui e pegou o nome do aluno")
    return true
  }


  checkBookAvailability = async (bookId) => {
    console.log("Entrou na checagem de livro disponivel")
    const docRef = doc(db, "books", bookId);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data())
    var dadosDoLivro = docSnap.data()


    var transactionType = ""; //vazia
    if (!docSnap.exists()) { //se vier igual a zero nao existe o livro
      transactionType = false;
    } else {
      //condição         //verdadeiro
      transactionType = dadosDoLivro.is_book_available ? "issue" : "return";
    }
    console.log("status livro: " + transactionType)
    return transactionType; //false issue ou return


  };


  checkStudentEligibilityForBookIssue = async (studentId) => {
    const docRef = doc(db, "students", studentId);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data())
    var dadosDoEstudante = docSnap.data()


    var isStudentEligible = "";
    if (!docSnap.exists()) { //se vier igual a zero nao existe o livro
      this.setState({ bookId: "", studentId: "" });
      isStudentEligible = false;
      alert("O id do aluno não existe no banco de dados!");
    } else {
      if (dadosDoEstudante.number_of_books_issued < 2) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        alert("O aluno já retirou 2 livros!");
        this.setState({ bookId: "", studentId: "" });
      }
    }
    console.log("status aluno: " + isStudentEligible)
    return isStudentEligible; //false issue ou return
  }


  checkStudentEligibilityForBookReturn = async (bookId, studentId) => {
    var isStudentEligible = "";
      const q = query(collection(db, "transactions"), where("bookId", "==", bookId), orderBy("date", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
    console.log("Transações encontradas:", querySnapshot.size);
    querySnapshot.forEach((doc) => {
      var lastBookTransaction = doc.data();

      if (lastBookTransaction.studentId === studentId) {
        isStudentEligible = true;
      }else {
        isStudentEligible = false
        alert("O livro não foi retirado por esse aluno")
        this.setState({
          bookId: "",
          studentId: ""
        })
      }
    })

    if (querySnapshot.empty) {
      console.log("Nenhuma transação encontrada para este livro.");
      isStudentEligible = false;
      alert("Não foi encontrada uma retirada para este livro!");
      this.setState({
        bookId: "",
        studentId: ""
      });
    }

    
    return isStudentEligible;
  }


  render() {
    const { bookId, studentId } = this.state
    return (
      <View style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                placeholder={"Id do livro"}
                placeholderTextColor={"#ffffff"}
                onChangeText={(text) => { this.setState({ bookId: text }) }}
                value={bookId}
              />
              <View style={styles.scanbutton}>
                <Text style={styles.scanbuttonText}>Pesquisar</Text>
              </View>
            </View>


            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"Id do aluno"}
                placeholderTextColor={"#ffffff"}
                onChangeText={(text) => this.setState({ studentId: text })}
                value={studentId}
              />
              <View style={styles.scanbutton}>
                <Text style={styles.scanbuttonText}>Pesquisar</Text>
              </View>
            </View>
            <Pressable style={styles.button}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </Pressable>
          </View>




        </ImageBackground>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    //cobrir
    resizeMode: "cover",
    //conteudo
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 10
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold"
  }
});
