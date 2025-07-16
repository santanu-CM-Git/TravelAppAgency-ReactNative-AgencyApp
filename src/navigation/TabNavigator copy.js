import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';

import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';

import { useFocusEffect } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import PrivacyPolicy from '../screens/NoAuthScreen/PrivacyPolicy';
import ChatScreen from '../screens/NoAuthScreen/ChatScreen';
import { bookingMenu, bookmarkedFill, bookmarkedNotFill, bookmarkednotFocusedImg, calenderFocusedImg, calenderImg, homeIconFocusedImg, homeIconNotFocusedImg, menuImg, messageImg, packageMenu, quotesImg, talkFocusedImg, talkImg } from '../utils/Images';
import BookingSummary from '../screens/NoAuthScreen/BookingSummary';
import PaymentFailed from '../screens/NoAuthScreen/PaymentFailed';
import QuotesScreen from '../screens/NoAuthScreen/QuotesScreen';
import QuotesListScreen from '../screens/NoAuthScreen/QuotesListScreen';
import SearchScreen from '../screens/NoAuthScreen/SearchScreen';
import TopLocationScreen from '../screens/NoAuthScreen/TopLocationScreen';
import TopLocationScreenDetails from '../screens/NoAuthScreen/TopLocationScreenDetails';
import TravelAgencyDetails from '../screens/NoAuthScreen/TravelAgencyDetails';
import PackageDetailsScreen from '../screens/NoAuthScreen/PackageDetailsScreen';
import PaymentSuccessScreen from '../screens/NoAuthScreen/PaymentSuccessScreen';
import MenuScreen from '../screens/NoAuthScreen/MenuScreen';
import ProfileEditScreen from '../screens/NoAuthScreen/ProfileEditScreen';
import MyBookingList from '../screens/NoAuthScreen/MyBookingList';
import MyBookingDetails from '../screens/NoAuthScreen/MyBookingDetails';
import CompletedBookingDetails from '../screens/NoAuthScreen/CompletedBookingDetails';
import UpcommingBookingDetails from '../screens/NoAuthScreen/UpcommingBookingDetails';
import ChatListScreen from '../screens/NoAuthScreen/ChatListScreen';
import RefundScreen from '../screens/NoAuthScreen/RefundScreen';
import CustomerSupport from '../screens/NoAuthScreen/CustomerSupport';
import QuoteRequestList from '../screens/NoAuthScreen/QuoteRequestList';
import PackagesScreen from '../screens/NoAuthScreen/PackagesScreen';
import NewBookingScreen from '../screens/NoAuthScreen/NewBookingScreen';
import TeamScreen from '../screens/NoAuthScreen/TeamScreen';
import AddNewMemberScreen from '../screens/NoAuthScreen/AddNewMemberScreen';
import UserTypeScreen from '../screens/NoAuthScreen/UserTypeScreen';
import AddNewUserType from '../screens/NoAuthScreen/AddNewUserType';
import SupportScreen from '../screens/NoAuthScreen/SupportScreen';
import TransactionScreen from '../screens/NoAuthScreen/TransactionScreen';
import BankScreen from '../screens/NoAuthScreen/BankScreen';
import BankListScreen from '../screens/NoAuthScreen/BankListScreen';
import BankOtpScreen from '../screens/NoAuthScreen/BankOtpScreen';
import BankLinkedScreen from '../screens/NoAuthScreen/BankLinkedScreen';
import PackagesCreationScreen from '../screens/NoAuthScreen/PackagesCreationScreen';
import EditNewUserType from '../screens/NoAuthScreen/EditNewUserType';
import PackageEditScreen from '../screens/NoAuthScreen/PackageEditScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('Home');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopLocationScreen"
        component={TopLocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopLocationScreenDetails"
        component={TopLocationScreenDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TravelAgencyDetails"
        component={TravelAgencyDetails}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="PackageDetailsScreen"
        component={PackageDetailsScreen}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="BookingSummary"
        component={BookingSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailed}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RefundScreen"
        component={RefundScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSuccessScreen"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuoteRequestList"
        component={QuoteRequestList}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="TherapistProfile"
        component={TherapistProfile}
        options={{ headerShown: false }}
      /> */}
    </Stack.Navigator>
  );
};

const PackageStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('PackagesScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PackagesScreen"
        component={PackagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuotesListScreen"
        component={QuotesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PackagesCreationScreen"
        component={PackagesCreationScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="PackageDetailsScreen"
        component={PackageDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PackageEditScreen"
        component={PackageEditScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const BookingStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('MyBookingList');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyBookingList"
        component={MyBookingList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewBookingScreen"
        component={NewBookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyBookingDetails"
        component={MyBookingDetails}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  )
}

const MessageStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('ChatListScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};


const MenuStack = ({ navigation, route }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('MenuScreen');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MenuScreen"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileEditScreen"
        component={ProfileEditScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MyBookingDetails"
        component={MyBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CompletedBookingDetails"
        component={CompletedBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpcommingBookingDetails"
        component={UpcommingBookingDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerSupport"
        component={CustomerSupport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamScreen"
        component={TeamScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewMemberScreen"
        component={AddNewMemberScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserTypeScreen"
        component={UserTypeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewUserType"
        component={AddNewUserType}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditNewUserType"
        component={EditNewUserType}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SupportScreen"
        component={SupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionScreen"
        component={TransactionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BankScreen"
        component={BankScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BankListScreen"
        component={BankListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BankOtpScreen"
        component={BankOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BankLinkedScreen"
        component={BankLinkedScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const TabNavigator = ({ navigation }) => {
  const cartProducts = useSelector(state => state.cart)
  console.log(cartProducts)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#1F1F1F',
        tabBarActiveTintColor: '#FF455C',
        tabBarStyle: {
          height: 100,
        },
      }}
    >
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={homeIconFocusedImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Home</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Talk"
        component={PackageStack}
        // listeners={{
        //   tabPress: e => {
        //     e.preventDefault();
        //     navigation.navigate('QuotesScreen')
        //   },
        // }}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              {/* <FontAwesome name="rupee-sign" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} /> */}
              <Image source={packageMenu} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Packages</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Booking"
        component={BookingStack}
        // listeners={{
        //   tabPress: e => {
        //     e.preventDefault();
        //     navigation.navigate('QuotesScreen')
        //   },
        // }}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              {/* <FontAwesome name="rupee-sign" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} /> */}
              <Image source={bookingMenu} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Booking</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Message"
        component={MessageStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={messageImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Messages</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FAFAFA',
            width: responsiveWidth(100),
            height: Platform.select({
              android: responsiveHeight(8),
              ios: responsiveHeight(11),
            }),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={menuImg} tintColor={color} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Menu</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  //console.log(routeName)
  if (routeName == 'Summary') {
    return 'none';
  } else if (routeName == 'ChatScreen') {
    return 'none';
  } else if (routeName == 'WalletScreen') {
    return 'none';
  } else if (routeName == 'PaymentFailed') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default TabNavigator;
