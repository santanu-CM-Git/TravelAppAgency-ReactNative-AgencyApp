import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, ImageBackground, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { acceptButton, bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, declineButton, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, searchIconImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import Modal from "react-native-modal";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Entypo';
import CheckBox from '@react-native-community/checkbox';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const MyBookingList = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [value, setValue] = useState('All');
    const [isFocus, setIsFocus] = useState(false);
    const [bookingData, setBookingData] = useState([]);
    const [therapistData, setTherapistData] = React.useState([])
    const [therapistFilterData, setTherapistFilterData] = React.useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [searchValue, setSearchValue] = useState('');
    const [sliderValuesForPrice, setSliderValuesForPrice] = useState([0, 10000]);

    const [searchText, setSearchText] = useState("");
    const [filteredBookingData, setFilteredBookingData] = useState([]);

    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [startDay, setStartDay] = useState(moment().format('YYYY-MM-DD'));
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});

    const fetchBookings = async () => {
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

            const requestData = {
                start_date: startDay,
                end_date: endDay
            };
            console.log(requestData)
            const response = await axios.post(`${API_URL}/agent/booking-list`, requestData, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.response) {
                console.log(JSON.stringify(response.data.data),'fetch booking details')
                setBookingData(response.data.data);
                setFilteredBookingData(response.data.data);
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
            let errorMessage = 'Failed to fetch bookings';

            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
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
            setRefreshing(false);
        }
    };

    const dateRangeSearch = () => {
        toggleCalendarModal();
        fetchBookings()
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredBookingData(bookingData);
        } else {
            const filtered = bookingData.filter(item =>
                item?.package?.name?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredBookingData(filtered);
        }
    }, [searchText, bookingData]);

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [navigation])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setStartDay(moment().format('YYYY-MM-DD'));
        setEndDay(null);
        fetchBookings().then(() => setRefreshing(false));
    }, []);

    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    }
    const handleDayPress = (day) => {
        if (startDay && !endDay) {
            const date = {}
            for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
                //console.log(d,'vvvvvvvvvv')
                date[d.format('YYYY-MM-DD')] = {
                    marked: true,
                    color: 'black',
                    textColor: 'white'
                };

                if (d.format('YYYY-MM-DD') === startDay) {
                    date[d.format('YYYY-MM-DD')].startingDay = true;
                }
                if (d.format('YYYY-MM-DD') === day.dateString) {
                    date[d.format('YYYY-MM-DD')].endingDay = true;
                }
            }

            setMarkedDates(date);
            setEndDay(day.dateString);
        }
        else {
            setStartDay(day.dateString)
            setEndDay(null)
            setMarkedDates({
                [day.dateString]: {
                    marked: true,
                    color: 'black',
                    textColor: 'white',
                    startingDay: true,
                    endingDay: true
                }
            })
        }

    }

    const handleSwipeLeft = (index) => {

    }

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
            <CustomHeader commingFrom={'Bookings'} onPress={() => navigation.navigate('HOME', { screen: 'Home' })} title={'Bookings'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
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
                    </View>
                </View>

                <View style={styles.bookingContainer}>
                    {/* Date Picker */}
                    <TouchableOpacity style={styles.bookingDatePicker} onPress={() => toggleCalendarModal()}>
                        <FontAwesome name="calendar" size={16} color="#FF455C" />
                        <Text style={styles.bookingDateText}>
                            {!endDay || moment(startDay).isSame(endDay, 'day')
                                ? moment(startDay).format('DD MMM, YYYY')
                                : `${moment(startDay).format('DD MMM, YYYY')} - ${moment(endDay).format('DD MMM, YYYY')}`}
                        </Text>
                    </TouchableOpacity>

                    {/* New Booking Button */}
                    <TouchableOpacity style={styles.bookingButton} onPress={() => navigation.navigate('NewBookingScreen')}>
                        <FontAwesome name="plus-circle" size={16} color="white" />
                        <Text style={styles.bookingButtonText}> New Booking</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <Loader />
                ) : (
                    <FlatList
                        data={filteredBookingData}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Image
                                    source={require('../../assets/images/no-data.png')}
                                    style={styles.emptyImage}
                                />
                                <Text style={styles.emptyText}>No bookings found for the selected date range</Text>
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
                                                    <TouchableWithoutFeedback onPress={() => actionButton('reject', item?.id)}>
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
                                                    <TouchableWithoutFeedback onPress={() => actionButton('reject', item?.id)}>
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
                            </Swipeable>
                        )}
                    />
                )}
            </ScrollView>
            {/* calender modal */}
            <Modal
                isVisible={isCalendarModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleCalendarModal} />
                </View> */}
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            {/* <Text style={{ color: '#444', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2) }}>Select your date</Text> */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Select your date</Text>
                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                    <Icon name="cross" size={20} color="#000000" onPress={toggleCalendarModal} />
                                </View>
                            </View>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#FF4B5C',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#FF4B5C',
                                    textMonthFontFamily: 'Poppins-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={"Apply"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    )
}

export default MyBookingList

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
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
    bookingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    bookingDatePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    bookingDateText: {
        fontSize: responsiveFontSize(1.5),
        color: "#686868",
        fontFamily: 'Poppins-Medium',
        marginLeft: 5
    },
    bookingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF4B5C',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    bookingButtonText: {
        fontSize: responsiveFontSize(1.5),
        color: "#FFFFFF",
        fontFamily: 'Poppins-Medium',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 100,
        height: '100%'
    },
    swipeLeftText: {
        color: 'white',
        fontWeight: 'bold'
    },
    buttonIcon: {
        height: 40,
        width: 40,
        resizeMode: 'contain',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginTop: responsiveHeight(10)
    },
    emptyImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: responsiveFontSize(2),
        color: '#666',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
});
