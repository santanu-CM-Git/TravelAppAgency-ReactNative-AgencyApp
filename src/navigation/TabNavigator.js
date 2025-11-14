import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Add this import
import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';
import { API_URL } from '@env'
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
import PackagesCreationScreenForCustomer from '../screens/NoAuthScreen/PackagesCreationScreenForCustomer';
import KycWebView from '../screens/NoAuthScreen/KycWebView';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Define stack navigators
const HomeStack = () => {
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
      <Stack.Screen
        name="MyBookingDetails"
        component={MyBookingDetails}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const PackageStack = () => {
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
      <Stack.Screen
        name="PackagesCreationScreenForCustomer"
        component={PackagesCreationScreenForCustomer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const BookingStack = () => {
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
  );
};

const MessageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MenuStack = () => {
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
        name="KycWebView"
        component={KycWebView}
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
  );
};

// Define tab items with their permissions
const tabItems = [
  {
    name: "HOME",
    component: HomeStack,
    label: "Home",
    icon: homeIconFocusedImg,
    alwaysVisible: true
  },
  {
    name: "Package",
    component: PackageStack,
    label: "Packages",
    icon: packageMenu,
    permission: "Packages"
  },
  {
    name: "Booking",
    component: BookingStack,
    label: "Booking",
    icon: bookingMenu,
    permission: "Booking"
  },
  {
    name: "Message",
    component: MessageStack,
    label: "Messages",
    icon: messageImg,
    permission: "Messages"
  },
  {
    name: "Menu",
    component: MenuStack,
    label: "Menu",
    icon: menuImg,
    alwaysVisible: true
  }
];

const TabNavigator = ({ navigation }) => {
  const [filteredTabs, setFilteredTabs] = useState(tabItems.filter(tab => tab.alwaysVisible));
  const [userInfo, setUserInfo] = useState(null);
  const cartProducts = useSelector(state => state.cart);
  const insets = useSafeAreaInsets(); // Get safe area insets

  const fetchProfileDetails = async () => {
    try {
      const usertoken = await AsyncStorage.getItem('userToken');
      console.log('Token:', usertoken);

      if (!usertoken) {
        setFilteredTabs(tabItems.filter(tab => tab.alwaysVisible));
        return;
      }

      const response = await axios.post(`${API_URL}/agent/profile-details`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      });

      let userInfo = response.data.data;
      setUserInfo(userInfo);
      // Filter tabs based on permissions
      const permissions = userInfo?.user_type?.user_type?.permission || [];
      const userType = userInfo?.user_type;

      console.log('User Type:', userType);
      console.log('Permissions:', permissions);

      const filtered = tabItems.filter(tab => {
        // If tab is always visible, show it
        if (tab.alwaysVisible) return true;

        // If no user type, show all tabs
        if (!userType) return true;

        // Check if user has permission for this tab
        return permissions.includes(tab.permission);
      });

      console.log('Filtered Tabs:', filtered);
      setFilteredTabs(filtered);
    } catch (e) {
      console.log(`Profile error from tab navigator ${e}`);
      // If there's an error, show only always visible tabs
      setFilteredTabs(tabItems.filter(tab => tab.alwaysVisible));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfileDetails();
  }, []);

  // Add focus listener to reload tabs when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileDetails();
    });

    return unsubscribe;
  }, [navigation]);

  // Listen for login state changes
  useEffect(() => {
    let count = 0;
    const maxChecks = 2; // Maximum number of checks

    const checkLoginState = async () => {
      if (count < maxChecks) {
        await fetchProfileDetails();
        count++;
      } else {
        clearInterval(interval);
      }
    };

    // Check login state every 2 seconds, but only twice
    const interval = setInterval(checkLoginState, 2000);

    // Initial check
    checkLoginState();

    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#1F1F1F',
        tabBarActiveTintColor: '#FF455C',
        tabBarStyle: {
          height: Platform.select({
            android: responsiveHeight(8) + insets.bottom, // Add bottom safe area
            ios: responsiveHeight(8) + insets.bottom, // Add bottom safe area
          }),
          paddingBottom: insets.bottom, // Add padding for safe area
        },
      }}
      screenListeners={({ navigation, route }) => ({
        tabPress: (e) => {
          // Get the current navigation state
          const state = navigation.getState();
          const currentTabRoute = state.routes.find(r => r.name === route.name);

          // If the tab has a nested stack with multiple screens
          if (currentTabRoute?.state && currentTabRoute.state.index > 0) {
            // Reset to the initial screen of this tab's stack
            navigation.navigate(route.name, {
              screen: currentTabRoute.state.routes[0].name
            });
          }
        },
      })}
    >
      {filteredTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={({ route }) => ({
            tabBarStyle: {
              display: getTabBarVisibility(route),
              backgroundColor: '#FAFAFA',
              width: responsiveWidth(100),
              height: Platform.select({
                android: responsiveHeight(8) + Math.max(insets.bottom, 10), // Ensure minimum padding
                ios: responsiveHeight(8) + Math.max(insets.bottom, 10), // Ensure minimum padding
              }),
              alignSelf: 'center',
              paddingBottom: Math.max(insets.bottom, 10), // Ensure minimum padding
            },
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
                <Image
                  source={tab.icon}
                  tintColor={color}
                  style={{
                    width: responsiveWidth(7),
                    height: responsiveHeight(3.5),
                    marginTop: responsiveHeight(1.4),
                    resizeMode: 'contain'
                  }}
                />
              </View>
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1), marginTop: responsiveHeight(1) }}>{tab.label}</Text>
            ),
          })}
        />
      ))}
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
