import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, Button } from "react-native-paper";
import {
  checkResetPassword,
  logout,
  useMyContextProvider,
} from "../store/index";
import firestore from "@react-native-firebase/firestore";
import { Avatar } from "react-native-paper";
import { Image } from "react-native";

export default function Setting({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [avatar, setAvatar] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const USER = firestore().collection("USERS");
  const onLogout = async () => {
    await logout(dispatch, userLogin?.email);
    await navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };
  //console.log(userLogin);
  // console.log(userLogin?.fullname);
  useEffect(() => {
    if (!userLogin) {
      navigation.navigate("Login");
    } else {
      //console.log(userLogin);
      checkResetPassword(dispatch, userLogin?.email, userLogin?.password);
      USER.doc(userLogin?.email).onSnapshot((response) => {
        const data = response.data();
        setFullName(data.fullName);
        setPhone(data.phone);
        setAvatar(data.avatar);
      });
    }
  }, [userLogin]);
  return (
    <ScrollView style={{ flex: 1 }}>
      {userLogin ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ flexDirection: "row", padding: 10 }}>
            <Avatar.Image
              backgroundColor="white"
              size={100}
              source={{
                uri: avatar || "https://example.com/default-avatar.png",
              }}
            />
            <View style={{ justifyContent: "center" }}>
              <Text style={{ ...styles.txt, fontSize: 19, fontWeight: "bold" }}>
                {fullName}
              </Text>
              <Text style={{ ...styles.txt, fontSize: 16, color: "#8c8c8c" }}>
                {phone}
              </Text>
              <Text style={{ ...styles.txt, fontSize: 16, color: "#8c8c8c" }}>
                {userLogin?.email}
              </Text>
            </View>
          </View>
          <View style={styles.htxt}>
            <Text
              variant="headlineSmall"
              style={{
                color: "#fff",
                fontSize: 30,

                marginTop: 10,
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
              }}
            >
              Tài khoản
            </Text>
          </View>
          <TouchableOpacity style={styles.btn}>
            <Text
              style={styles.Optiontxt}
              onPress={() => navigation.navigate("ChangeInfo")}
            >
              Cập nhật thông tin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("ChangePass")}
          >
            <Text style={styles.Optiontxt}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.btn}>
            <Text style={styles.Optiontxt}>Đăng xuất</Text>
          </TouchableOpacity>
          <View style={styles.htxt}>
            <Text
              variant="headlineSmall"
              style={{
                color: "#fff",
                fontSize: 30,

                marginTop: 10,
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
              }}
            >
              Thêm
            </Text>
          </View>
          {userLogin?.role == "admin" && (
            <TouchableOpacity style={styles.btn}>
              <Text
                style={styles.Optiontxt}
                onPress={() => navigation.navigate("TTabTCGroup")}
              >
                Quản lý nhóm giao dịch
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("Gioithieu")}
          >
            <Text style={styles.Optiontxt}>Thông tin về ứng dụng</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  btn: {
    borderColor: "#999999",
    borderBottomWidth: 1,
    width: "100%",
    height: 60,
    alignSelf: "center",
    justifyContent: "center",
  },
  txt: {
    marginBottom: 5,
    marginLeft: 20,
  },
  Optiontxt: {
    marginBottom: 5,
    marginLeft: 20,
    fontSize: 20,
    justifyContent: "center",
  },
  htxt: {
    height: 70,
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    backgroundColor: "#ffaa80",
    paddingHorizontal: 10,
  },
});
