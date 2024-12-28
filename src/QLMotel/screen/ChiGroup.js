import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Icon, Text, TextInput, FAB, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useMyContextProvider } from "../store/index";
import Modal from "react-native-modal";

export default function ChiGroup({ navigation, route }) {
  const { onSelectGroup } = route.params || {};
  const [controller] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [tcGroupData, setTCGroupData] = useState([]);
  const [selectItem, setSelectItem] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("SERVICES");
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const TCGROUPS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("TCGROUPS");

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const renderItem = ({ item }) => {
    const { icon, name, canDelete } = item;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.itemContainer}
        onPress={() =>
          onSelectGroup
            ? onSelectGroup(item) && navigation.goBack()
            : canDelete
            ? openModal(item)
            : Alert.alert(
                "Thông báo",
                "Không thể xóa hoặc chỉnh sửa nhóm giao dịch mặc định của hệ thống!"
              )
        }
      >
        <View style={styles.itemContent}>
          <Icon source={icon} size={50} />
          <Text style={{ fontSize: 18, marginLeft: 8 }}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const loadGroup = TCGROUPS.where("type", "==", false).onSnapshot(
      (response) => {
        if (!response) {
          console.log("Response is null");
          return;
        }
        if (response.empty) {
          console.log("No data found");
          return;
        }
        const arr = [];
        response.forEach((doc) => {
          const data = doc.data();
          if (data.id != null) {
            arr.push(data);
          }
        });
        arr.sort((a, b) => {
          return a.createdAt.toDate() - b.createdAt.toDate(); // Sắp xếp theo thời gian
        });
        //setData(arr);
        setTCGroupData(arr);
      }
    );
    return () => loadGroup();
  }, [userLogin]);

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
    navigation.navigate("TCGroupDetail", { item: item });
  };
  const handleDeleteGroup = (item) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa nhóm giao dịch này không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => {
            setIsModalVisible(false);
            setSelectItem(null);
            TCGROUPS.doc(item.id)
              .delete()
              .then(() => {
                console.log("TCGroup deleted successfully");
              })
              .catch((e) => {
                console.log("Delete failed:", e.message);
                Alert.alert("Lỗi", "Xóa nhóm giao dịch thất bại: " + e.message);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{
          flex: 1,
        }}
        data={tcGroupData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddTCGroup")}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={{ bottom: 0, marginBottom: 0 }}>
          <View style={styles.modalContent}>
            <Button
              style={styles.mbutton}
              onPress={() => handleOpenDetail(selectItem)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Cập nhật</Text>
            </Button>
            <Button
              style={styles.mbutton}
              onPress={() => handleDeleteGroup(selectItem)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Xóa</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchInput: {
    margin: 10,
    backgroundColor: "none",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
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
  itemContainer: {
    marginTop: 10,
    padding: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 9,
  },
  itemContent: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 5,
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
