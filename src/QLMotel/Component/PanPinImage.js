import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Text } from "react-native-paper";

const PanPinImage = ({ image, isModalVisible, onClose }) => {
  const [imageHeight, setImageHeight] = useState(100);
  const [imageWidth, setImageWidth] = useState(Dimensions.get("window").width);
  const [scale, setScale] = useState(new Animated.Value(1));
  const [lastScale, setLastScale] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const maxTranslate = 100;
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  useEffect(() => {
    if (image) {
      let imagePath = image;

      const isLocal = image.startsWith("/");

      if (isLocal) {
        imagePath = `file://${image}`;
      }

      Image.getSize(
        imagePath,
        (width, height) => {
          const aspectRatio = height / width;
          const newHeight = imageWidth * aspectRatio;
          setImageHeight(newHeight);
        },
        (error) => {
          console.error("Lỗi khi lấy kích thước ảnh:", error);
        }
      );
    }
  }, [image, imageWidth]);
  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });
  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      setLastScale(lastScale * event.nativeEvent.scale);
      scale.setValue(1);
    } else if (event.nativeEvent.state === State.BEGAN) {
      setLastScale(scale._value);
    }
  };

  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const onPanStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastTranslateX.current += event.nativeEvent.translationX;
      lastTranslateY.current += event.nativeEvent.translationY;

      // Giới hạn vị trí ảnh trong phạm vi nhất định
      lastTranslateX.current = Math.max(
        -maxTranslate,
        Math.min(lastTranslateX.current, maxTranslate)
      );
      lastTranslateY.current = Math.max(
        -maxTranslate,
        Math.min(lastTranslateY.current, maxTranslate)
      );

      translateX.setOffset(lastTranslateX.current);
      translateY.setOffset(lastTranslateY.current);

      translateX.setValue(0);
      translateY.setValue(0);
    } else if (event.nativeEvent.state === State.BEGAN) {
      translateX.setOffset(lastTranslateX.current);
      translateY.setOffset(lastTranslateY.current);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      onBackdropPress={onClose}
      animationType="slide"
      animated
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GestureHandlerRootView
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Thêm PanGestureHandler để kéo ảnh */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanStateChange}
          >
            <Animated.View>
              <PinchGestureHandler
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
              >
                <Animated.Image
                  source={{ uri: image }}
                  style={[
                    {
                      transform: [
                        { scale },
                        {
                          translateX: translateX.interpolate({
                            inputRange: [-maxTranslate, maxTranslate],
                            outputRange: [-maxTranslate, maxTranslate],
                            extrapolate: "clamp", // Giới hạn trong phạm vi maxTranslate
                          }),
                        },
                        {
                          translateY: translateY.interpolate({
                            inputRange: [-maxTranslate, maxTranslate],
                            outputRange: [-maxTranslate, maxTranslate],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      height: imageHeight,
                      width: imageWidth,
                    },
                  ]}
                  resizeMode="contain"
                />
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>

        {/* Nút đóng */}
        <TouchableOpacity
          onPress={onClose}
          style={{ position: "absolute", top: 40, right: 20 }}
        >
          <Text style={{ color: "white", fontSize: 20 }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
export default PanPinImage;
