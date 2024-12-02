import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, useMyContextProvider, loginAuto } from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function Login({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [email, setEmail] = useState("huutoan171002@gmail.com");
  const [password, setPassword] = useState("1234567");
  const [showPass, setShowPass] = useState(false);
  const [countLogin, setCountLogin] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (userLogin != null) {
      const BILLS = firestore()
        .collection("USERS")
        .doc(userLogin.email)
        .collection("BILLS");
      BILLS.where("state", "==", 0).onSnapshot((response) => {
        var arr = [];
        response.forEach((doc) => {
          updateBillState(doc.data());
        });
      });
    }
  }, [userLogin]);

  useEffect(() => {
    if (userLogin != null) {
      if (isAuto && countLogin == 0) {
        loginAuto(userLogin.email, userLogin.password);
        setCountLogin(1);
      }
      navigation.reset({
        index: 0, // Màn hình đầu tiên
        routes: [
          { name: userLogin.role === "admin" ? "BottomTabAdmin" : "BottomTabRenter" },
        ],
      });
    }
  }, [userLogin]);
  const updateBillState = (bill) => {
    const currentDate = new Date();

    if (bill.endDay) {
      const [endDay, endMonth, endYear] = bill.endDay.split("/").map(Number);
      const dueDate = new Date(endYear, endMonth - 1, endDay);

      if (bill.state === 0 && currentDate > dueDate) {
        const BILLS = firestore()
          .collection("USERS")
          .doc(userLogin.email)
          .collection("BILLS");
        BILLS.doc(bill.id)
          .update({ state: 1 })
          .then(() => console.log("Cập nhật trạng thái hóa đơn thành quá hạn"))
          .catch((error) =>
            console.error("Lỗi khi cập nhật trạng thái:", error)
          );
      }
    } else {
      console.warn(`Hóa đơn ${bill.id} không có ngày đến hạn hợp lệ`);
    }
  };
  const handleLogin = async () => {
    if (email === "") {
      Alert.alert("Email không được bỏ trống!");
    } else if (password === "") {
      Alert.alert("Password không được bỏ trống!");
    } else {
      login(dispatch, email, password);
      setIsAuto(false);
    }
  };

  // const saveLoggedInUser = async (dispatch, email, password) => {
  //   try {
  //     await AsyncStorage.setItem('loggedInUser', dispatch, email, password);
  //   } catch (error) {
  //     console.error('Error saving logged in user:', error);
  //   }
  // };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: "#ff6600",
            fontSize: 50,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Đăng nhập
        </Text>
      </View>
      <TextInput
        placeholder={"Email"}
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 20, backgroundColor: null }}
      />
      <TextInput
        placeholder={"Password"}
        value={password}
        secureTextEntry={!showPass}
        onChangeText={setPassword}
        style={{ marginBottom: 20, backgroundColor: null }}
        right={
          <TextInput.Icon
            icon={showPass ? "eye-off" : "eye"}
            onPress={() => setShowPass(!showPass)}
          />
        }
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        textColor="#000"
        style={{ marginVertical: 10, padding: 5, backgroundColor: "#ff944d" }}
      >
        Đăng nhập
      </Button>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={{ color: "#0080ff", fontWeight: "bold" }}>
            Đăng ký ngay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
