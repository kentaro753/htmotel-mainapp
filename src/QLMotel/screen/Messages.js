import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, Avatar, TextInput, FAB, Button } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";

export default function Messages({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [renterData, setRenterData] = useState([]);
  const [name, setName] = useState("");

  //fetch
  useEffect(() => {
    if (userLogin) {
      const RENTERS = firestore()
        .collection("USERS")
        .doc(userLogin?.email)
        .collection("RENTERS");
      RENTERS.onSnapshot((response) => {
        var arr = [];
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null && data.account) {
            const USER = firestore().collection("USERS");
            USER.doc(data.email).onSnapshot((response) => {
              const udata = response.data();
              arr.push({ ...data, avatar: udata?.avatar || "" });
            });
          }
        });
        setData(arr);
        setRenterData(arr);
      });
    }
  }, []);
  useEffect(() => {
    setRenterData(
      data.filter(
        (s) =>
          s.fullName.includes(name) ||
          s.room.name.includes(name) ||
          s.phone.includes(name)
      )
    );
  }, [name]);

  const renderItem = ({ item }) => {
    const { fullName, phone, avatar, id, email } = item;
    //console.log(userLogin?.email + "_" + id)
    return (
      <TouchableOpacity
        style={styles.roomitem}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            id: userLogin?.email + "_" + email,
            phone: phone,
            fullName: fullName,
          })
        }
      >
        <Avatar.Image
          borderWidth={0.5}
          backgroundColor="white"
          size={60}
          source={{
            uri: avatar || "https://example.com/default-avatar.png",
          }}
        />
        <View style={{ alignItems: "flex-start", marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{fullName}</Text>
          <Text style={{ fontSize: 17, color: "#b3b3b3" }}>{phone}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <TextInput
          label={"Tìm kiếm"}
          underlineColor="transparent"
          value={name}
          onChangeText={setName}
          underlineStyle={0}
          style={{
            margin: 10,
            backgroundColor: "none",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderWidth: 1,
            borderColor: "grey",
          }}
        />
        <View style={styles.header}>
          <Text style={styles.headerText}>Danh sách người thuê</Text>
        </View>
      </View>
      <FlatList
        style={{
          flex: 1,
        }}
        data={renterData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  flatlst: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
    paddingRight: 0,
  },
  headerText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
  txt: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 15,
  },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  roomitem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 80,
    padding: 10,
    alignItems: "center",
  },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: "#cce6ff",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  mbutton: {
    width: "90%",
    margin: 5,
    borderWidth: 0.9,
    borderColor: "#1a75ff",
    fontSize: 18,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
});
