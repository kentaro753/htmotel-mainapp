import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  StatusBar,
  TouchableOpacity,
  NativeEventEmitter,
} from 'react-native';
import { COLOR } from 'react-native-material-ui';
import VnpayMerchant, { VnpayMerchantModule } from './react-native-vnpay-merchant';

const eventEmitter = new NativeEventEmitter(VnpayMerchantModule);

const TestVNPay = () => {
  const [text, setText] = useState('OpenSDK');

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            backgroundColor: COLOR.blue600,
            borderRadius: 10,
          }}
          onPress={() => {
            // mở sdk
            eventEmitter.addListener('PaymentBack', (e) => {
              console.log('Sdk back!');
              if (e) {
                console.log('e.resultCode = ' + e.resultCode);
                switch (e.resultCode) {
                  //resultCode == -1: back from sdk
                  //resultCode == 10: user selected app to payment
                  //resultCode == 99: back from success payment
                  //resultCode == 98: payment failed
                  //resultCode == 97: payment success
                }

                // khi tắt sdk
                eventEmitter.removeAllListeners('PaymentBack');
              }
            });

            VnpayMerchant.show({
              isSandbox: true,
              scheme: 'vn.abahaglobal',
              title: 'Thanh toán VNPAY',
              titleColor: '#333333',
              beginColor: '#ffffff',
              endColor: '#ffffff',
              iconBackName: 'close',
              tmn_code: 'GOGREEN1',
              paymentUrl:
                'http://testproduct2851.abaha.click/payment/order/916?token=eyJhcHBfa2V5IjoicGF5bWVudHNlcnZpY2VrZXkiLCJkZWxpdmVyeV91bml0Ijoidm5wYXkiLCJ0eG5faWQiOiI5MTYifQ==',
            });

            setText('Sdk opened');
          }}
        >
          <Text style={{ color: COLOR.white }}>{text}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default TestVNPay;
