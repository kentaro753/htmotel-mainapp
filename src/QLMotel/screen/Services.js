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

export default function Services({ navigation, route }) {
  const { onSelectTarget } = route.params || {};
  const [controller] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [name, setName] = useState("");
  const [selectItem, setSelectItem] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const SERVICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("SERVICES");
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("ROOMS");

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const renderItem = ({ item }) => {
    const { serviceName, icon, fee, chargeBase } = item;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.itemContainer}
        onPress={() =>
          onSelectTarget
            ? onSelectTarget(item) && navigation.goBack()
            : openModal(item)}
      >
        <View style={styles.itemContent}>
          <Icon source={icon} size={50} />
          <Text>{serviceName}</Text>
          <Text>
            {formatWithDots(fee.toString())} đ/{chargeBase}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    SERVICES.onSnapshot((response) => {
      const arr = [];
      response.forEach((doc) => {
        const data = doc.data();
        if (data.id != null) {
          arr.push(data);
        }
      });
      setData(arr);
      setServiceData(arr);
    });
  }, [userLogin]);

  useEffect(() => {
    setServiceData(data.filter((s) => s.serviceName.includes(name)));
  }, [name, data]);

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
    navigation.navigate("ServiceDetail", { item: item });
  };
  const handleDeleteService = (item) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa dịch vụ không?",
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
            SERVICES.doc(item.id)
              .delete()
              .then(() => {
                console.log("Service deleted successfully");
                if (item.rooms.length !== 0) {
                  const batch = firestore().batch();
                  const rooms = item.rooms;

                  rooms.forEach((roomId) => {
                    const roomRef = ROOMS.doc(roomId);
                    batch.update(roomRef, {
                      services: firestore.FieldValue.arrayRemove({
                        id: item.id,
                        chargeType: item.chargeType,
                      }),
                    });
                  });

                  return batch.commit();
                }
              })
              .catch((e) => {
                console.log("Delete failed:", e.message);
                Alert.alert("Lỗi", "Xóa dịch vụ thất bại: " + e.message);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        left={<TextInput.Icon icon="magnify" />}
        label={"Tìm kiếm theo tên"}
        underlineColor="transparent"
        value={name}
        onChangeText={setName}
        style={styles.searchInput}
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>Danh sách dịch vụ</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.flatListContent}
        numColumns={3}
        data={serviceData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate("AddService")}
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
              onPress={() => handleDeleteService(selectItem)}
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
  flatListContent: {
    flex: 1,
    // flexDirection:"row",
    // flexWrap:"wrap",
    // paddingHorizontal: 10,
    // paddingVertical: 5,
    // alignItems:"center",
    justifyContent: "flex-start",
  },
  itemContainer: {
    marginBottom: 6,
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderRadius: 15,
    width: Dimensions.get("window").width / 2.91 - 10,
    aspectRatio: 1,
    justifyContent: "center",
  },
  itemContent: {
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
