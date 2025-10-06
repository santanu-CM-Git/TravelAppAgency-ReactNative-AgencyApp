import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  BackHandler,
  Platform,
  TextInput,
  StatusBar
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg, userImg, timeImg, totalearningIcon, totalbookingIcon, completeIcon, upcomingIcon, acceptButton, declineButton, calendarImg } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-toast-message';
import { requestNotificationPermission, checkNotificationPermission } from '../../utils/NotificationService';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function HomeScreen({ }) {
  const navigation = useNavigation();
  const carouselRef = useRef(null);
  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { logout } = useContext(AuthContext);
  // const { userInfo } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [userInfo, setUserInfo] = useState([])
  const [totalEarning, setTotalEarning] = useState(0);
  const [totalBooking, setTotalBooking] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState(0);
  const [completeBooking, setCompleteBokking] = useState(0);
  const [bookingData, setBookingData] = useState([]);
  const [quoteRequest, setQuoteRequest] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [pageno, setPageno] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [activeTab, setActiveTab] = useState('New booking');
  const tabs = [
    { label: 'New booking', value: 'New booking' },
    { label: 'Quote request', value: 'Quote request' },
  ];


  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      //console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      // For iOS, use Firebase messaging permission request
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS notification permission granted');
          setNotificationStatus(true);
        } else {
          console.log('iOS notification permission denied');
          setNotificationStatus(false);
        }
        return;
      }

      // For Android, use react-native-permissions with proper error handling
      try {
        const currentPermission = await checkNotificationPermission();

        // If permission is not granted, request it
        if (currentPermission !== 'granted') {
          const permissionResult = await requestNotificationPermission();

          if (permissionResult === 'granted') {
            console.log('Android notification permission granted');
            setNotificationStatus(true);
          } else {
            console.log('Android notification permission denied');
            setNotificationStatus(false);
          }
        } else {
          console.log('Android notification permission already granted');
          setNotificationStatus(true);
        }
      } catch (permissionError) {
        console.error('Permission check/request error:', permissionError);
        // Fallback: try to check using Firebase messaging
        try {
          const authStatus = await messaging().hasPermission();
          const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          setNotificationStatus(enabled);
        } catch (firebaseError) {
          console.error('Firebase permission check error:', firebaseError);
          setNotificationStatus(false);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationStatus(false);
    }
  };

  useEffect(() => {
    getFCMToken()
    // Request notification permissions
    requestNotificationPermissions();

    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        //console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.notification?.title === 'Appointment Cancelled') {

        }
      });

      return unsubscribe;
    }
  }, [])

  // useEffect(() => {
  //   const backAction = () => {
  //     if (Platform.OS === 'android') {
  //       BackHandler.exitApp(); // Minimize the app (simulating background run)
  //       return true; // Prevent default back action
  //     }
  //     return false;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove(); // Cleanup the event listener on component unmount
  // }, []);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const fetchProfileDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      console.log(usertoken, 'usertokenusertokenusertokenusertoken')
      axios.post(`${API_URL}/agent/profile-details`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          console.log(userInfo, 'user data from contact informmation')
          setUserInfo(userInfo)
        })
        .catch(e => {
          console.log(`Profile error from home page ${e}`)
        });
    });
  }

  const fetchDashboardData = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/agent/dashboard`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          setTotalEarning(userInfo?.total_earnning)
          setTotalBooking(userInfo?.total)
          setUpcomingBooking(userInfo?.upcomming)
          setCompleteBokking(userInfo?.completed)
        })
        .catch(e => {
          console.log(`Profile error from home page ${e}`)
        });
    });
  }
  const fetchBookings = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');

      if (!userToken) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Authentication token not found',
          position: 'top'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/agent/booking-list`, {}, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        const allBookings = response.data.data || [];
        console.log(JSON.stringify(allBookings), 'allBookingsallBookingsallBookings')
        // Filter out bookings with status 'cancelled' or 'rejected'
        const filteredBookings = allBookings.filter(
          booking => booking.status !== 'cancelled' && booking.status !== 'rejected'
        );
        const lastTen = allBookings.slice(-10);
        setBookingData(filteredBookings);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid response format from server',
          position: 'top'
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);

      if (error.response?.status === 503 && retryCount < MAX_RETRIES) {
        // Server is temporarily unavailable, retry after delay
        Toast.show({
          type: 'info',
          text1: 'Server Busy',
          text2: 'Retrying...',
          position: 'top'
        });

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchBookings(retryCount + 1);
      }

      let errorMessage = 'Failed to fetch bookings';
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server';
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuoteRequest = useCallback(async (page = 1, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');

      if (!userToken) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Authentication token not found',
          position: 'top'
        });
        return;
      }

      const response = await axios.post(`${API_URL}/agent/requested-quotes`, {}, {
        params: {
          page
        },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.data && response.data.data && response.data.data.data) {
        const responseData = response.data.data.data;
        setQuoteRequest(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
        setHasMore(responseData.length > 0);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid response format from server',
          position: 'top'
        });
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);

      if (error.response?.status === 503 && retryCount < MAX_RETRIES) {
        // Server is temporarily unavailable, retry after delay
        Toast.show({
          type: 'info',
          text1: 'Server Busy',
          text2: 'Retrying...',
          position: 'top'
        });

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchQuoteRequest(page, retryCount + 1);
      }

      let errorMessage = 'Failed to fetch quote requests';
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else if (error.response.status === 401) {
          logout();
          return;
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server';
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchProfileDetails();
    fetchDashboardData();
    fetchBookings();
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchProfileDetails();
      fetchDashboardData();
      fetchBookings();
    }, [navigation])
  );

  useEffect(() => {
    fetchQuoteRequest(pageno);
  }, [fetchQuoteRequest, pageno]);

  useFocusEffect(
    useCallback(() => {
      setQuoteRequest([]);
      setPageno(1);
      setHasMore(true); // Reset hasMore on focus
      fetchQuoteRequest(1);
    }, [fetchQuoteRequest])
  );

  // Add onRefresh handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Always call all three functions on refresh
      await fetchQuoteRequest(1);
      await fetchBookings();
      await fetchDashboardData();
    } catch (e) {
      console.log('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [fetchQuoteRequest]);

  const renderQuoteRequest = ({ item }) => {
    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('QuoteRequestList', { locationId: item?.location_id, locationName: item?.location, quotesId: item?.id, customerId: item?.customer_id })}>
        <View style={styles.quoterequestTravelCard}>
          {/* Travel Image with Date Overlay */}
          <View style={styles.quoterequestImageContainer}>
            <Image
              source={{ uri: item?.location_data?.backgroud_image_url }} // Replace with actual image URL
              style={styles.quoterequestTravelImage}
            />
            {/* <View style={styles.quoterequestDateOverlay}>
              <MaterialIcons name="date-range" size={12} color="white" />
              <Text style={styles.quoterequestDateText}>{moment(item?.package?.start_date).format('DD MMM YYYY')}</Text>
            </View> */}
          </View>

          {/* Travel Details */}
          <View style={styles.quoterequestTravelDetails}>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(55) }}>
              <Text style={styles.quoterequestTitle}>{item?.package?.name}</Text>
              <Text style={styles.quoterequestPrice}>₹{formatNumber(item?.package?.discounted_price)}</Text>
            </View> */}
            <View style={styles.quoterequestDetailRow}>
              <Image source={markerImg} tintColor={"#686868"} style={[styles.timeimage, { marginRight: 5 }]} />
              <Text style={styles.quoterequestSubtitle}>{item?.location}</Text>
            </View>
            <View style={styles.quoterequestDetailRow}>
              <Image source={userImg} tintColor={"#686868"} style={[styles.timeimage, { marginRight: 5 }]} />
              <Text style={styles.quoterequestDetailText}>Total Passengers: {Number(item?.edults) + Number(item?.kids)}</Text>
            </View>
            <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={timeImg} tintColor={"#686868"} style={[styles.timeimage2, { marginRight: 5 }]} />
                <Text style={styles.quoterequestDetailText}>{moment(item?.sdate).format('DD MMM YYYY')}</Text>
                <Text style={styles.quoterequestDetailText}> - </Text>
                <Text style={styles.quoterequestDetailText}>{moment(item?.edate).format('DD MMM YYYY')}</Text>
              </View>
            </View>
            <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={timeImg} tintColor={"#686868"} style={[styles.timeimage2, { marginRight: 5 }]} />
                <Text style={styles.quoterequestDetailText}>
                  {(() => {
                    const start = moment(item?.sdate);
                    const end = moment(item?.edate);
                    const days = end.diff(start, 'days');
                    const nights = days > 0 ? days - 1 : 0;
                    return `${days} Days ${nights} Nights`;
                  })()}
                </Text>
              </View>
              {/* <TouchableOpacity style={styles.quoterequestSendButton}>
                <Text style={styles.quoterequestSendText}>Send</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPageno(prevPage => prevPage + 1);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  };

  const handleSwipeLeft = (index) => {

  }

  const handleRejectWithConfirmation = (id) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => actionButton('reject', id),
        },
      ],
      { cancelable: true }
    );
  };

  const actionButton = async (forwhat, id) => {
    console.log(forwhat, id, "dsfdsfdsfdsfdsfds");
    try {
      setIsLoading(true);
      const option = {
        booking_id: id,
        action: forwhat == 'accept' ? "accepted" : "rejected",
      };
      const userToken = await AsyncStorage.getItem('userToken');
      console.log(userToken, 'userToken')
      const response = await axios.post(`${API_URL}/agent/booking-action`, option, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + userToken
        }
      });

      console.log(response.data)
      if (response.data.response == true) {
        Toast.show({
          type: 'success',
          text1: '',
          text2: response.data.message || 'Booking status updated!',
          position: 'top',
          topOffset: Platform.OS == 'ios' ? 55 : 20
        });
        fetchBookings();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Failed to Booking status',
          position: 'top',
          topOffset: Platform.OS == 'ios' ? 55 : 20
        });
      }


    } catch (error) {
      console.error('Error Booking status:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: errors[key][0]
          });
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Something went wrong'
        });
      }
    } finally {
      setIsLoading(false);
    }

  }

  const formatNumber = (num) => {
    if (num >= 100000) {
      return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakhs
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
    }
    return num.toString(); // Less than 1000
  };

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
      {/* <CustomHeader commingFrom={'Home'} onPressProfile={() => navigation.navigate('Profile')} /> */}
      <View style={styles.homeHeaderView}>
        <View style={styles.nameSection}>
          <View style={styles.collumnView}>
            <Text style={styles.username}>
              HI, {userInfo?.name}
              {userInfo?.parent_data ? ` (${userInfo.parent_data.name})` : ''}
            </Text>
            <View style={styles.locationView}>
              <Image
                source={markerImg}
                style={styles.markerIcon}
              />
              <Text style={[styles.locationname, { marginLeft: 5 }]} numberOfLines={2}>{userInfo?.address ? userInfo?.address : userInfo?.parent_data?.address}</Text>
            </View>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={() => {
          navigation.navigate('Notification');
        }}>
          <View style={styles.iconSection}>
            <Image
              source={notificationImg}
              style={styles.notificationIcon}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF455C"
            colors={['#FF455C']}
          />
        }
      >
        <View style={styles.filtercontainer}>
          {/* Total Earning */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFCDD2' }]}>
                <Image source={totalearningIcon} style={[styles.filterimage]} />
              </View>
              <View style={{ width: responsiveWidth(30) }}>
                <Text style={styles.title}>Total Earning</Text>
              </View>
            </View>
            <Text style={styles.value}>₹{formatNumber(totalEarning)}</Text>
          </View>

          {/* Total Booking */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
              <View style={[styles.iconContainer, { backgroundColor: '#C8E6C9' }]}>
                <Image source={totalbookingIcon} style={[styles.filterimage]} />
              </View>
              <View style={{ width: responsiveWidth(30) }}>
                <Text style={styles.title}>Total Booking</Text>
              </View>
            </View>
            <Text style={styles.value}>{totalBooking}</Text>
          </View>

          {/* Complete Booking */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE0B2' }]}>
                <Image source={completeIcon} style={[styles.filterimage]} />
              </View>
              <View style={{ width: responsiveWidth(30) }}>
                <Text style={styles.title}>Complete Booking</Text>
              </View>
            </View>
            <Text style={styles.value}>{completeBooking}</Text>
          </View>

          {/* Upcoming Booking */}
          <View style={styles.statCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
              <View style={[styles.iconContainer, { backgroundColor: '#BBDEFB' }]}>
                <Image source={upcomingIcon} style={[styles.filterimage]} />
              </View>
              <View style={{ width: responsiveWidth(30) }}>
                <Text style={styles.title}>Upcoming Booking</Text>
              </View>
            </View>
            <Text style={styles.value}>{upcomingBooking}</Text>
          </View>
        </View>
        <View style={styles.tabView}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.tabContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.value}
                  onPress={() => setActiveTab(tab.value)}
                  style={[
                    styles.tab,
                    activeTab === tab.value && styles.activeTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.value && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 15 }}>
          {activeTab == 'New booking' ?
            <FlatList
              data={bookingData}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No bookings found.</Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Swipeable
                  key={index}
                  renderRightActions={() => {
                    // Show no buttons for rejected or cancelled status
                    if (item.status === 'rejected' || item.status === 'cancelled') {
                      return null;
                    }

                    // Show only decline button for accepted status
                    if (item.status === 'accepted') {
                      return (
                        <TouchableOpacity onPress={() => handleSwipeLeft(index)}>
                          <View style={styles.buttonContainer}>
                            <TouchableWithoutFeedback onPress={() => handleRejectWithConfirmation(item?.id)}>
                              <Image
                                source={declineButton}
                                style={styles.buttonIcon}
                              />
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableOpacity>
                      );
                    }

                    // Show both accept and decline buttons for pending status
                    if (item.status === 'pending') {
                      return (
                        <TouchableOpacity onPress={() => handleSwipeLeft(index)}>
                          <View style={styles.buttonContainer}>
                            <TouchableWithoutFeedback onPress={() => actionButton('accept', item?.id)}>
                              <Image
                                source={acceptButton}
                                style={[styles.buttonIcon, { marginLeft: 10 }]}
                              />
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => handleRejectWithConfirmation(item?.id)}>
                              <Image
                                source={declineButton}
                                style={styles.buttonIcon}
                              />
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableOpacity>
                      );
                    }

                    // Default case: show no buttons
                    return null;
                  }}
                >
                  <Pressable
                    onPress={() => navigation.navigate('MyBookingDetails', { bookingId: item })}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                  >
                    <View style={styles.newBookingCard}>
                      {/* User Info Section */}
                      <View style={styles.newBookingRow}>
                        <Image
                          source={{ uri: item?.package?.cover_photo_url }}
                          style={styles.newBookingProfileImage}
                        />
                        <View style={styles.newBookingUserInfo}>
                          <Text style={styles.newBookingUserName}>{item?.package?.name}</Text>
                          <Text style={styles.newBookingBookingId}>BOOKING-GT-{item.id}</Text>
                          <View style={styles.newBookingRow}>
                            <Text style={styles.newBookingDate}>
                              {moment(item.start_date).format('MMM DD')} - {moment(item.end_date).format('MMM DD')}
                            </Text>
                            {item?.package?.date_type === 0 ? (
                              <Text style={styles.newBookingDuration}>
                                {(() => {
                                  const start = moment(item.start_date);
                                  const end = moment(item.end_date);
                                  const days = end.diff(start, 'days');
                                  const nights = days > 0 ? days - 1 : 0;
                                  return `${days} Days ${nights} Nights`;
                                })()}
                              </Text>
                            ) : (
                              <Text style={styles.newBookingDuration}>{item?.package?.itinerary.length} Days {item.package?.itinerary.length - 1} Nights</Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.newBookingStatusButton,
                            {
                              backgroundColor:
                                item.status === 'accepted'
                                  ? '#009955'
                                  : item.status === 'pending'
                                    ? '#FC9512'
                                    : '#FF0004'
                            }
                          ]}
                        >
                          <Text style={styles.newBookingStatusText}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          borderBottomColor: '#C0C0C0',
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          marginVertical: 5,
                          marginTop: 10
                        }}
                      />
                      {/* Destination & Price */}
                      <View style={styles.newBookingFooter}>
                        <Text style={styles.newBookingDestination}>{item?.package?.location}</Text>
                        <Text style={styles.newBookingPrice}>₹{formatNumber(item.final_amount)}</Text>
                      </View>
                    </View>
                  </Pressable>
                </Swipeable>
              )}
            />
            :
            <FlatList
              data={quoteRequest}
              renderItem={renderQuoteRequest}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Quote request found.</Text>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={10}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    //paddingTop: responsiveHeight(1),
  },
  homeHeaderView: {
    width: responsiveWidth(100),
    height: responsiveHeight(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  nameSection: {
    marginTop: responsiveHeight(3),
    width: responsiveWidth(70)
  },
  collumnView: {
    flexDirection: 'column'
  },
  locationView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconSection: {
    marginTop: responsiveHeight(3),
    position: 'relative'
  },
  notificationIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain'
  },
  notificationPermissionIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF455C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  notificationPermissionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  markerIcon: {
    height: 15,
    width: 15,
    resizeMode: 'contain'
  },
  username: {
    color: '#757575',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    marginLeft: responsiveWidth(5)
  },
  locationname: {
    color: '#1B2234',
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.3),
  },
  tabView: {
    paddingHorizontal: 15,
  },
  /* tab section */
  tabContainer: {
    flexDirection: 'row',
    //justifyContent: 'space-around',
    marginVertical: 10,
    width: responsiveWidth(92)
  },
  tab: {
    // paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderColor: '#FF455C',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveHeight(5),
    width: responsiveWidth(30),
    marginRight: responsiveWidth(5)
  },
  activeTab: {
    backgroundColor: '#FF455C',
    borderColor: '#FF455C',
    borderWidth: 1
  },
  tabText: {
    color: '#FF455C',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  cardImg: {
    height: responsiveHeight(15), // Adjust height based on desired aspect ratio
    width: responsiveWidth(85),   // 92% of the screen width
    borderRadius: 6,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginTop: responsiveHeight(2)
  },

  newBookingCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 1
  },
  newBookingRow: {
    flexDirection: "row",
    //alignItems: "center",
    justifyContent: "space-between",
  },
  newBookingProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  newBookingUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  newBookingUserName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: "#000000",
    width: responsiveWidth(45),
  },
  newBookingBookingId: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    color: "#666"
  },
  newBookingDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    color: "#666"
  },
  newBookingStatusButton: {
    backgroundColor: "#009955",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    right: 0
  },
  newBookingStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  newBookingDuration: {
    fontSize: 12,
    color: "#666",
    //marginTop: 5,
  },
  newBookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  newBookingDestination: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: "#000000"
  },
  newBookingPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: "#FF455C"
  },
  quoterequestTravelCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 1,
    marginBottom: 10
  },
  quoterequestImageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  quoterequestTravelImage: {
    width: 100,
    height: responsiveHeight(13),
    borderRadius: 8,
  },
  quoterequestDateOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 5,
  },
  quoterequestDateText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 3,
  },
  quoterequestTravelDetails: {
    flex: 1,
  },
  quoterequestTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: "#1B2234"
  },
  quoterequestSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.6),
    color: "#686868",
  },
  quoterequestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  quoterequestDetailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.6),
    color: "#686868",
  },
  quoterequestRightSection: {
    alignItems: 'flex-end',
  },
  quoterequestPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2),
    color: '#FF455C',
  },
  quoterequestSendButton: {
    backgroundColor: '#009955',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  quoterequestSendText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: "#FFFFFF"
  },
  timeimage: {
    width: 15,
    height: 15,
    resizeMode: 'contain'
  },
  timeimage2: {
    width: 13,
    height: 13,
    resizeMode: 'contain'
  },
  filterimage: {
    width: 22,
    height: 22,
    resizeMode: 'contain'
  },
  filtercontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    //alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
    color: "#1B2234",
    marginLeft: 10,
  },
  value: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2.5),
    color: "#1B2234",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 100,
    height: '100%'
  },
  buttonIcon: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: responsiveHeight(10)
  },
  emptyText: {
    fontSize: responsiveFontSize(2),
    color: '#666',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});