import { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { createAccount, createAccountRenter } from "../store/index";

export default function Register({ navigation, route }) {
  const { admin } = route.params || {};
  const { item } = route.params || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(item ? "renter" : "admin");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (item) {
      setEmail(item.email);
      setFullName(item.fullName);
      setRole("renter");
      setPhone(item.phone);
      setDisabled(true);
      console.log(route.params.item, admin);
    }
  }, [item]);
  const handleCreateAccount = () => {
    if (!email.match(/.+@.+/)) {
      Alert.alert("Email không đúng định dạng!");
    } else if (fullName == "") Alert.alert("Full Name không được bỏ trống!");
    else if (password.length < 6) {
      Alert.alert("Password không được ít hơn 6 ký tự!");
    } else if (password != cpassword) {
      Alert.alert("Password và Confirm Password không giống nhau!");
    } else if (role == "admin") {
      createAccount(email, password, fullName, phone, role);
      navigation.goBack();
    } else if (role == "renter") {
      createAccountRenter(email, admin, password, fullName, phone, role, item.id);
      navigation.goBack();
    }
  };
  return (
    <View
      style={{
        flex: 1,
        marginTop: 10,
        padding: 20,
      }}
    >
      {/* <Image
        // resizeMode="contain"
        source={require("./images/LogoWG_nobg.png")}
        style={{
          alignSelf: "center",
          flex: 1,
          aspectRatio: 1,
          height: undefined,
          width: undefined,
        }}
      /> */}

      <TextInput
        placeholder={"Họ và tên"}
        value={fullName}
        onChangeText={setFullName}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
        disabled={disabled}
      />
      <TextInput
        placeholder={"Email"}
        value={email}
        onChangeText={setEmail}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
        disabled={disabled}
      />
      <TextInput
        keyboardType="numeric"
        placeholder={"Số điện thoại"}
        value={phone}
        onChangeText={setPhone}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
        maxLength={10}
        disabled={disabled}
      />
      <TextInput
        secureTextEntry={!showPass}
        placeholder={"Mật khẩu"}
        value={password}
        onChangeText={setPassword}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
        right={
          <TextInput.Icon
            icon={showPass ? "eye-off" : "eye"}
            onPress={() => setShowPass(!showPass)}
          />
        }
      />
      <TextInput
        secureTextEntry={!showPass}
        placeholder={"Nhập lại mật khẩu"}
        value={cpassword}
        onChangeText={setCPassword}
        activeUnderlineColor="#ff944d"
        style={{ marginBottom: 20, backgroundColor: "#fff", borderWidth: 1 }}
        right={
          <TextInput.Icon
            icon={showPass ? "eye-off" : "eye"}
            onPress={() => setShowPass(!showPass)}
          />
        }
      />
      <Button
        mode="contained"
        onPress={handleCreateAccount}
        textColor="#fff"
        style={{
          marginVertical: 10,
          padding: 5,
          backgroundColor: "#ff6600",
          borderRadius: 3,
        }}
      >
        <Text style={{ fontSize: 18 }}>Tạo tài khoản</Text>
      </Button>
    </View>
  );
}
