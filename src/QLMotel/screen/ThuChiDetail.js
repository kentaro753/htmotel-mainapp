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
import { Button, IconButton, Text } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import PanPinImage from "../Component/PanPinImage";

export default function ThuChiDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [data, setData] = useState({});
  const [money, setMoney] = useState(0);
  const [selectGroup, setSelectGroup] = useState("");
  const [target, setTarget] = useState({ id: "", name: "", table: "" });
  const [type, setType] = useState(true);
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [note, setNote] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [selectImage, setSelectImage] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { userLogin } = controller;
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("THUCHIS");
  const handleDeleteThuChi = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa giao dịch này không?",
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
              // Xóa ảnh trên Firebase Storage
              const deleteImages = async () => {
                const deletePromises = [];
                for (let i = 1; i <= 3; i++) {
                  const refImage = storage().ref(`/images/${id}-image${i}.jpg`);
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

              await deleteImages();

              // Xóa dữ liệu giao dịch trên Firestore
              await THUCHIS.doc(id).delete();
              console.log("Giao dịch deleted successfully");

              navigation.goBack();
            } catch (error) {
              console.error("Delete failed:", error.message);
              Alert.alert("Lỗi", "Xóa giao dịch thất bại: " + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  useEffect(() => {
    const loadthuchi = THUCHIS.doc(id).onSnapshot((response) => {
      const data = response.data();
      if (data) {
        const [sDay, sMonth, sYear] = data.date.split("/").map(Number);
        setData(data);
        setDate(data.date);
        setDay(sDay);
        setMonthYear(sMonth + "/" + sYear);
        setMoney(data.money);
        setType(data.type);
        setNote(data.note);
        setImages(data.images);
        setImageCount(data.images.length);
        setSelectGroup(data.group);
        setTarget(data.target);
      }
    });

    return () => {
      loadthuchi();
    };
  }, []);
  useLayoutEffect(() => {
    if (date != "") {
      navigation.setOptions({
        headerRight: (props) => (
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="square-edit-outline"
              //{...props}
              onPress={() =>
                navigation.navigate("ThuChiUpdate", { item: data })
              }
              iconColor="white"
            />
          </View>
        ),
      });
    }
  }, [date]);

  const openModal = (url) => {
    setSelectImage(url);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setSelectImage("");
    setIsModalVisible(false);
  };

  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const getWeekday = (dateString) => {
    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day); // Tháng trong Date bắt đầu từ 0

    // Mảng các ngày trong tuần
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Lấy chỉ số ngày trong tuần và ánh xạ đến tên ngày
    return weekdays[date.getDay()];
  };
  const renderImage = ({ item }) => {
    const { url } = item;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            ...styles.itemContainer,
            width: Dimensions.get("window").width / 3.13 - 10,
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
          <View style={{ alignItems: "center", alignItems: "flex-start" }}>
            <View
              style={{
                ...styles.detailRow,
                borderBottomWidth: 1,
                paddingBottom: 9,
              }}
            >
              <View style={{ ...styles.detailLabel, flexDirection: "row" }}>
                <Text
                  style={{
                    color: "orange",
                    fontSize: 34,
                    width: 40,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {day}
                </Text>
                <View>
                  <Text
                    style={{
                      fontSize: 17,
                    }}
                  >
                    {getWeekday(date)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 17,
                    }}
                  >
                    tháng {monthYear}
                  </Text>
                </View>
              </View>
              <View style={styles.detailValue}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 19,
                    color: type ? "#000" : "red",
                    top: 10,
                  }}
                >
                  {formatWithDots(money.toString())} đ
                </Text>
              </View>
            </View>
            {renderDetailRow("Nhóm", type ? "Khoản thu" : "Khoản chi")}
            {renderDetailRow("Loại", selectGroup)}
            {renderDetailRow(
              target.table == "ROOMS"
                ? "Phòng"
                : target.table == "SERVICES"
                ? "Dịch vụ"
                : target.table == "RENTERS"
                ? "Người thuê"
                : "Không có đối tượng",
              target.name
            )}
            {renderDetailRow("Ghi chú", note)}
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
            Ảnh giao dịch {imageCount}/3
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
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleDeleteThuChi}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Xóa giao dịch
          </Text>
        </Button>
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
