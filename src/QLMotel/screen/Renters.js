import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput, FAB, Button } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import Modal from "react-native-modal";

export default function Renters({ navigation, route }) {
  const { onSelectRenter } = route.params || {};
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [renterData, setRenterData] = useState([]);
  const [name, setName] = useState("");
  const [selectItem, setSelectItem] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("RENTERS");

  //fetch
  useEffect(() => {
    RENTERS.onSnapshot((response) => {
      var arr = [];
      response.forEach((doc) => {
        doc.data().id != null && arr.push(doc.data());
      });
      setData(arr);
      setRenterData(arr);
    });
  }, []);
  useEffect(() => {
    setRenterData(
      data.filter(
        (s) => s.fullName.includes(name) || s.room.name.includes(name)
      )
    );
  }, [name]);

  const renderItem = ({ item }) => {
    const { fullName, phone, contracts, room } = item;
    const isMainTenant = contracts.includes(room.contract);

    return (
      <TouchableOpacity
        style={styles.roomitem}
        onPress={() =>
          onSelectRenter ? onSelectRenter(item) : navigation.navigate("RenterDetail", { item: item })
        }
      >
        <View style={{ alignItems: "flex-start", width: "60%" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{fullName}</Text>
          <Text style={{ fontSize: 17, color: "#b3b3b3" }}>{phone}</Text>
        </View>

        <View style={{ alignItems: "flex-end", width: "40%" }}>
          {room.id === "" ? (
            <Text style={{ fontSize: 18, color: "#ff1a1a" }}>
              Chưa cấp phòng
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 19, color: "#ff9900" }}>
                {room.name}
              </Text>
              {isMainTenant ? (
                <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
                  Người thuê chính
                </Text>
              ) : (
                <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
                  Người ở chung
                </Text>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const openModal = (item) => {
    setIsModalVisible(true);
    setSelectItem(item);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectItem(null);
  };
  const handleOpenDetail = (item) => {
    setIsModalVisible(false);
    setSelectItem(null);
    navigation.navigate("RenterDetail", { item: item });
  };
  const handleDeleteRenter = (item) => {
    setIsModalVisible(false);
    setSelectItem(null);
    if (item.contracts.length === 0) {
      // Kiểm tra nếu contracts là mảng trống
      RENTERS.doc(item.id)
        .delete()
        .then(() => {
          console.log("Renter deleted successfully");
          if (item.room.id != "") {
            ROOMS.doc(item.room.id)
              .update({
                renters: firestore.FieldValue.arrayRemove(item.id),
              })
              .then(() => {
                console.log("Renter removed from room successfully");
                // Cập nhật lại danh sách người thuê sau khi xóa
                setRenterData((prevData) =>
                  prevData.filter((renter) => renter.id !== item.id)
                );
                setData((prevData) =>
                  prevData.filter((renter) => renter.id !== item.id)
                );
              })
              .catch((e) => {
                console.log("Failed to update room:", e.message);
                Alert.alert("Lỗi", "Không thể cập nhật phòng: " + e.message);
              });
          }
        })
        .catch((e) => {
          console.log("Delete failed:", e.message);
          Alert.alert("Lỗi", "Xóa người thuê thất bại: " + e.message);
        });
    } else {
      Alert.alert(
        "Thông báo",
        "Người thuê này vẫn còn trong hợp đồng thuê phòng!"
      );
    }
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
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddRenter")}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={{ bottom: 0, marginBottom: 0 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              <Button
                style={styles.mbutton}
                onPress={() => handleOpenDetail(selectItem)}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Cập nhật
                </Text>
              </Button>
              <Button
                style={styles.mbutton}
                onPress={() => handleDeleteRenter(selectItem)}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Xóa</Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
