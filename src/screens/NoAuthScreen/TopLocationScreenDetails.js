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
    StatusBar,
    ImageBackground
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import RadioGroup from 'react-native-radio-buttons-group';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function TopLocationScreenDetails({ navigation }) {

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
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

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
    const [searchText, setSearchText] = useState("");

    const onChangeFromDate = (event, selectedDate) => {
        setShowFromDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setFromDate(selectedDate);
    };

    const onChangeToDate = (event, selectedDate) => {
        setShowToDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setToDate(selectedDate);
    };
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const [pricevalues, setPriceValues] = useState([5000, 25000]);

    const [selectedId2, setSelectedId2] = useState();

    const radioButtons2 = useMemo(() => ([
        {
            id: '1',
            label: 'Male',
            value: 'Male',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'

            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,

        },
        {
            id: '2',
            label: 'Female',
            value: 'Female',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'
            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,
        },

    ]), []);

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
            const backAction = () => {
               navigation.goBack()
               return true
              };
          
              const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
              );
          
              return () => backHandler.remove();
        }, [navigation])
    );

    return (
        <SafeAreaView style={styles.Container}>
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            <StatusBar translucent backgroundColor="transparent" />
            <ScrollView>
                <ImageBackground
                    source={productImg} // Replace with your image URL
                    style={styles.background}
                    imageStyle={styles.imageStyle}
                >
                    {/* Header Icons */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Image
                                    source={arrowBackImg}
                                    style={styles.filterIcon}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.title, { marginLeft: responsiveWidth(2) }]}>Goa</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Image
                                source={shareImg}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Like Button */}
                    <TouchableOpacity style={styles.likeButton}>
                        <Image
                            source={likefillImg}
                            style={styles.likeIcon}
                        />
                    </TouchableOpacity>
                </ImageBackground>
                <View style={styles.searchSection}>
                    <View style={styles.searchInput}>
                        <View style={{ flexDirection: 'row', alignItems: "center", flex: 1 }}>
                            <Image
                                source={searchIconImg}
                                style={styles.searchIcon}
                            />
                            {/* <Text style={styles.placeholderText}>Search</Text> */}
                            <TextInput
                                style={styles.input}
                                placeholder="Search"
                                placeholderTextColor="#888"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <ScrollView showsHorizontalScrollIndicator={false} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <View style={styles.productSection}>
                            <View style={styles.topAstrologerSection}>
                                <View style={styles.totalValue4}>
                                    <Image
                                        source={productImg}
                                        style={styles.productImg4}
                                    />
                                    <View style={{ margin: 5 }}>
                                        <Text style={styles.productText4}>Jammu-Kashmir</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={mappinImg}
                                                style={styles.pinImg}
                                            />
                                            <Text style={styles.addressText}>Himachal Pradesh</Text>
                                        </View>
                                        <Text style={styles.travelerText}>Omega Tours</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                            <Text style={styles.addressText}>Slots : 05</Text>
                                            <Text style={styles.priceText2}>$72.00</Text>
                                        </View>
                                        <View
                                            style={{
                                                borderBottomColor: '#C0C0C0',
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                                marginVertical: 5
                                            }}
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.packageAvlText}>3 Days 4 Nights</Text>
                                            <View style={styles.rateingView}>
                                                <Image
                                                    source={starImg}
                                                    style={styles.staricon}
                                                />
                                                <Text style={styles.ratingText}>3.5</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.tagTextView3}>
                                        <Image
                                            source={likefillImg}
                                            style={styles.likeImg}
                                            tintColor={"#FFFFFF"}
                                        />
                                    </View>
                                    <View style={styles.tagTextView4}>
                                        <View style={styles.dateContainer}>
                                            <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                            <Text style={styles.dateText}>04 Sept 2024</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.productSection}>
                            <View style={styles.topAstrologerSection}>
                                <View style={styles.totalValue4}>
                                    <Image
                                        source={productImg}
                                        style={styles.productImg4}
                                    />
                                    <View style={{ margin: 5 }}>
                                        <Text style={styles.productText4}>Jammu-Kashmir</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={mappinImg}
                                                style={styles.pinImg}
                                            />
                                            <Text style={styles.addressText}>Himachal Pradesh</Text>
                                        </View>
                                        <Text style={styles.travelerText}>Omega Tours</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                            <Text style={styles.addressText}>Slots : 05</Text>
                                            <Text style={styles.priceText2}>$72.00</Text>
                                        </View>
                                        <View
                                            style={{
                                                borderBottomColor: '#C0C0C0',
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                                marginVertical: 5
                                            }}
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.packageAvlText}>3 Days 4 Nights</Text>
                                            <View style={styles.rateingView}>
                                                <Image
                                                    source={starImg}
                                                    style={styles.staricon}
                                                />
                                                <Text style={styles.ratingText}>3.5</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.tagTextView3}>
                                        <Image
                                            source={likefillImg}
                                            style={styles.likeImg}
                                            tintColor={"#FFFFFF"}
                                        />
                                    </View>
                                    <View style={styles.tagTextView4}>
                                        <View style={styles.dateContainer}>
                                            <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                            <Text style={styles.dateText}>04 Sept 2024</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '75%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Filter</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Days</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(2) }}>
                                <View style={{ flexDirection: 'column' }}>
                                    {/* From Date */}
                                    <Text style={styles.textinputHeader}>Departure Date</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowFromDatePicker(true)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {showFromDatePicker && (
                                        <DateTimePicker
                                            value={fromDate}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeFromDate}
                                        />
                                    )}
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    {/* To Date */}
                                    <Text style={styles.textinputHeader}>Return Date</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowToDatePicker(true)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {showToDatePicker && (
                                        <DateTimePicker
                                            value={toDate}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeToDate}
                                        />
                                    )}
                                </View>
                            </View>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Price</Text>
                            <View style={styles.slidercontainer}>
                                <MultiSlider
                                    values={pricevalues}
                                    sliderLength={responsiveWidth(80)}
                                    onValuesChange={setPriceValues}
                                    min={5000}
                                    max={25000}
                                    step={100}
                                    selectedStyle={{ backgroundColor: "#FF455C" }}
                                    unselectedStyle={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                                    markerStyle={{ backgroundColor: "#FF455C" }}
                                />
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueText}>₹{pricevalues[0]}</Text>
                                    <Text style={styles.valueText}>₹{pricevalues[1]}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Rating</Text>
                            <View style={{ width: responsiveWidth(50), marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
                                <StarRating
                                    disabled={false}
                                    maxStars={5}
                                    rating={starCount}
                                    onChange={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={28}
                                    starStyle={{ marginHorizontal: responsiveWidth(1) }}
                                />
                            </View>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Gender</Text>
                            <View style={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1), marginLeft: -responsiveWidth(2.5) }}>
                                <RadioGroup
                                    radioButtons={radioButtons2}
                                    onPress={setSelectedId2}
                                    selectedId={selectedId2}
                                    layout='row'
                                    containerStyle={{ flexWrap: 'wrap' }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Apply"}
                                onPress={() => submitForFilter()}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        //paddingTop: responsiveHeight(1),
    },
    background: {
        width: '100%',
        height: 300,  // Adjust height as needed
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        marginTop: -responsiveHeight(0.5)
    },
    imageStyle: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        position: 'absolute',
        top: 35,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        color: '#FFFFFF',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    likeIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
    },
    searchSection: {
        paddingHorizontal: 15,
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2)
    },
    searchInput: {
        height: responsiveHeight(6),
        width: responsiveWidth(92),
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 26,
        ...Platform.select({
            android: {
                elevation: 5, // Only for Android
            },
            ios: {
                shadowColor: '#000', // Only for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),

    },
    searchIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginHorizontal: 8
    },
    placeholderText: {
        color: "#1B2234",
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    productSection: {
        marginTop: responsiveHeight(0),
        //marginLeft: 20
    },
    //product section
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 5,
        borderRadius: 15,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2),
        marginRight: 5
    },
    productImg4: {
        height: responsiveHeight(16),
        width: responsiveFontSize(21),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText4: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        marginTop: responsiveHeight(1),
    },
    pinImg: {
        height: 12,
        width: 12,
        resizeMode: 'contain',
        marginRight: 5
    },
    addressText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    priceText2: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
    },
    packageAvlText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.4),
    },
    rateingView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    tagTextView3: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(3),
        right: responsiveWidth(5),
        borderRadius: 8
    },
    likeImg: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    tagTextView4: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(12),
        left: responsiveWidth(10),
        borderRadius: 8
    },
    tagText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    dateContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        flexDirection: 'row',
    },
    dateText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
    },
    timeimage: {
        width: 15,
        height: 15,
        resizeMode: 'contain'
    },
    textinputHeader: {
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        marginBottom: 5,
        marginTop: 10
    },
    slidercontainer: {
        alignItems: "center",
        marginTop: responsiveHeight(0),
        marginBottom: responsiveHeight(1),
        marginLeft: -10
    },
    valueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: responsiveWidth(90),
        marginTop: responsiveHeight(0),
    },
    valueText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#000'
    },
});