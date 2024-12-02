import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Icon, Text } from "react-native-paper";

const ProcessingOverlay = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#00e600" />
      <Text style={{ color: "#fff", marginTop: 10 }}>Đang xử lý...</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Màu nền mờ
    zIndex: 10,
  },
});
export default ProcessingOverlay;
