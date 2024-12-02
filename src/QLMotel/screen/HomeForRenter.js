import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Icon, IconButton, Text } from "react-native-paper";
import { useMyContextProvider } from "../store/index";
import { Dimensions } from "react-native";
import BieuDo from "../Component/BieuDo";
import firestore from "@react-native-firebase/firestore";
import ItemBill from "../Component/ItemBill";
import { stringToDate } from "../Component/SmallComponent";

export default function HomeForRenter({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [data, setData] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [rooms, setRooms] = useState(0);
  const [contractId, setContractId] = useState("");
  const [phone, setPhone] = useState("");

  const screenWidth = Dimensions.get("window").width;
  const USERS = firestore().collection("USERS");

  useEffect(() => {
    if (userLogin == null) navigation.navigate("Login");
  }, [userLogin]);

  useEffect(() => {
    if (userLogin != null && userLogin.role == "renter") {
      USERS.doc(userLogin.admin).onSnapshot((doc) => {
        const data = doc.data();
        setPhone(data.phone);
      });
      const BILLS = firestore()
        .collection("USERS")
        .doc(userLogin.admin)
        .collection("BILLS");
      const RENTERS = firestore()
        .collection("USERS")
        .doc(userLogin.admin)
        .collection("RENTERS");
      const loadbill = BILLS.where("renterId", "==", userLogin?.renterId)
        .where("state", "==", 0)
        .onSnapshot((response) => {
          var arr = [];
          response.forEach((doc) => {
            const data = doc.data();
            if (data.id != null) {
              arr.push(data);
            }
          });
          arr.sort((a, b) => stringToDate(a.endDay) - stringToDate(b.endDay));
          setBillsData(arr);
        });
      const loadroom = RENTERS.doc(userLogin.renterId).onSnapshot((renter) => {
        const data = renter.data();
        if (data.contracts.length == 1) {
          setContractId(data.contracts[0]);
        }
        setRooms(data.contracts.length);
      });
      return () => {
        loadbill();
        loadroom();
      };
    }
  }, [userLogin]);

  // useEffect(() => {
  //   const roomCount = roomData ? roomData.length : 0;
  //   const emptyroomCount = emptyRoomData ? emptyRoomData.length : 0;
  //   const renterCount = renterData ? renterData.length : 0;
  //   setEmptyRooms(emptyroomCount);
  //   setRooms(roomCount);
  //   setRenters(renterCount);
  // }, [renterData, roomData, emptyRoomData]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          backgroundColor: "#ff3300",
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          variant="displaySmall"
          style={{ marginLeft: 10, color: "white", fontSize: 20 }}
        >
          {userLogin !== null && userLogin.fullName
            ? userLogin.fullName.toUpperCase()
            : ""}
        </Text>
        <View style={{ flexDirection: "row" }}>
          {/* <IconButton
            icon="account-circle"
            size={35}
            style={{ marginEnd: 0, width: 40 }}
            iconColor="white"
            onPress={() => navigation.navigate("Profile")}
          /> */}
          <IconButton
            icon="bell-outline"
            size={35}
            iconColor="white"
            style={{ marginStart: 0, width: 40 }}
            onPress={() => navigation.navigate("Notice")}
            // onPress={() => Alert.alert("Chưa được thực hiện!")}
          />
        </View>
      </View>

      {/* <View
        style={{
          ...styles.viewBox,
          flexDirection: "row",
          marginHorizontal: 20,
          marginVertical: 10,
          paddingVertical: 30,
          borderRadius: 1,
          borderTopRightRadius: 14,
          borderTopLeftRadius: 14,
          borderBottomRightRadius: 14,
          borderBottomLeftRadius: 13.9,
          flexWrap: "wrap",
        }}
      >
        <Text
          style={{
            position: "absolute",
            left: 14,
            top: -7,
            backgroundColor: "white",
            fontSize: 20,
            fontWeight: "bold",
            paddingHorizontal: 5,
          }}
        >
          Chốt dịch vụ gần nhất
        </Text>
        <Text style={{ marginBottom: 20, marginTop: 5, color: "#999999" }}>Chưa có chốt dịch vụ</Text>
      </View> */}
      <View
        style={{
          ...styles.viewBox,
          backgroundColor: "#ff8000",
          marginHorizontal: 20,
          marginVertical: 10,
          borderRadius: 1,
          borderTopRightRadius: 14,
          borderTopLeftRadius: 14,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          paddingVertical: 30,
          flexWrap: "wrap",
        }}
      >
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            rooms > 1
              ? navigation.navigate("RoomsForRenter")
              : rooms == 1
              ? navigation.navigate("RDForRenter", { id: contractId })
              : Alert.alert(
                  "Thông báo",
                  "Không có hợp đồng nào đang hoạt động!"
                )
          }
        >
          <Icon
            source="handshake"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="royalblue"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>
            Thông tin phòng, dịch vụ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("AddIncident")}
        >
          <Icon
            source="alert"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#cc0000"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Báo cáo Sự cố</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("TTabIncident")}
        >
          <Icon
            source="clipboard-alert"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#ff3300"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Danh sách Sự cố</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate("ChatScreen", {
              id: userLogin.admin + "_" + userLogin.email,
              phone: phone,
            })
          }
        >
          <Icon
            source="message-text"
            size={50}
            style={{ marginEnd: 0, width: 50 }}
            color="#9900ff"
          />
          <Text style={{ color: "#000", fontSize: 20 }}>Liên hệ chủ trọ</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          ...styles.viewBox,
          marginHorizontal: 20,
          marginTop: 20,
          marginBottom: 10,
          paddingTop: 25,
          paddingBottom: 5,
          marginBottom: 5,
          borderRadius: 1,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
        }}
      >
        <Text
          style={{
            position: "absolute",
            left: 14,
            top: -7,
            backgroundColor: "white",
            fontSize: 20,
            fontWeight: "bold",
            paddingHorizontal: 5,
          }}
        >
          Hóa đơn chưa thanh toán
        </Text>
        {billsData.length == 0 && (
          <Text style={{ marginBottom: 20, marginTop: 5, color: "#999999" }}>
            Chưa có hóa đơn mới
          </Text>
        )}
        {billsData.map((item, index) => (
          <ItemBill item={item} key={index} navigation={navigation} />
        ))}
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
  poster: {
    resizeMode: "center",
    height: 150,
    width: 150,
    borderRadius: 10,
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
  viewBox: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  btn: {
    backgroundColor: "#fff2e6",
    flexDirection: "row",
    width: "87%",
    alignItems: "center",
    margin: 3,
    padding: 5,
    borderWidth: 0,
    borderRadius: 10,
  },
});
