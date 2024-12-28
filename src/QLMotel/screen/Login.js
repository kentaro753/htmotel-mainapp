import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login,
  useMyContextProvider,
  loginAuto,
  resetPassword,
} from "../store/index";
import firestore from "@react-native-firebase/firestore";

export default function Login({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [email, setEmail] = useState("");
  const [forgetEmail, setForgetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [countLogin, setCountLogin] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (userLogin != null) {
      const BILLS = firestore()
        .collection("USERS")
        .doc(userLogin?.email)
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
        loginAuto(dispatch, userLogin?.email, userLogin?.password);
        setCountLogin(1);
      }
      navigation.reset({
        index: 0, // Màn hình đầu tiên
        routes: [
          {
            name:
              userLogin?.role === "admin"
                ? "BottomTabAdmin"
                : "BottomTabRenter",
          },
        ],
      });
    }
  }, [userLogin]);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const updateBillState = (bill) => {
    const currentDate = new Date();

    if (bill.endDay) {
      const [endDay, endMonth, endYear] = bill.endDay.split("/").map(Number);
      const dueDate = new Date(endYear, endMonth - 1, endDay);

      if (bill.state === 0 && currentDate > dueDate) {
        const BILLS = firestore()
          .collection("USERS")
          .doc(userLogin?.email)
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
  const handleForgetPass = async () => {
    if (forgetEmail === "") {
      Alert.alert("Email không được bỏ trống!");
    } else if (!forgetEmail.match(/.+@.+/)) {
      Alert.alert("Email không đúng định dạng!");
    } else {
      try {
        await resetPassword(forgetEmail);
      } catch (error) {
        Alert.alert("Lỗi", error.message);
      }
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
        <Image
          source={{
            uri: "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
          }}
          style={{ width: 250, height: 210 }}
        ></Image>
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
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
      />
      <TextInput
        placeholder={"Mật khẩu"}
        value={password}
        secureTextEntry={!showPass}
        onChangeText={setPassword}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 10, backgroundColor: "#fff", borderWidth: 1 }}
        right={
          <TextInput.Icon
            icon={showPass ? "eye-off" : "eye"}
            onPress={() => setShowPass(!showPass)}
          />
        }
      />
      <TouchableOpacity onPress={toggleModal}>
        <Text
          style={{
            marginBottom: 20,
            color: "#0080ff",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>
      <Button
        mode="contained"
        onPress={handleLogin}
        textColor="#fff"
        style={{
          marginVertical: 10,
          padding: 5,
          backgroundColor: "#ff6600",
          borderRadius: 3,
        }}
      >
        <Text style={{ fontSize: 18 }}>Đăng nhập</Text>
      </Button>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 18 }}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={{ color: "#0080ff", fontWeight: "bold", fontSize: 18 }}>
            Đăng ký ngay
          </Text>
        </TouchableOpacity>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View>
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              flexDirection: "row",
              width: "100%",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                marginBottom: 20,
                color: "#ff6600",
                fontWeight: "bold",
                fontSize: 25,
              }}
            >
              Quên mật khẩu
            </Text>
            <TextInput
              placeholder={"Email"}
              value={forgetEmail}
              onChangeText={setForgetEmail}
              activeUnderlineColor="#ff944d"
              style={{
                marginBottom: 20,
                backgroundColor: "#fff",
                borderWidth: 1,
                width: "90%",
              }}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <Button
              onPress={toggleModal}
              style={{
                backgroundColor: "royalblue",
                width: "50%",
                borderRadius: 0,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                Đóng
              </Text>
            </Button>
            <Button
              onPress={handleForgetPass}
              style={{
                backgroundColor: "#ff7733",
                width: "50%",
                borderRadius: 0,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                Gửi yêu cầu
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
