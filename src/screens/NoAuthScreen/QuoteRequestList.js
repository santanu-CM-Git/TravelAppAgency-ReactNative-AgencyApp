import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, CheckImg, filterImg, likefillImg, mappinImg, markerImg, phoneColor, plusIconstickyImg, productImg, searchIconImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import Modal from "react-native-modal";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CheckBox from '@react-native-community/checkbox';
import SelectMultiple from 'react-native-select-multiple'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const QuoteRequestList = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [quoteRequest, setQuoteRequest] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [pageno, setPageno] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchQuoteRequest = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/agent/location-wise-packages`, {
                request_quotes_id: route?.params?.quotesId
            }, {
                params: {
                    page
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            const responseData = response.data.data.data;
            console.log(responseData, 'requested-quotes')
            setQuoteRequest(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch requested-quotes error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, []);

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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setQuoteRequest([]);
        setPageno(1);
        setHasMore(true); // Reset hasMore on focus
        fetchQuoteRequest(1);
        setRefreshing(false);
    }, []);

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

    const renderQuoteRequest = ({ item }) => {
        return (
            <TouchableOpacity activeOpacity={0.9}
                onPress={() => { navigation.navigate('Package', { screen: 'PackageDetailsScreen', params: { packageId: item?.id }, key: Math.random().toString() }) }}
            >
                <View style={styles.quoterequestTravelCard}>
                    {/* Travel Image with Date Overlay */}
                    <View style={styles.quoterequestImageContainer}>
                        <Image
                            source={{ uri: item?.cover_photo_url }} // Replace with actual image URL
                            style={styles.quoterequestTravelImage}
                        />
                        {item?.date_type == 0 ? (
                            <View style={styles.quoterequestDateOverlay}>
                                <MaterialIcons name="date-range" size={12} color="white" />
                                <Text style={styles.quoterequestDateText}>{moment(item?.start_date).format('DD MMM YYYY')}</Text>
                            </View>
                        ) : (
                            null
                        )}
                    </View>

                    {/* Travel Details */}
                    <View style={styles.quoterequestTravelDetails}>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.quoterequestTitle}>{item?.name}</Text>
                            <Text style={styles.quoterequestPrice}>₹{formatNumber(item?.discounted_price)}</Text>
                        </View>
                        <View style={styles.quoterequestDetailRow}>
                            <Image source={markerImg} tintColor={"#686868"} style={[styles.timeimage, { marginRight: 5 }]} />
                            <Text style={[styles.quoterequestSubtitle,{marginTop:5}]}>{item?.location}</Text>
                        </View>
                        {item?.date_type == 0 ? (
                            <View style={styles.quoterequestDetailRow}>
                                <Image source={userImg} tintColor={"#686868"} style={[styles.timeimage, { marginRight: 5 }]} />
                                <Text style={styles.quoterequestDetailText}>Available Slots: {item?.seat_slots - item?.booked_slots}</Text>
                            </View>
                        ) : (
                            null
                        )}
                        <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={timeImg} tintColor={"#686868"} style={[styles.timeimage, { marginRight: 5 }]} />
                                {item?.date_type == 0 ?
                                    <Text style={styles.quoterequestDetailText}>
                                        {(() => {
                                            const start = moment(item?.start_date);
                                            const end = moment(item?.end_date);
                                            const days = end.diff(start, 'days');
                                            const nights = days > 0 ? days - 1 : 0;
                                            return `${days} Days ${nights} Nights`;
                                        })()}
                                    </Text>
                                    :
                                    <Text style={styles.quoterequestDetailText}>
                                        {item?.itinerary.length} Days {item?.itinerary.length - 1} Nights
                                    </Text>
                                }
                            </View>
                            <TouchableOpacity
                                style={styles.quoterequestSendButton}
                                onPress={(event) => {
                                    event.stopPropagation(); // Prevent parent onPress
                                    sendQuoteReplay(route?.params?.quotesId, item?.id);
                                }}
                            >
                                <Text style={styles.quoterequestSendText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
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

    const sendQuoteReplay = async (Id, packageId) => {
        try {
            setIsLoading(true);
            const option = {
                request_quotes_id: Id,
                package_id: packageId
            };
            console.log(option)
            // Here you would typically make an API call to submit the booking
            // For now, we'll just navigate to the success screen
            setIsLoading(false);
            const userToken = await AsyncStorage.getItem('userToken');
            console.log(userToken, 'userToken')
            const response = await axios.post(`${API_URL}/agent/requested-quotes-send-to-user`, option, {
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
                    text2: response.data.message || 'Quote send to user successfully!',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
                fetchQuoteRequest(1)
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to send quote',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
            }


        } catch (error) {
            console.error('Error send quote:', error);
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
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'List of quotes'} onPress={() => navigation.goBack()} title={route?.params?.locationName} />
            <View style={{ paddingHorizontal: 15, marginTop: responsiveHeight(2), paddingBottom: responsiveHeight(5) }}>
                <FlatList
                    data={quoteRequest}
                    renderItem={renderQuoteRequest}
                    keyExtractor={(item) => item.id.toString()}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No packages found.</Text>
                        </View>
                    )}
                />
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <TouchableOpacity
                    onPress={() => { navigation.navigate('Package', { screen: 'PackagesCreationScreenForCustomer', params: { customerId: route?.params?.customerId, locationId: route?.params?.locationId, locationName: route?.params?.locationName }, key: Math.random().toString() }) }}
                >
                    <Image source={plusIconstickyImg} style={styles.image} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default QuoteRequestList

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
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
        height: responsiveHeight(15),
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
        color: "#1B2234",
        width: responsiveWidth(45),
    },
    quoterequestSubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: "#686868",
        marginBottom: 5,
    },
    quoterequestDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 5,
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
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
