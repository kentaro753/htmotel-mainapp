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

export default function Gioithieu({ navigation }) {
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;

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
          <Avatar.Image
            backgroundColor="white"
            size={150}
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/demopj-5b390.appspot.com/o/LogoWG_nobg.png?alt=media&token=19799886-d3d1-49a9-8bb8-3ae60c7e24ba",
            }}
          />

          <Text style={{ fontSize: 22, fontWeight: "bold", margin: 10 }}>
            Quản lý phòng trọ HT
          </Text>
          <Text style={{ fontSize: 18 }}>Phiên bản 1.0.0</Text>
          <Text style={{ fontSize: 18 }}>
            Thực hiện bởi Phạm Nguyễn Hữu Toàn
          </Text>
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
            Giới thiệu
          </Text>
        </View>
        <View
          style={{
            ...styles.viewBox,
            marginHorizontal: 14,
            marginTop: 3,
            marginBottom:10,
            padding: 10,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 18 }}>
            Đây là dự án báo cáo tốt nghiệp của sinh viên Phạm Nguyễn Hữu Toàn
            tại trường Đại học Thủ Dầu Một.
          </Text>
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
            Liên hệ
          </Text>
        </View>
        <View
          style={{
            ...styles.viewBox,
            marginHorizontal: 14,
            marginTop: 3,
            marginBottom:10,
            padding: 10,
            borderRadius: 1,
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 13.9,
            backgroundColor: "white",
          }}
        >
          {renderDetailRow("Số điện thoại", "0965728124")}
          {renderDetailRow("Email", "huutoan171002@gmail.com")}
          {renderDetailRow("Facebook", "https://www.facebook.com/huu.toan.801496/")}
        </View>
        <Image
          style={{
            height: 90,
            alignSelf: "center",
            alignContent: "center",
            justifyContent: "center",
            width: 186,
            paddingBottom: 10,
          }}
          source={{
            uri: "https://tdmu.edu.vn/img/logo2018-1.png",
          }}
        />
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
    marginTop: 5,
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

  detailRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
  detailLabel: {
    width: "35%",
    alignItems: "flex-start",
  },
  detailValue: {
    width: "65%",
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
  viewBox: {
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
