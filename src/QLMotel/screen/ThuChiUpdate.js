import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import ImageCropPicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";
import DatePicker from "react-native-date-picker";
import moment from "moment";

export default function ThuChiUpdate({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [displayText, setDisplayText] = useState("");
  const [data, setData] = useState({});
  const [money, setMoney] = useState(0);
  const [selectGroup, setSelectGroup] = useState("");
  const [target, setTarget] = useState({ id: "", name: "", table: "" });
  const [type, setType] = useState(true);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [images, setImages] = useState([]);
  const [isGroupSelectVisible, setIsGroupSelectVisible] = useState(false);
  const [isTargetSelectVisible, setIsTargetSelectVisible] = useState(false);
  const { userLogin } = controller;
  const THUCHIS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("THUCHIS");
    const handleUpdateThuChi = async () => {
      try {
        if (selectGroup === "") {
          Alert.alert("Chưa chọn nhóm giao dịch!");
        } else if (money <= 0) {
          Alert.alert("Khoản giao dịch không được nhỏ hơn hoặc bằng 0!");
        } else if (target.table != "" && target.id == "") {
          Alert.alert("Chưa chọn đối tượng!");
        } else {
          await THUCHIS.doc(id)
            .update({
              date: date.toLocaleDateString("vi"),
              money,
              type,
              note,
              group: selectGroup,
              target,
            })
            .then(async () => {
              let upImage = [];
    
              if (imageCount !== 0) {
                const uploadPromises = images.map(async (image, index) => {
                  const position = index + 1; // Vị trí hiện tại của ảnh trong danh sách
                  const refImage = storage().ref(`/images/${id}-image${position}.jpg`);
    
                  if (image.url.startsWith("https://")) {
                    // Tải dữ liệu từ URL cũ
                    try {
                      const response = await fetch(image.url);
                      const blob = await response.blob();
    
                      // Tải lên vị trí mới trong Firebase
                      await refImage.put(blob);
                      const link = await refImage.getDownloadURL();
    
                      // Cập nhật URL mới
                      upImage.push({ url: link });
                    } catch (e) {
                      console.error("Lỗi khi sao chép ảnh cũ:", e.message);
                    }
                  } else {
                    // Tải ảnh mới lên Firebase
                    try {
                      await refImage.putFile(image.url);
                      const link = await refImage.getDownloadURL();
                      upImage.push({ url: link });
                    } catch (e) {
                      console.error("Lỗi khi tải lên ảnh mới:", e.message);
                    }
                  }
                });
    
                // Chờ tất cả ảnh được xử lý
                await Promise.all(uploadPromises);
    
                // Cập nhật danh sách ảnh lên Firestore
                await THUCHIS.doc(id).update({ images: upImage });
              }
            })
            .then(() => {
              Alert.alert("Cập nhật giao dịch thành công");
              navigation.goBack();
            })
            .catch((e) => {
              Alert.alert(e.message);
            });
        }
      } catch (e) {
        Alert.alert(e.message);
      }
    };

  useEffect(() => {
    const loadthuchi = THUCHIS.doc(id).onSnapshot((response) => {
      const data = response.data();
      if (data) {
        setData(data);
        setDate(stringToDate(data.date));
        setMoney(data.money);
        setDisplayText(formatWithDots(data.money.toString()));
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

  const handleUploadImage = () => {
    ImageCropPicker.openPicker({
      mediaType: "photo",
      cropping: true,
    })
      .then((pic) => {
        setImages((images) => [...images, { url: pic.path }]);
        setImageCount(imageCount + 1);
        console.log(images);
      })
      .catch((e) => console.log(e.message));
  };
  const handleImageExclude = (item) => {
    setImages((prev) => prev.filter((image) => image !== item));
    setImageCount(imageCount - 1);
  };
  const toggleGroupSelect = () => {
    setIsGroupSelectVisible(!isGroupSelectVisible);
    if (!isGroupSelectVisible) {
      navigation.navigate("TTabTCGroup", {
        onSelectGroup: (group) => {
          console.log(group);
          setSelectGroup(group.name);
          setType(group.type);
          if (group.target != "Không") {
            setTarget({ id: "", name: "", table: group.target });
          } else {
            setTarget({ id: "", name: "", table: "" });
          }
          setIsGroupSelectVisible(false);
          navigation.goBack();
        },
      });
    }
  };
  const toggleTargetSelect = () => {
    setIsTargetSelectVisible(!isTargetSelectVisible);
    if (!isTargetSelectVisible) {
      if (target.table == "ROOMS") {
        navigation.navigate("Rooms", {
          onSelectTarget: (room) => {
            setTarget({
              id: room.id,
              name: room.roomName,
              table: target.table,
            });
            console.log(target);
            setIsTargetSelectVisible(false);
            navigation.goBack();
          },
        });
      } else if (target.table == "SERVICES") {
        navigation.navigate("Services", {
          onSelectTarget: (service) => {
            setTarget({
              id: service.id,
              name: service.serviceName,
              table: target.table,
            });
            console.log(target);
            setIsTargetSelectVisible(false);
            navigation.goBack();
          },
        });
      } else if (target.table == "RENTERS") {
        navigation.navigate("Renters", {
          onSelectRenter: (renter) => {
            setTarget({
              id: renter.id,
              name: renter.fullName,
              table: target.table,
            });
            console.log(target);
            setIsTargetSelectVisible(false);
            navigation.goBack();
          },
        });
      }
    }
  };
  const formatWithDots = (text) => {
    let numericText = text.replace(/\D/g, "");
    return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const stringToDate = (dateString) => {
    return moment(dateString, "DD/MM/YYYY").toDate();
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
        <IconButton
          icon="minus-box"
          size={40}
          style={{ top: -19, position: "absolute", right: -16 }}
          iconColor="red"
          onPress={() => handleImageExclude(item)}
        />
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <TextInput
          keyboardType="numeric"
          placeholder="0đ"
          underlineColor="transparent"
          value={displayText}
          onChangeText={(text) => {
            const numericValue = text.replace(/\D/g, "");
            setMoney(Number(numericValue));
            setDisplayText(formatWithDots(text));
          }}
          style={{
            ...styles.txtInput,
            textAlign: "center",
            fontSize: 40,
            paddingTop: 12,
          }}
        />
        <Text variant="headlineSmall" style={styles.txt}>
          Nhóm giao dịch <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TouchableOpacity onPress={toggleGroupSelect}>
          <Text style={styles.selectionText}>
            {selectGroup || "Chưa chọn nhóm giao dịch"}
          </Text>
        </TouchableOpacity>

        <Text variant="headlineSmall" style={styles.txt}>
          Ngày giao dịch <Text style={{ color: "red" }}>*</Text>
        </Text>
        <View style={{ margin: 10, marginHorizontal: 15 }}>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => setOpen(true)}
          >
            <Text style={{ fontSize: 19 }}>
              {date.toLocaleDateString("vi")}{" "}
            </Text>
            <Icon source="calendar-month" size={25} />
          </TouchableOpacity>
        </View>
        <DatePicker
          title="Ngày giao dịch"
          confirmText="Chọn"
          cancelText="Hủy"
          mode="date"
          locale="vi"
          modal
          open={open}
          date={date}
          onConfirm={(date) => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
        {target.table != "" ? (
          <View>
            <Text variant="headlineSmall" style={styles.txt}>
              Đối tượng <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TouchableOpacity onPress={toggleTargetSelect}>
              <Text style={styles.selectionText}>
                {target.table == "ROOMS"
                  ? "Phòng"
                  : target.table == "SERVICES"
                  ? "Dịch vụ"
                  : target.table == "RENTERS"
                  ? "Người thuê"
                  : ""}{" "}
                - {target.name || "Chưa chọn đối tượng"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
          <IconButton
            icon="plus-circle"
            size={40}
            style={{ top: 5 }}
            iconColor="#00e600"
            onPress={handleUploadImage}
            disabled={imageCount == 3}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
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
            //showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        <Text variant="headlineSmall" style={styles.txt}>
          Ghi chú
        </Text>
        <TextInput
          placeholder="Ghi chú"
          underlineColor="transparent"
          value={note}
          onChangeText={setNote}
          style={styles.txtInput}
          multiline={true}
        />
        <Button
          style={{
            backgroundColor: "#ff3300",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={handleUpdateThuChi}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Cập nhật</Text>
        </Button>
      </View>
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
  txtInput: {
    margin: 10,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
  },
  selectionText: {
    fontSize: 17,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 10,
    borderRadius: 5,
  },
  btnMore: {},
  footer: {
    height: 50,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
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
});
