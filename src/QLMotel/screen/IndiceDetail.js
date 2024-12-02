import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Button, Icon, IconButton, Text, TextInput } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import ServiceIcon from "../Component/ServiceIcon";
import DatePicker from "react-native-date-picker";
import moment from "moment";

export default function IndiceDetail({ navigation, route }) {
  const { id } = route.params.item;
  const [controller, dispatch] = useMyContextProvider();
  const [service, setService] = useState([]);
  // const [includeService, setIncludeService] = useState([]);
  const [serviceIndices, setServiceIndices] = useState({});
  const [indiceData, setIndiceData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isBill, setIsBill] = useState(false);
  const [contractId, setContractId] = useState("");
  const [datetime, setDatetime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const { userLogin } = controller;

  const INDICES = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("INDICES");
  const CONTRACTS = firestore()
    .collection("USERS")
    .doc(userLogin.email)
    .collection("CONTRACTS");

  useEffect(() => {
    const loadIndice = INDICES.doc(id).onSnapshot(
      (response) => {
        const data = response.data();
        setIndiceData(data);
        setIsEditable(data.editable);
        setIsBill(data.isBill);
        setDatetime(new Date(stringToDate(data.createDay)));
        setService(data.services);
        setServiceIndices(
          data.services.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {})
        );
        CONTRACTS.where("room.id", "==", data.room.id)
          .where("active", "==", true)
          .onSnapshot((querySnapshot) => {
            if (!querySnapshot.empty) {
              const cdata = querySnapshot.docs[0].data();
              setContractId(data.id);
            }
          });
      },
      (error) => {
        console.error(error);
      }
    );
    return () => loadIndice();
  }, [id]);

  // useEffect(() => {
  //   if (service && service.length > 0) {
  //     const arr = [];
  //     service.forEach(({ id }, index) => {
  //       SERVICES.doc(id).onSnapshot((response) => {
  //         const temp = response.data();
  //         arr.push({ ...temp, index });
  //         if (index === service.length - 1) {
  //           setIncludeService(arr);
  //         }
  //       });
  //     });
  //   }
  // }, [service]);
  useEffect(() => {});

  const handleInputChange = (serviceId, key, value) => {
    setServiceIndices((prevState) => ({
      ...prevState,
      [serviceId]: {
        ...prevState[serviceId],
        [key]: value,
      },
    }));
  };

  const stringToDate = (dateString) => {
    return moment(dateString, "DD/MM/YYYY").toDate();
  };
  const checking = () => {
    console.log(serviceIndices);
  };
  const handleUpdateIndice = () => {
    let tempLoi = 0;
    const servicesData = service.map((service) => {
      const currentServiceIndices = serviceIndices[service.id] || {};
      return {
        ...currentServiceIndices,
        id: service.id,
        chargeType: service.chargeType,
      };
    });

    const updatedIndiceData = {
      ...indiceData,
      createDay: datetime.toLocaleDateString("en-GB"),
      services: servicesData,
    };
    service.forEach((service) => {
      const currentServiceIndices = serviceIndices[service.id] || {};

      if (
        service.chargeType === 1 &&
        currentServiceIndices.newValue < currentServiceIndices.oldValue
      ) {
        tempLoi = 1;
      }
      if (
        (service.chargeType === 4 || service.chargeType === 5) &&
        currentServiceIndices.indexValue < 0
      ) {
        tempLoi = 2;
      }
    });
    console.log(tempLoi);
    if (tempLoi == 0) {
      INDICES.doc(indiceData.id)
        .update(updatedIndiceData)
        .then(() => {
          Alert.alert("Thành công", "Dữ liệu đã được cập nhật");
          navigation.goBack();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật dữ liệu");
        });
    } else if (tempLoi == 1) {
      Alert.alert("Lỗi", "Chỉ số mới không được nhỏ hơn chỉ số cũ");
    } else if (tempLoi == 2) {
      Alert.alert("Lỗi", "Giá trị chỉ số không được nhỏ hơn 0");
    }
  };

  const renderItem = ({ item }) => {
    const { serviceName, icon, fee, chargeBase, chargeType, roomName } = item;
    const currentServiceIndices = serviceIndices[item.id] || {};

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontWeight: "bold", fontSize: 15, marginRight: 10 }}>
              {serviceName}
            </Text>
            <Text>
              {fee} đ/{chargeBase}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Icon source={icon} size={65} />
            {chargeType === 1 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "67%",
                }}
              >
                <View>
                  <Text>Chỉ số cũ</Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.oldValue?.toString() || "0"}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "oldValue", text)
                    }
                    style={styles.txtInput}
                    disabled={true}
                  />
                </View>
                <View>
                  <Text>
                    Chỉ số mới <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.newValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "newValue", text)
                    }
                    style={styles.txtInput}
                    disabled={!isEditing}
                  />
                </View>
              </View>
            ) : null}
            {chargeType === 2 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo phòng
                </Text>
              </View>
            ) : null}
            {chargeType === 3 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <Text style={{ alignSelf: "center", fontSize: 17 }}>
                  Theo số người thuê
                </Text>
              </View>
            ) : null}
            {chargeType === 4 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>
                    Số lần sử dụng <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.indexValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
                    disabled={!isEditing}
                  />
                </View>
              </View>
            ) : null}
            {chargeType === 5 ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "67%",
                }}
              >
                <View>
                  <Text>
                    Số lượng <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    underlineColor="transparent"
                    value={currentServiceIndices.indexValue?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange(item.id, "indexValue", text)
                    }
                    style={styles.txtInput}
                    disabled={!isEditing}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text variant="headlineSmall" style={styles.txt}>
              Ngày chốt
            </Text>
            <View
              style={{
                margin: 10,
                marginHorizontal: 15,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => isEditing && setOpen(true)}
              >
                <Text style={{ fontSize: 19, top: 10 }}>
                  {datetime.toLocaleDateString("en-GB")}
                </Text>
                <IconButton
                  icon="calendar"
                  size={22}
                  onPress={() => isEditing && setOpen(true)}
                />
              </TouchableOpacity>
              <DatePicker
                modal
                open={open}
                date={datetime}
                mode={"date"}
                locale={"vi"}
                onConfirm={(date) => {
                  setOpen(false);
                  setDatetime(date);
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
          <View style={{ marginHorizontal: 10 }}>
            <Text variant="headlineSmall" style={styles.txt}>
              Phòng
            </Text>
            <Text variant="headlineSmall" style={styles.txt}>
              {indiceData.room ? indiceData.room.name : "Lỗi hiển thị"}
            </Text>
          </View>
        </View>

        <Text variant="headlineSmall" style={styles.txt}>
          Dịch vụ
        </Text>
        <FlatList
          data={service}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.flatlst}
        />
        {isEditing ? (
          <Button
            style={{
              backgroundColor: "green",
              width: "50%",
              alignSelf: "center",
              marginTop: 20,
            }}
            onPress={handleUpdateIndice}
          >
            <Text style={{ fontSize: 16, color: "white" }}>Cập nhật</Text>
          </Button>
        ) : null}
        <Button
          style={{
            backgroundColor: isEditable ? "#ff3300" : "grey",
            width: "50%",
            alignSelf: "center",
            marginVertical: 20,
          }}
          onPress={() => setIsEditing(!isEditing)}
          disabled={!isEditable}
        >
          <Text style={{ fontSize: 16, color: "white" }}>
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </Text>
        </Button>
        {isEditing ? null : (
          <Button
            style={{
              backgroundColor: "green",
              width: "50%",
              alignSelf: "center",
              marginBottom: 20,
            }}
            onPress={() => navigation.navigate("AddBill", { contractId })}
            disabled={isBill}
          >
            <Text style={{ fontSize: 16, color: "white" }}>{isBill? "Đã tạo hóa đơn":"Tạo hóa đơn"}</Text>
          </Button>
        )}
        {/* <IconButton
            icon="plus-circle"
            size={30}
            onPress={checking}
            color="royalblue"
          /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    height: 40,
    width: 100,
    marginTop: 0,
    backgroundColor: "none",
    borderBottomWidth: 1,
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
    backgroundColor: "white",
    marginVertical: 10,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 15,
    shadowOffset: {
      height: 0.5,
      width: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  itemContent: {
    marginHorizontal: 10,
    padding: 10,
  },
  selectionText: {
    fontSize: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 10,
    borderRadius: 5,
  },
});
