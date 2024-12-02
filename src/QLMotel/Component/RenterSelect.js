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

const RenterSelect = ({ onSelectRenter }) => {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [renterData, setRenterData] = useState([]);

  useEffect(() => {
    const loadRenter = firestore()
      .collection("USERS")
      .doc(userLogin.email)
      .collection("RENTERS")
      .onSnapshot(
        (response) => {
          const arr = [];
          response.forEach((doc) => {
            const data = doc.data();
            if (data.id != null) {
              arr.push(data);
            }
          });
          setRenterData(arr);
        },
        (error) => {
          console.error(error);
        }
      );
    return () => loadRenter();
  }, [userLogin]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onSelectRenter(item.id, item.name, item.cccd)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemSubText}>{item.cccd}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={renterData}
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
  itemSubText: {
    fontSize: 14,
    color: "#888",
  },
});

export default RenterSelect;
