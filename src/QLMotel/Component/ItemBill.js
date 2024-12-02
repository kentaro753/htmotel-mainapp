import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { formatWithDots, renderDetailRow } from "./SmallComponent";

const ItemBill = ({ item, navigation },key) => {
  const {
    id,
    createDay,
    room,
    discount,
    servicePrice,
    roomCharge,
    startDay,
    endDay,
  } = item;
  const sum = roomCharge + servicePrice - discount;
  return (
    <TouchableOpacity
      key={key}
      style={styles.ctitem}
      onPress={() => {
        navigation.navigate("BillDetail", { item: item });
      }}
    >
      <View style={{ alignItems: "center", alignItems: "flex-start" }}>
        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Text style={styles.boldText}>#{id}</Text>
          </View>
          <View style={styles.detailValue}>
            <Text style={{ fontWeight: "bold", fontSize: 19, color: "red" }}>
              {formatWithDots(sum.toString())} đ
            </Text>
          </View>
        </View>
        <Text style={styles.smtxt}>
          <Icon source="home-account" size={20} color="#666666" />
          {room?.name}
        </Text>
        {renderDetailRow(
          "Tiền phòng",
          `${formatWithDots(roomCharge.toString())} đ`
        )}
        {servicePrice != 0
          ? renderDetailRow(
              "Tiền dịch vụ",
              `${formatWithDots(servicePrice.toString())} đ`
            )
          : null}
        {discount != 0
          ? renderDetailRow(
              "Giảm giá",
              `${formatWithDots(discount.toString())} đ`
            )
          : null}
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  smtxt: { fontSize: 15.5, color: "#666666" },
  boldText: { fontSize: 18, fontWeight: "bold" },
  txtTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ctitem: {
    flexDirection: "row",
    borderWidth: 1,
    minHeight: 80,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
  },
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
export default ItemBill;
