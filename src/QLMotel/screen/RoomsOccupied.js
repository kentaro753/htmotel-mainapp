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
import {
  Icon,
  IconButton,
  Text,
  TextInput,
  FAB,
  Button,
} from "react-native-paper";
import { login, useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import { useIsFocused } from "@react-navigation/native";

export default function RoomsOccupied({ navigation, route }) {
  const { onSelectRoom } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [name, setName] = useState("");
  const isFocused = useIsFocused();
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");

  //fetch
  useEffect(() => {
    if (isFocused) {
      ROOMS.where("state", "==", false).onSnapshot((response) => {
        var arr = [];
        response.forEach((doc) => {
          doc.data().id != null && arr.push(doc.data());
        });
        arr.sort((a, b) => a.roomName.localeCompare(b.roomName));
        setData(arr);
        setRoomData(arr);
      });
    }
  }, [isFocused]);
  useEffect(() => {
    setRoomData(data.filter((s) => s.roomName.includes(name)));
  }, [name]);
  const renderItem = ({ item }) => {
    const { roomName } = item;
    return (
      <TouchableOpacity
        style={styles.roomitem}
        onPress={() =>
          onSelectRoom
            ? onSelectRoom(item) && navigation.goBack()
            : navigation.navigate("RoomDetail", { item: item })
        }
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{roomName}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: "#4da6ff" }}>Đang thuê</Text>
          <Icon source="chevron-right" size={35} />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <TextInput
          left={<TextInput.Icon icon="magnify" />}
          label={"Tìm kiếm theo tên"}
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
        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{ color: "#000", fontWeight: "bold", fontSize: 20 }}
          >
            Tên phòng
          </Text>
          <Text
            variant="headlineSmall"
            style={{ color: "#000", fontWeight: "bold", fontSize: 20 }}
          >
            Trạng thái
          </Text>
        </View>
      </View>
      <FlatList
        style={{
          flex: 1,
        }}
        data={roomData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: 90 }}></View>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddRoom")}
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
  poster: {
    resizeMode: "center",
    height: 150,
    width: 150,
    borderRadius: 10,
  },
  txt: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 15,
    //color: '#fff',
  },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    //color: '#fff',
    marginBottom: 10,
  },
  roomitem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    height: 50,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    backgroundColor: "#00e600",
    position: "absolute",
    margin: 26,
    right: 0,
    bottom: 0,
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
