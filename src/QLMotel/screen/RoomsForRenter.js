import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon, Text, TextInput, FAB, Button } from "react-native-paper";
import { login, useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";

export default function RoomsForRenter({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [name, setName] = useState("");
  const [selectItem, setSelectItem] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkedServices, setCheckedServices] = useState([]);
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.admin)
    .collection("ROOMS");
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin.admin)
    .collection("SERVICES");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.admin)
    .collection("RENTERS");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.admin)
    .collection("CONTRACTS");
  //fetch
  useEffect(() => {
    RENTERS.doc(userLogin.renterId).onSnapshot((renter) => {
      const data = renter.data();
      Promise.all(
        data.contracts.map((contract) =>
          CONTRACTS.doc(contract)
            .get()
            .then((response) => {
              const cdata = response.data();
              return ROOMS.doc(cdata.room.id).get();
            })
        )
      )
        .then((rooms) => {
          const validRooms = rooms
            .map((room) => room.data())
            .filter((room) => room && room.id);
          setData(validRooms);
          setRoomData(validRooms);
          console.log(validRooms.length);
        })
        .catch((error) => console.log("Error fetching rooms:", error))
    });
  }, []);
  useEffect(() => {
    setRoomData(data.filter((s) => s.roomName.includes(name)));
  }, [name]);
  const renderItem = ({ item }) => {
    const { roomName, state } = item;
    return (
      <TouchableOpacity style={styles.roomitem} onPress={() => navigation.navigate("RDForRenter", { id: item.contract })}>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>{roomName}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {state ? (
            <Text style={{ fontSize: 18, color: "#ff1a1a" }}>Trống</Text>
          ) : (
            <Text style={{ fontSize: 18, color: "#4da6ff" }}>Đang thuê</Text>
          )}
          <Icon source="chevron-right" size={35} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ backgroundColor: "white" }}>
        <TextInput
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
