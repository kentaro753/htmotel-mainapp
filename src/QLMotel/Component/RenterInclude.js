import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

const RenterInclude = ({ item, onSelect, type }) => {
  const { contracts, room } = item;
  const isMainTenant = contracts.includes(room.contract);
  return (
    <TouchableOpacity style={styles.renteritem} onPress={() => onSelect? onSelect(item):null}>
      <View style={{ alignItems: "flex-start", width: "57%" }}>
        <Text style={{ fontWeight: "bold", fontSize: 19, color: "#ff9900" }}>
          {item.fullName}
        </Text>
        <Text style={{ fontSize: 17, color: "#b3b3b3" }}>{item.phone}</Text>
      </View>

      <View style={{ alignItems: "flex-end", width: "43%" }}>
        {item.room.id == "" ? (
          <Text style={{ fontSize: 17, color: "#ff1a1a" }}>Chưa cấp phòng</Text>
        ) : (
          <>
            <Text style={{ fontSize: 17, color: "#ff1a1a" }}>
              {item.room.name}
            </Text>
            {type == "view" ? (
              isMainTenant ? (
                <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
                  Người thuê chính
                </Text>
              ) : (
                <Text style={{ fontSize: 17, color: "#b3b3b3" }}>
                  Người ở chung
                </Text>
              )
            ) : null}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  renteritem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 80,
    paddingVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default RenterInclude;
