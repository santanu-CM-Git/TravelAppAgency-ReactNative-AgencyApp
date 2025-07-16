import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
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
    ImageBackground,
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
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg } from '../../utils/Images';
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
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function TopLocationScreen({  }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [notificationStatus, setNotificationStatus] = useState(false)
    const [therapistData, setTherapistData] = React.useState([])
    const [upcomingBooking, setUpcomingBooking] = useState([])
    const [previousBooking, setPreviousBooking] = useState([])
    const [starCount, setStarCount] = useState(4)
    const [activeSlide, setActiveSlide] = React.useState(0);
    const [bannerData, setBannerData] = useState([])
    const [customerSpeaksData, setCustomerSpeaksData] = useState([])
    const [userInfo, setuserInfo] = useState([])
    const [currentDateTime, setCurrentDateTime] = useState(moment.tz(new Date(), 'Asia/Kolkata'));
    const [freeBannerImg, setFreeBannerImg] = useState('')

    const [activeTab, setActiveTab] = useState('All  packages');
    const tabs = [
        { label: 'All  packages', value: 'All  packages' },
        { label: 'International', value: 'International' },
        { label: 'Domestic', value: 'Domestic' },
    ];

    const [activeTab2, setActiveTab2] = useState('New Packages')
    const [activeButtonNo, setActiveButtonNo] = useState(0)

    const [location, setLocation] = useState("Jammu-Kashmir");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    const [adultPassengers, setAdultPassengers] = useState("8");
    const [kidsPassengers, setKidsPassengers] = useState("2");

    const onChangeFromDate = (event, selectedDate) => {
        setShowFromDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setFromDate(selectedDate);
    };

    const onChangeToDate = (event, selectedDate) => {
        setShowToDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setToDate(selectedDate);
    };

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


    if (isLoading) {
        return (
            <Loader />
        )
    }
    useFocusEffect(
            useCallback(() => {
                const onBackPress = () => {
                    navigation.goBack();
                    return true; // Prevents default back behavior
                };
    
                BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
                return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            }, [navigation])
        );

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Top location'} onPress={() => navigation.goBack()} title={'Top location'} />

            <ScrollView>
                <View style={{ paddingHorizontal: 15, marginVertical: responsiveHeight(1) }}>
                    <SwitchSelector
                        initial={activeButtonNo}
                        onPress={value => setActiveTab2(value)}
                        textColor={'#746868'}
                        selectedColor={'#FFFFFF'}
                        buttonColor={'#FF455C'}
                        backgroundColor={'#F4F5F5'}
                        borderWidth={0}
                        height={responsiveHeight(7)}
                        valuePadding={6}
                        hasPadding
                        options={[
                            { label: "New Packages", value: "New Packages", }, //images.feminino = require('./path_to/assets/img/feminino.png')
                            { label: "Near by", value: "Near by", }, //images.masculino = require('./path_to/assets/img/masculino.png')
                        ]}
                        testID="gender-switch-selector"
                        accessibilityLabel="gender-switch-selector"
                    />
                </View>
                {activeTab2 == 'New Packages' ?
                    <View style={{ flexDirection: 'row',justifyContent:'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate('TopLocationScreenDetails')}>
                            <ImageBackground source={productImg} style={styles.card} imageStyle={styles.imageStyle}>

                                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.overlay} />
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{'Jammu-Kashmir'}</Text>
                                    <Text style={styles.activities}>{'120'} activities</Text>
                                </View>

                            </ImageBackground>
                        </TouchableOpacity>
                        <ImageBackground source={productImg} style={styles.card} imageStyle={styles.imageStyle}>
                            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.overlay} />
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{'Jammu-Kashmir'}</Text>
                                <Text style={styles.activities}>{'120'} activities</Text>
                            </View>
                        </ImageBackground>
                    </View>
                    :
                    <></>
                }

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
    card: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
        borderRadius: 15,
        overflow: "hidden",
        margin: 5,
    },
    imageStyle: {
        borderRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 15,
    },
    textContainer: {
        position: "absolute",
        bottom: 15,
        left: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    activities: {
        fontSize: 14,
        color: "#ddd",
    },


});