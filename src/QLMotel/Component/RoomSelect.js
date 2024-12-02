import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useMyContextProvider } from "../store/index";

const RoomSelect = ({ item, onSelect }) => {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const renterCount = item.renters ? item.renters.length : 0;
  const [data, setData] = useState({});
  const contractId = item.contract;
  const canAdd = item.maxPeople - renterCount > 0;
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");
  useEffect(() => {
    const loadContract = CONTRACTS.doc(contractId).onSnapshot((response) => {
      setData(response.data());
    });
    return () => loadContract();
  }, [contractId]);

  return (
    <TouchableOpacity
      style={[
        styles.roomitem,
        { backgroundColor: canAdd ? "white" : "#e0e0e0" },
      ]}
      disabled={!canAdd}
      onPress={() => onSelect(item.id, item.roomName, item.contract)}
    >
      <View style={{ alignItems: "flex-start", width: "60%" }}>
        <Text style={{ fontWeight: "bold", fontSize: 19, color: "#ff9900" }}>
          {item.roomName}
        </Text>
        <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
          {data.renter && data.renter.name}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", width: "40%" }}>
        <Text style={{ fontSize: 19 }}>
          {renterCount}/{item.maxPeople}
        </Text>
        {!canAdd && (
          <Text style={{ fontSize: 15, color: "red" }}>
            Đã đạt tối đa số người
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomitem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 80,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default RoomSelect;
