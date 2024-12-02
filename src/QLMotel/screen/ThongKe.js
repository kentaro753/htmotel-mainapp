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
import { BarChart } from "react-native-gifted-charts";

import TTabThongKe from "../route/TTabThongKe";
import firestore from "@react-native-firebase/firestore";
import MonthYearPicker from "react-native-month-year-picker";

// Define stringToDate function here
const stringToDate = (string) => {
  const [month, year] = string.split("/").map(Number);
  return new Date(year, month - 1, 1);
};

export default function ThongKe({ navigation, route }) {
  const { type } = route.params || "income";
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [barData, setBarData] = useState([]);

  const screenWidth = Dimensions.get("window").width;
  const [monthYear, setMonthYear] = useState(
    route.params ? stringToDate(route.params.monthYear) : new Date()
  );
  const [startOpen, setStartOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const showPicker = () => {
    setStartOpen(true);

  };

  const onValueChange = (event, newDate) => {
    setStartOpen(false);
    if (newDate !== undefined) {
      setMonthYear(newDate);
      setLoading(true);
    }

  };

  const formatMonthYear = (date) => {
    const month = date.getMonth() + 1; // months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${year}`;
  };
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    console.log("Updated monthYear in ThongKe:", monthYear);
  }, [monthYear]);


  const getLastSixMonths = () => {
    const result = [];
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
    let currentYear = currentDate.getFullYear(); // Năm hiện tại

    for (let i = 0; i < 6; i++) {
      result.push(`${currentMonth}/${currentYear}`);
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
          .doc(userLogin.email)
          .collection("THUCHIS");
        monthsArray.forEach((monthYear) => {
          monthsData[monthYear] = { income: 0, expense: 0 }; // Gán giá trị mặc định là 0
        });
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
            labelTextStyle: { fontSize: 13 },
          });
          chartData.push({
            value: expense, // Dữ liệu chi tiêu
            frontColor: "#ED6665",
          });
        });

        setBarData(chartData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, [userLogin]);

  const renderTitle = () => {
    return (
      <View>
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
            <Text style={{ width: 60, height: 16 }}>Thu</Text>
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
            <Text style={{ width: 60, height: 16 }}>Chi</Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          alignContent: "center",
          alignItems: "center",
          justifyContent: "space-around",
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        {renderTitle()}
        <BarChart
          data={barData}
          barWidth={12}
          spacing={23}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: "black" }}
          noOfSections={3}
        />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thống Kê tháng</Text>
        <TouchableOpacity style={{ flexDirection: "row" }} onPress={showPicker}>
          <Text style={styles.headerText}>: {formatMonthYear(monthYear)}</Text>
          <Icon source="calendar-month" size={25} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <TTabThongKe monthYear={monthYear} initialRouteName={type} />
      )}
      {startOpen && (
        <MonthYearPicker
          onChange={onValueChange}
          value={monthYear}
          minimumDate={new Date(2020, 0)}
          maximumDate={new Date()}
          locale="vi"
        />
      )}
    </View>
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
    marginHorizontal: 20,
    marginTop: 20,
  },
  btn: {
    marginTop: 10,
    width: "90%",
    marginLeft: "5%",
  },
  header: {
    backgroundColor: "#16a085",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 18,
    color: "#fff",
  },
});
