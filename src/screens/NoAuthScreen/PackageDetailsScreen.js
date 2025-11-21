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
    StatusBar,
    ImageBackground,
    Share
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { editIcon, timeIcon, searchIconImg, productImg, mappinImg, starImg, arrowBackImg, shareImg, timeImg } from '../../utils/Images';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RadioGroup from 'react-native-radio-buttons-group';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function PackageDetailsScreen({ route }) {
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
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const [packageDetails, setPackageDetails] = useState([])
    const [filteredData, setFilteredData] = useState([]);

    const [totalDay, setTotalDay] = useState('')
    const [activeTab, setActiveTab] = useState('Day 1');
    const tabs = [
        { label: 'Day 1', value: 'Day 1' },
        { label: 'Day 2', value: 'Day 2' },
        { label: 'Day 3', value: 'Day 3' },
        { label: 'Day 4', value: 'Day 4' },
        { label: 'Day 5', value: 'Day 5' }
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
    const [quantityAdult, setQuantityAdult] = useState(1);
    const [quantityChild, setQuantityChild] = useState(1);
    const [adultPrice, setAdultPrice] = useState('80')
    const [childPrice, setChildPrice] = useState('40')

    const increaseQuantityAdult = () => {
        setQuantityAdult(quantityAdult + 1)
    };
    const decreaseQuantityAdult = () => {
        if (quantityAdult > 1) {
            setQuantityAdult(quantityAdult - 1);
        }
    };

    const increaseQuantityChild = () => {
        setQuantityChild(quantityChild + 1)
    };
    const decreaseQuantityChild = () => {
        if (quantityChild > 1) {
            setQuantityChild(quantityChild - 1);
        }
    };

    const itineraryFeatures = [
        { title: 'Natural beauty', description: 'See the snowcapped Himalayas, lakes, and pastures.' },
        { title: 'Historical sites', description: 'Explore the Amar Mahal Palace, Martand Sun Temple, and more.' },
        { title: 'Gardens', description: 'Visit the Indira Gandhi Tulip Garden, Shalimar Bagh, and Nishat Bagh.' },
        { title: 'Hill stations', description: 'Visit Gulmarg, Pahalgam, and Sonmarg.' },
        { title: 'Kashmir Ladakh tour', description: 'Explore Srinagar, Kargil, Leh, Nubra Valley, and Pangong Tso.' },
    ];

    const itineraryImages = [
        require('../../assets/images/tour.png'),
        require('../../assets/images/tour.png'),
        require('../../assets/images/tour.png'),
    ];

    const renderItineraryFeature = ({ item }) => (
        <View style={styles.itineraryFeatureItem}>
            <Text style={styles.itineraryBullet}>• </Text>
            <Text style={styles.itineraryFeatureText}>
                <Text style={styles.itineraryFeatureTitle}>{item.title}: </Text>
                {item.description}
            </Text>
        </View>
    );

    const renderItineraryImage = ({ item }) => (
        <Image source={productImg} style={styles.itineraryImage} />
    );

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

    const fetchPackageDetails = () => {
        console.log(route.params.packageId)
        const option = {
            "package_id": route?.params?.packageId
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/package-details`, option, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;

                    console.log(userInfo, 'package-details');
                    const start = moment(userInfo[0]?.start_date);
                    const end = moment(userInfo[0]?.end_date);

                    const days = end.diff(start, 'days');
                    const nights = days > 0 ? days - 1 : 0;
                    const durationText = `${days} Days ${nights} Nights`;
                    console.log(start, end, durationText, "fsdfdsfdsfdsfdsfs")
                    setPackageDetails(userInfo);
                    setFilteredData(userInfo[0]?.bookings || [])
                    setTotalDay(durationText)
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`package-details error ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchPackageDetails()
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchPackageDetails()
        }, [navigation])
    );

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredData(packageDetails[0]?.bookings || []);
        } else {
            const filtered = packageDetails[0]?.bookings?.filter((item) => {
                const fullName = `${item?.customer?.first_name} ${item?.customer?.last_name}`.toLowerCase();
                return fullName.includes(searchText.toLowerCase());
            });
            setFilteredData(filtered || []);
        }
    }, [searchText, packageDetails]);

    const onShare = async () => {
        try {
            const appStoreLink = "https://apps.apple.com/us/app/group-tour/id6754909782";
            const playStoreLink = "https://play.google.com/store/apps/details?id=com.grouptour.travelapp&hl=en";

            const shareMessage = `Check out this amazing travel package!\n\n${packageDetails[0]?.name}\nLocation: ${packageDetails[0]?.location?.name}\nDuration: ${totalDay}\nPrice: ${packageDetails[0]?.discounted_price}\n\nBook now and enjoy your dream vacation!\n\nDownload our app:\n📱 iOS: ${appStoreLink}\n📱 Android: ${playStoreLink}`;

            const result = await Share.share({
                message: shareMessage,
                title: 'Share Travel Package',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
        }
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container} edges={['bottom']}>
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            {/* <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} /> */}
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <ScrollView>
                <ImageBackground
                    source={{ uri: packageDetails[0]?.cover_photo_url }} // Replace with your image URL
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
                            <View style={{ position: 'relative', marginLeft: responsiveWidth(2) }}>
                                <View style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    borderRadius: 6,
                                }} />
                                <Text style={[styles.titleM, { zIndex: 1, paddingHorizontal: 8, paddingVertical: 2 }]}>Package details</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('PackageEditScreen', { packageId: packageDetails[0]?.id })}>
                            <Image
                                source={editIcon}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                            <Image
                                source={shareImg}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={{ margin: 5, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1, marginRight: responsiveWidth(2) }}>
                            <Text style={styles.productText3}>{packageDetails[0]?.name}</Text>
                        </View>
                        <Text style={styles.priceText22}>₹{packageDetails[0]?.discounted_price}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={mappinImg}
                            style={styles.pinImg}
                        />
                        <Text style={styles.addressText}>{packageDetails[0]?.location?.name}</Text>
                    </View>
                    {/* <Text style={styles.travelerText}>Omega Tours</Text> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {packageDetails[0]?.date_type == 0 ? (
                            <Text style={styles.packageAvlTextMain}>{moment(packageDetails[0]?.start_date).format("DD MMMM YYYY")}</Text>
                        ) : (
                            <Text style={styles.packageAvlTextMain}>Package Expire at {moment(packageDetails[0]?.end_date).format("DD MMMM YYYY")}</Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={timeImg}
                                style={styles.pinImg}
                            />
                            {packageDetails[0]?.date_type == 0 ? (
                                <Text style={styles.addressText}>{totalDay}</Text>
                            ) : (
                                <Text style={styles.addressText}>{packageDetails[0]?.itinerary.length} Days {packageDetails[0]?.itinerary.length - 1} Nights</Text>
                            )}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "center" }}>
                        {/* <Text style={styles.packageAvlTextMain}>Slots : 05</Text> */}
                        <View style={styles.rateingView}>
                            <Image
                                source={starImg}
                                style={[styles.staricon, { marginTop: -5 }]}
                            />
                            <Text style={styles.ratingText}>{packageDetails[0]?.package_rating}</Text>
                        </View>
                    </View>
                </View>
                {packageDetails[0]?.date_type == 0 ? (
                    <View style={styles.availableCard}>
                        <Text style={styles.availableHeader}>Slots Details</Text>
                        <View style={styles.availableRow}>
                            <Text style={styles.availableLabel}>Total Slots</Text>
                            <Text style={styles.availableValue}>{packageDetails[0]?.seat_slots}</Text>
                        </View>
                        <View style={styles.availableRow}>
                            <Text style={styles.availableLabel}>Booked Slots</Text>
                            <Text style={styles.availableValue}>{packageDetails[0]?.booked_slots}</Text>
                        </View>
                        <View style={styles.availableRow}>
                            <Text style={styles.availableLabel}>Remaining Slots</Text>
                            <Text style={styles.availableValue}>{packageDetails[0]?.seat_slots - packageDetails[0]?.booked_slots}</Text>
                        </View>
                    </View>
                ) : (
                    null
                )}
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
                        {/* <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback> */}
                    </View>
                </View>
                <View style={{ paddingHorizontal: 15 }}>
                    <Text style={styles.productText3}>Booked traveler list</Text>

                </View>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    renderItem={({ item, index }) => (
                        <Pressable onPress={() => navigation.navigate('Message', {
                            screen: 'ChatScreen', params: {
                                userId: item?.customer?.id,
                                flag: 'chat',
                            }
                        })}>
                            <View style={styles.travelerCard}>
                                <Image
                                    source={{ uri: item?.customer?.profile_photo_url }}
                                    style={styles.travelerAvatar}
                                />
                                <View style={styles.travelerInfoContainer}>
                                    <Text style={styles.travelerName}>{item?.customer?.first_name} {item?.customer?.last_name}</Text>
                                    <View style={styles.travelerContact}>
                                        <FontAwesome name="phone" size={16} color="#FF455C" />
                                        <Text style={styles.travelerPhone}> {item?.customer?.country_code} {item?.customer?.mobile}</Text>
                                    </View>
                                    <Text style={styles.travelerDate}>{moment(item?.start_date).format("DD MMM YYYY")} - {moment(item?.end_date).format("DD MMM YYYY")}</Text>
                                </View>
                                <View style={styles.travelerSlotContainer}>
                                    <Text style={styles.travelerSlotNumber}>{Number(item?.adult) + Number(item?.children)}</Text>
                                    <Text style={styles.travelerSlotText}>Slot</Text>
                                </View>
                            </View>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: responsiveHeight(5), marginBottom: responsiveHeight(5) }}>
                            <Text style={{ fontSize: 16, color: '#888' }}>No data available</Text>
                        </View>
                    }
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        marginBottom: Platform.OS === 'ios' ? -responsiveHeight(3):0,
    },
    background: {
        width: '100%',
        height: responsiveHeight(40),  // Adjust height as needed
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
        top: Platform.OS === 'ios' ? responsiveHeight(6) : (StatusBar.currentHeight || 0) + responsiveHeight(1),
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleM: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        color: '#FFFFFF',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        //backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2.5),
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
    packageAvlTextMain: {
        color: '#2A2A2A',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.4),
    },
    rateingView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    travelerText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    priceText22: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
    },
    tab: {
        // paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderColor: '#FF455C',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(5),
        // width: responsiveWidth(28),
        marginRight: responsiveWidth(2)
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
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        marginBottom: 10,
    },
    userInfo: {
        flex: 1,
        marginLeft: 10,
    },
    date: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#000000'
    },
    rating: {
        flexDirection: 'row',
    },
    itineraryFeatureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    itineraryBullet: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
        color: '#696969',
    },
    itineraryFeatureText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
        color: '#696969',
        flexShrink: 1,
    },
    itineraryFeatureTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.7),
        color: '#696969',
    },
    itineraryImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    packageAvlText: {
        color: '#696969',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    button: {
        padding: 5,
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 10,
    },
    availableCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
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
        margin: 10,
    },
    availableHeader: {
        color: '#1B2234',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        marginBottom: 10,
    },
    availableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    availableLabel: {
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    availableValue: {
        color: '#868686',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
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
    input: {
        flex: 1,
        fontSize: responsiveFontSize(1.5),
        color: "#000",
        fontFamily: 'Poppins-Regular',
    },
    travelerCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
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
        margin: 1,
        marginBottom: 5,
        alignItems: 'center',
    },
    travelerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    travelerInfoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    travelerName: {
        color: '#000000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
    },
    travelerContact: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    travelerPhone: {
        color: '#777',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginLeft: 5,
    },
    travelerDate: {
        color: '#777',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    travelerSlotContainer: {
        alignItems: 'center',
        backgroundColor: '#FFEFF0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    travelerSlotNumber: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
    },
    travelerSlotText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
});