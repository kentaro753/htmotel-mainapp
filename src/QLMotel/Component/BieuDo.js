import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Dimensions } from "react-native";
import { useMyContextProvider } from "../store/index";
import firestore from "@react-native-firebase/firestore";
import { IconButton } from "react-native-paper";

const BieuDo = ({ navigation }) => {
  const [controller] = useMyContextProvider();
  const { userLogin } = controller;
  const screenWidth = Dimensions.get("window").width;
  const [isReload, setIsReload] = useState(false);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm tạo array chứa tháng/năm từ hiện tại đến 6 tháng trước
  const getLastSixMonths = () => {
    const result = [];
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
    let currentYear = currentDate.getFullYear(); // Năm hiện tại

    for (let i = 0; i < 6; i++) {
      result.push(`${currentMonth}/${currentYear}`);

      // Lùi tháng, nếu về tháng 0 thì chuyển về tháng 12 và giảm năm
      currentMonth -= 1;
      if (currentMonth === 0) {
        currentMonth = 12;
        currentYear -= 1;
      }
    }

    return result.reverse(); // Đảo ngược để hiển thị từ tháng cũ đến mới
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthsArray = getLastSixMonths();
        const monthsData = {};
        const THUCHIS = firestore()
          .collection("USERS")
          .doc(userLogin?.email)
          .collection("THUCHIS");
        monthsArray.forEach((monthYear) => {
          monthsData[monthYear] = { income: 0, expense: 0 }; // Gán giá trị mặc định là 0
        });

        // Fetch dữ liệu từ Firebase
        const thuchisSnapshot = await THUCHIS.get();
        // Cập nhật dữ liệu cho từng tháng/năm
        thuchisSnapshot.forEach((doc) => {
          const thuchi = doc.data();
          const [sDay, sMonth, sYear] = thuchi.date.split("/").map(Number);
          const totalIncome = thuchi.type ? thuchi.money : 0;
          const totalExpense = thuchi.type ? 0 : thuchi.money;

          const dateKey = `${sMonth}/${sYear}`;
          if (monthsData[dateKey]) {
            monthsData[dateKey].income += totalIncome;
            monthsData[dateKey].expense += totalExpense;
          }
        });

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = [];

        monthsArray.forEach((monthYear) => {
          const { income, expense } = monthsData[monthYear];
          chartData.push({
            value: income, // Dữ liệu thu nhập
            label: monthYear,
            frontColor: "#177AD5",
            spacing: 2,
            labelWidth: 50,
            labelTextStyle: { color: "gray", fontSize: 13 },
            onPress: () =>
              navigation.navigate("ThongKe", { monthYear, type: "income" }),
          });
          chartData.push({
            value: expense, // Dữ liệu chi tiêu
            frontColor: "#ED6665",
            onPress: () =>
              navigation.navigate("ThongKe", { monthYear, type: "expense" }),
          });
        });

        setBarData(chartData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
    console.log(isReload);
  }, [userLogin, isReload]);

  useEffect(() => {
    setLoading(false);
  }, [barData]);

  const renderTitle = () => {
    return (
      <View style={{ marginVertical: 30 }}>
        <IconButton
          icon="reload"
          size={35}
          iconColor="white"
          style={{
            marginStart: 0,
            width: "100%",
            position: "absolute",
            alignItems: "flex-end",
            top: -30,
            right: 6,
          }}
          onPress={() => {
            setLoading(true);
            setIsReload(!isReload);
          }}
        />
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Thống kê doanh thu
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginTop: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: "#177AD5",
                marginRight: 8,
              }}
            />
            <Text style={{ width: 60, height: 16, color: "lightgray" }}>
              Thu
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: "#ED6665",
                marginRight: 8,
              }}
            />
            <Text style={{ width: 60, height: 16, color: "lightgray" }}>
              Chi
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>; // Or any loading spinner component
  } else
    return (
      <View
        style={{
          backgroundColor: "#333340",
          paddingBottom: 40,
          paddingLeft: 6,
          borderRadius: 10,
          width: screenWidth - 35,
        }}
      >
        {renderTitle()}
        <BarChart
          data={barData.length > 0 ? barData : []}
          barWidth={12}
          spacing={23}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: "gray" }}
          noOfSections={3}
        />
      </View>
    );
};

export default BieuDo;
