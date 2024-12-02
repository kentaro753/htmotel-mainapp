import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Icon, Checkbox, Text } from "react-native-paper";
import { formatWithDots } from "./SmallComponent";

const ServiceIcon = ({ item, onPress, checked: checkedProp, type }) => {
  const [checked, setChecked] = useState(checkedProp);
  const { serviceName, icon, fee, chargeBase } = item;
  useEffect(() => {
    setChecked(checkedProp);
  }, [checkedProp]);

  const handlePress = () => {
    setChecked(!checked);
    onPress(item.id, !checked);
  };
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        marginBottom: 5,
        alignItems: "center",
        marginHorizontal: 3,
        borderWidth: 1,
        width: "31.4%",
        aspectRatio: 1,
        justifyContent: "center",
        backgroundColor: type == "add" && checked ? "#ffaa80" : "white",
      }}
      onPress={() => (type == "add" ? onPress(item) : handlePress())}
    >
      {type === "check" && (
        <View
          style={{
            position: "absolute",
            top: -5,
            right: -5,
          }}
        >
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={handlePress}
            color="#ff5c33"
          />
        </View>
      )}
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Icon source={icon} size={50} />
        <Text>{serviceName}</Text>
        <Text>
          {formatWithDots(fee.toString())} đ/{chargeBase}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceIcon;
