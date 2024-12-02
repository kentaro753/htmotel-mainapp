import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Checkbox, Text } from "react-native-paper";

const RoomCheckBox = ({ item, onChange, checked: checkedProp }) => {
  const [checked, setChecked] = useState(checkedProp);
  const { roomName } = item;

  useEffect(() => {
    setChecked(checkedProp);
  }, [checkedProp]);

  const handlePress = () => {
    setChecked(!checked);
    onChange(item.id, !checked);
  };

  return (
    <View style={{width:"50%", justifyContent:"flex-start"}}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={checked ? "checked" : "unchecked"}
          onPress={handlePress}
        />
        <Text style={{ fontSize: 20 }}>{roomName}</Text>
      </View>
    </View>
  );
};

export default RoomCheckBox;
