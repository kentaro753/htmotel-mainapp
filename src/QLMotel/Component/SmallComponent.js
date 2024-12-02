import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Icon, IconButton, Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import moment from "moment";
const stringToDate = (dateString) => {
  return moment(dateString, "DD/MM/YYYY").toDate();
};
const dateToString = (date) => {
  if (!date) {
    return "";
  }
  return moment(date).format("DD/MM/YYYY");
};
const formatMonthYear = (date) => {
  const month = date.getMonth() + 1; // months are zero-indexed
  const year = date.getFullYear();
  return `${month}/${year}`;
};
const formatWithDots = (text) => {
  let numericText = text.replace(/\D/g, "");
  return numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
const sendRenterNotification = async (renterId,notification, icon) => {
  const USERS = firestore().collection("USERS");

  try {
    // Lấy thông tin người thuê từ Firestore
    const querySnapshot = await USERS.where("renterId", "==", renterId).get();
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const NOTIFICATIONS = firestore()
        .collection("USERS")
        .doc(userData.email)
        .collection("NOTIFICATIONS");
      if (userData && userData.fcmToken) {
        const fcmToken = userData.fcmToken;

        // Dữ liệu thông báo
        const notificationData = {
          to: fcmToken, // Sử dụng FCM Token của người thuê
          notification: notification,
          // data: {
          //   renterId,
          //   billId,
          // },
        };

        // Gửi thông báo qua FCM
        await messaging().sendMessage(notificationData);

        // Nếu muốn lưu thông báo vào Firestore (có thể tùy chọn)
        await NOTIFICATIONS.add({
          icon: icon,
          sender: "Chủ trọ",
          notification: notification,
          timestamp: new Date(),
        });

        console.log("Thông báo đã được gửi");
      } else {
        console.error("Không tìm thấy FCM Token của người thuê");
      }
    } else {
      console.error("Không tìm thấy thông tin người thuê trong Firestore");
    }
  } catch (error) {
    console.error("Lỗi khi gửi thông báo:", error);
  }
};
const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
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
    fontSize: 17,
    color: "#000",
  },
  detailValueText: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#000",
  },
});

export {
  formatWithDots,
  renderDetailRow,
  formatMonthYear,
  stringToDate,
  dateToString,
  sendRenterNotification,
};
