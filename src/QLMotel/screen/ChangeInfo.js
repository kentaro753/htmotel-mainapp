import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useMyContextProvider } from "../store/index";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageCropPicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";

export default function ChangeInfo({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [avatar, setAvatar] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const USERS = firestore().collection("USERS");

  useEffect(() => {
    if (userLogin == null) navigation.navigate("Login");
    else {
      USERS.doc(userLogin.email).onSnapshot((response) => {
        const data = response.data();
        setFullName(data.fullName);
        setPhone(data.phone);
        setAvatar(data.avatar);
      });
    }
  }, [userLogin]);
  const handleUploadImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      cropping: true,
      cropperCircleOverlay: true, // Bật overlay dạng hình tròn
      width: 300,
      height: 300, // Dùng cho hình tròn (tỉ lệ 1:1)
    })
      .then((pic) => {
        setAvatar(pic.path); // Lưu toàn bộ đối tượng ảnh để lấy thông tin khi cần
        console.log(pic);
      })
      .catch((e) => console.log(e.message));
  };

  const handleChangeInfo = () => {
    USERS.doc(userLogin.email)
      .update({ fullName: fullName, phone: phone })
      .then(() => {
        const refImage = storage().ref("/images/" + userLogin.email + ".jpg");
        if (avatar != "") {
          refImage
            .putFile(avatar)
            .then(() => {
              refImage
                .getDownloadURL()
                .then((link) =>
                  USERS.doc(userLogin.email).update({ avatar: link })
                );
            })
            .catch((e) => console.log(e.message));
        }
        USERS.doc(userLogin.email).onSnapshot(async (u) => {
          if (u.exists) {
            const userData = u.data();
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            dispatch({ type: "USER_LOGIN", value: userData });
          }
        });
        Alert.alert("Change Info success");
        navigation.goBack();
      })
      .catch((e) => Alert.alert(e.message));
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 30,
        top: -70,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatar == "" ? (
          <IconButton
            icon="camera-plus"
            size={50}
            onPress={handleUploadImage}
            style={{
              height: "52%",
              alignItems: "center",
              width: "52%",
              borderWidth: 1,
              borderRadius: 1000,
            }}
          />
        ) : (
          <TouchableOpacity
            onPress={handleUploadImage}
            style={{
              height: "50%",
              alignItems: "center",
              aspectRatio:1,
              borderWidth: 1,
              borderRadius: 1000,
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: avatar,
              }} // Sử dụng thuộc tính `path` của đối tượng hình ảnh trả về từ ImageCropPicker
              style={{
                height: "100%",
                alignItems: "center",
                width: "100%",
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        placeholder={"Họ và tên"}
        value={fullName}
        onChangeText={setFullName}
        style={{ marginBottom: 20, backgroundColor: null }}
      />
      <TextInput
        keyboardType="numeric"
        placeholder={"Số điện thoại"}
        value={phone}
        onChangeText={setPhone}
        style={{ marginBottom: 20, backgroundColor: null }}
        maxLength={10}
      />
      <Button
        textColor="#000"
        style={{ marginTop: 5, padding: 5, backgroundColor: "#ff944d" }}
        mode="contained"
        onPress={handleChangeInfo}
      >
        Lưu thông tin người dùng
      </Button>
    </View>
  );
}
