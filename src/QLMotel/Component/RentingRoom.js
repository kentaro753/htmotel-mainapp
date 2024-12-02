import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useMyContextProvider } from "../store/index";
import { renderToString } from "react-dom/server";

const RentingRoom = ({ onSelectRoom }) => {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    const loadRoom = firestore()
      .collection("USERS")
      .doc(userLogin.email)
      .collection("ROOMS")
      .where("state", "==", true)
      .onSnapshot(
        (response) => {
          const arr = [];
          response.forEach((doc) => {
            const data = doc.data();
            if (data.id != null) {
              arr.push(data);
            }
          });
          setRoomData(arr);
        },
        (error) => {
          console.error(error);
        }
      );
    return () => loadRoom();
  }, [userLogin]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onSelectRoom(item.id, item.name, item.contract)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={roomData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 18,
  },
});

export default RentingRoom;
