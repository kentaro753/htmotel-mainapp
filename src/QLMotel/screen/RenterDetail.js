import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { Avatar, Button, IconButton, Text } from "react-native-paper";
import { deleteAccountRenter, useMyContextProvider } from "../store/index";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import PanPinImage from "../Component/PanPinImage";

export default function RenterDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [renter, setRenter] = useState([]);
  const [room, setRoom] = useState([]);
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [cccd, setCccd] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [thuongtru, setThuongtru] = useState("");
  const [active, setActive] = useState(false);
  const [account, setAccount] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [selectImage, setSelectImage] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { userLogin } = controller;
  const ROOMS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("ROOMS");
  const RENTERS = firestore()
    .collection("USERS")
    .doc(userLogin?.email)
    .collection("RENTERS");
  const handleThanhLyRenter = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn thanh lý người thuê này không?",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              if (renter.contracts.length === 0) {
                // Xóa ảnh trên Firebase Storage
                const deleteImages = async () => {
                  const deletePromises = [];
                  for (let i = 1; i <= 2; i++) {
                    const refImage = storage().ref(
                      `/images/${id}-image${i}.jpg`
                    );
                    deletePromises.push(
                      refImage.delete().catch((error) => {
                        // Bỏ qua lỗi nếu ảnh không tồn tại
                        if (error.code !== "storage/object-not-found") {
                          console.error("Lỗi khi xóa ảnh:", error);
                        }
                      })
                    );
                  }
                  await Promise.all(deletePromises);
                };
                if (account) {
                  await RENTERS.doc(id).update({ account: false });
                  await deleteImages();
                  await deleteAccountRenter(email, userLogin?.email, id);
                }
                // Xóa dữ liệu giao dịch trên Firestore
                if (room.id == "") {
                  await RENTERS.doc(id).update({
                    active: false,
                    images: [],
                  });
                } else {
                  await ROOMS.doc(room.id).update({
                    renters: firestore.FieldValue.arrayRemove(id),
                  });
                  await RENTERS.doc(id).update({
                    active: false,
                    room: { contract: "", id: "", name: "" },
                    images: [],
                  });
                }
                await setAccount(false);
                console.log("Người thuê thanh lý successfully");
                navigation.goBack();
              } else {
                Alert.alert(
                  "Thông báo",
                  "Người thuê này vẫn còn trong hợp đồng thuê phòng!"
                );
              }
            } catch (error) {
              console.error("Delete failed:", error.message);
              Alert.alert("Lỗi", "Thanh lý thất bại: " + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleDeleteRenterAccount = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa tài khoản của người thuê này không? \nHành động này bao gồm xóa lịch sử tin nhắn với người thuê này!",
      [
        {
          text: "Không",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              await RENTERS.doc(id).update({ account: false });
              await deleteAccountRenter(email, userLogin?.email, id);
              await setAccount(false);
              console.log("Xóa tài khoản người thuê successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Delete failed:", error.message);
              Alert.alert("Lỗi", "Xóa tài khoản thất bại: " + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  useEffect(() => {
    const loadrenter = RENTERS.doc(id).onSnapshot((response) => {
      const data = response.data();
      setRenter(data);
      setActive(data.active);
      setRoom(data.room);
      setFullName(data.fullName);
      setCccd(data.cccd);
      setPhone(data.phone);
      setThuongtru(data.thuongtru);
      setPhone(data.phone);
      setSex(data.sex);
      setEmail(data.email);
      setAccount(data.account);
      try {
        if (data.account && data.email) {
          const USER = firestore().collection("USERS");
          USER.doc(data.email).onSnapshot((response) => {
            if (response.exists && response.data()) {
              const udata = response.data();
              setAvatar(udata.avatar || "");
            } else {
              setAvatar("");
            }
          });
        } else {
          console.warn("Dữ liệu không hợp lệ:", data);
          setAvatar(""); // Avatar mặc định
        }
      } catch (error) {
        console.error("Lỗi khi truy cập dữ liệu:", error);
        setAvatar(""); // Avatar mặc định khi gặp lỗi
      }
      setImages(data.images);
      if (data.images) {
        setImageCount(data.images.length);
      }
    });
    return () => {
      loadrenter();
    };
  }, []);
  useLayoutEffect(() => {
    if (active) {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="square-edit-outline"
              onPress={() =>
                navigation.navigate("RenterUpdate", { item: renter })
              }
              iconColor="white"
            />
          </View>
        ),
      });
    }
  }, [active]);
  const openModal = (url) => {
    setSelectImage(url);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setSelectImage("");
    setIsModalVisible(false);
  };

  const renderImage = ({ item }) => {
    const { url } = item;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            ...styles.itemContainer,
            width: Dimensions.get("window").width / 2.12 - 10,
            justifyContent: "flex-start",
            overflow: "hidden",
            borderWidth: 0,
          }}
          onPress={() => openModal(url)}
        >
          <Image
            source={{
              uri: url,
            }}
            style={{
              height: "100%",
              alignItems: "center",
              width: "100%",
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Text style={styles.detailText}>{label}</Text>
      </View>
      <View style={styles.detailValue}>
        <Text style={styles.detailValueText}>{value}</Text>
      </View>
    </View>
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 5,
            padding: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15,
            marginBottom: 5,
            marginHorizontal: 10,
            borderRadius: 8,
          }}
        >
          {account ? (
            <Avatar.Image
              borderWidth={0.5}
              backgroundColor="white"
              size={100}
              source={{
                uri:
                  avatar ||
                  "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
              }}
            />
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: active ? "#ff3300" : "#999999",
                alignSelf: "center",
                marginVertical: 20,
              }}
              onPress={() =>
                navigation.navigate("Register", {
                  item: renter,
                  admin: userLogin?.email,
                })
              }
              disabled={!active}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  margin: 10,
                  color: "#fff",
                }}
              >
                {active ? "Tạo tài khoản người thuê" : "Người thuê đã thanh lý"}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 18, fontWeight: "bold", margin: 10 }}>
            {fullName}
          </Text>
        </View>
        {account && (
          <TouchableOpacity
            style={{
              backgroundColor: "red",
              alignSelf: "center",
              marginTop: 5,

              borderRadius: 10,
            }}
            onPress={handleDeleteRenterAccount}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                margin: 10,
                color: "#fff",
              }}
            >
              Xóa tài khoản
            </Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 5,
            padding: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15,
            marginBottom: 5,
            marginHorizontal: 10,
            borderRadius: 8,
          }}
        >
          <View style={{ alignItems: "center", alignItems: "flex-start" }}>
            {renderDetailRow("Số điện thoại", phone)}
            {renderDetailRow("CCCD", cccd)}
            {renderDetailRow("Email", email)}
            {renderDetailRow("Thường trú", thuongtru)}
            {renderDetailRow("Phòng", room.id ? room.name : "Chưa cấp phòng")}
          </View>
        </View>

        <View
          style={{
            height: 50,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text variant="headlineSmall" style={styles.txt}>
            Ảnh CCCD {imageCount}/2
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            height: 151,
            marginHorizontal: 8,
            marginVertical: 8,
            padding: 7,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
          }}
        >
          {imageCount >= 1 ? (
            <FlatList
              contentContainerStyle={{
                flex: 1,
                alignSelf: "flex-start",
                marginTop: 10,
              }}
              numColumns={3}
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderImage}
              scrollEnabled={false}
            />
          ) : (
            <Text style={{ textAlign: "center", fontSize: 20, color: "grey" }}>
              Không có hình ảnh
            </Text>
          )}
        </View>
        {active ? (
          <Button
            style={{
              backgroundColor: "#ff3300",
              width: "50%",
              alignSelf: "center",
              marginVertical: 20,
            }}
            onPress={handleThanhLyRenter}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Thanh lý
            </Text>
          </Button>
        ) : (
          <Button
            style={{
              backgroundColor: "#00e600",
              width: "50%",
              alignSelf: "center",
              marginVertical: 20,
            }}
            onPress={() => {
              RENTERS.doc(id).update({ active: true });
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Tái kích hoạt
            </Text>
          </Button>
        )}
      </View>
      <PanPinImage
        image={selectImage} // Thay bằng đường dẫn ảnh của bạn
        isModalVisible={isModalVisible}
        onClose={closeModal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  flatlst: {
    flex: 1,
  },
  txt: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    backgroundColor: "#ffaa80",
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  modalContent: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  itemContainer: {
    marginBottom: 6,
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderRadius: 15,
    width: Dimensions.get("window").width / 3 - 10, // Điều chỉnh kích thước cho phù hợp
    aspectRatio: 1,
    justifyContent: "center",
  },
  itemContent: {
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  detailLabel: {
    width: "40%",
    alignItems: "flex-start",
  },
  detailValue: {
    width: "60%",
    alignItems: "flex-end",
  },
  detailText: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#000",
  },
  detailValueText: {
    fontSize: 17,
    color: "#000",
  },
  image: {
    width: 300,
    height: 300,
  },
});
