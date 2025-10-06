import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, filterImg, likefillImg, mappinImg, markerImg, phoneColor, plusIconstickyImg, productImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import CheckBox from '@react-native-community/checkbox';
import SelectMultiple from 'react-native-select-multiple'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../context/AuthContext';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from 'react-native-safe-area-context';

const PackagesScreen = ({ route }) => {

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true)
    const [allPackage, setAllPackage] = useState([])
    const [activePackage, setActivePackage] = useState([])
    const [cancelPackage, setCancelPackage] = useState([])

    const [activeTab, setActiveTab] = useState('All packages');
    const tabs = [
        { label: 'All packages', value: 'All packages' },
        { label: 'Active packages', value: 'Active packages' },
        { label: 'Closed packages', value: 'Closed packages' },
    ];

    const fetchallPackage = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/package-all`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;

                    console.log(userInfo, 'all package');
                    setAllPackage(userInfo);
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`all package error ${e}`)
                });
        });
    }
    const fetchactivePackage = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/package-active`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;

                    console.log(userInfo, 'active package');
                    setActivePackage(userInfo);
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`all active package error ${e}`)
                });
        });
    }
    const fetchcancelPackage = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/package-closed`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;

                    console.log(userInfo, 'cancel package');
                    setCancelPackage(userInfo);
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`all cancel package error ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchallPackage()
        fetchactivePackage()
        fetchcancelPackage()
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchallPackage()
            fetchactivePackage()
            fetchcancelPackage()
        }, [navigation])
    );
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

    const renderPackageCard = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item?.id })}>
                <View style={styles.quoterequestTravelCard}>
                    {/* Travel Image with Date Overlay */}
                    <View style={styles.quoterequestImageContainer}>
                        <Image
                            source={{ uri: item?.cover_photo_url }}
                            style={activeTab === 'Active packages' ? styles.quoterequestTravelImageActivePackage : styles.quoterequestTravelImage}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                            <Text style={styles.quoterequestTitle}>{item?.name}</Text>
                            <Text style={[styles.quoterequestPrice, { color: '#FF455C', }]}>₹{formatNumber(item?.discounted_price)}</Text>
                        </View>
                        {activeTab === 'All packages' ? (
                            <>
                                <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item?.date_type == 0 ? (
                                            <>
                                                <View style={{ backgroundColor: '#FFEFF1', padding: 3, borderRadius: 5, marginRight: 5 }}>
                                                    <Text style={[styles.quoterequestPrice, { color: '#FF455C', }]}>{item?.seat_slots - item?.booked_slots}</Text>
                                                </View>
                                                <Text style={styles.quoterequestSubtitle}>Slots Available</Text>
                                            </>
                                        ) : (
                                            null
                                        )}

                                    </View>
                                    <View style={styles.rateingView}>
                                        <Image
                                            source={starImg}
                                            style={[styles.staricon,{marginBottom: 5}]}
                                        />
                                        <Text style={styles.ratingText}>{item?.package_rating}</Text>
                                    </View>
                                </View>
                                <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.quoterequestPrice, { color: '#009955', marginRight: 5 }]}>{item?.booked_slots}</Text>
                                        <Text style={[styles.quoterequestPricelight, { color: '#009955' }]}>Booked Slot</Text>
                                    </View>
                                    {item?.date_type == 0 ? (
                                        <View style={styles.verticleLine}></View>
                                    ) : (
                                        null
                                    )}
                                    {item?.date_type == 0 ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={[styles.quoterequestPrice, { color: '#686868', marginRight: 5 }]}>{item?.seat_slots}</Text>
                                            <Text style={[styles.quoterequestPricelight, { color: '#686868' }]}>Total slots</Text>
                                        </View>
                                    ) : (
                                        null
                                    )}

                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
                                    <Text style={{
                                        fontFamily: 'Poppins-Regular',
                                        fontSize: responsiveFontSize(1.6),
                                        color: "#686868",
                                    }}>Slot : {item?.seat_slots - item?.booked_slots}</Text>
                                </View>
                                <View style={[styles.quoterequestDetailRow, { justifyContent: 'space-between' }]}>
                                    <View style={styles.rateingView}>
                                        <Image
                                            source={starImg}
                                            style={styles.staricon}
                                        />
                                        <Text style={styles.ratingText}>{item?.package_rating}</Text>
                                    </View>
                                    <TouchableOpacity style={[
                                        styles.quoterequestSendButton,
                                        { backgroundColor: activeTab === 'Active packages' ? '#009955' : '#D60707' }
                                    ]}>
                                        <Text style={styles.quoterequestSendText}>
                                            {activeTab === 'Active packages' ? 'Active' : 'Closed'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Packages'} onPress={() => navigation.goBack()} title={'Packages'} />
            <View>
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
                <View style={{ paddingHorizontal: 15, marginBottom: responsiveHeight(25) }}>
                    {activeTab === 'All packages' && (
                        <FlatList
                            data={allPackage}
                            renderItem={renderPackageCard}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No Package found.</Text>
                                </View>
                            )}
                        />
                    )}
                    {activeTab === 'Active packages' && (
                        <FlatList
                            data={activePackage}
                            renderItem={renderPackageCard}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No Active Package found.</Text>
                                </View>
                            )}
                        />
                    )}
                    {activeTab === 'Closed packages' && (
                        <FlatList
                            data={cancelPackage}
                            renderItem={renderPackageCard}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No Closed Package found.</Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <TouchableOpacity onPress={() => navigation.navigate('PackagesCreationScreen')}>
                    <Image source={plusIconstickyImg} style={styles.image} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default PackagesScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 10,
        marginHorizontal: 15,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    timeimage: {
        width: 15,
        height: 15,
        resizeMode: 'contain'
    },
    detailsContainer: {
        marginLeft: 10,
        flex: 1,
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    dateContainer: {
        backgroundColor: '#e6f4ea',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        flexDirection: 'row',
        position: "absolute",
        top: 5,
        right: 5
    },
    dateText: {
        color: '#009955',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    duration: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#555',
    },
    statsContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        marginTop: 5,
    },
    statsText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#FF455C',
    },
    tabView: {
        paddingHorizontal: 15,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: 10,
        width: responsiveWidth(92),
    },
    tab: {
        // paddingVertical: 8,
        paddingHorizontal: 7,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderColor: '#FF455C',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(4),
        width: responsiveWidth(30),
        marginRight: responsiveWidth(1)
    },
    activeTab: {
        backgroundColor: '#FF455C',
        borderColor: '#FF455C',
        borderWidth: 1
    },
    tabText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
    },
    activeTabText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
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
        marginVertical: 2,
        marginBottom: 5,
        margin: 1
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
    quoterequestTravelImageActivePackage: {
        width: 100,
        height: responsiveHeight(12),
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
        width: responsiveWidth(43),
    },
    quoterequestSubtitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
        color: "#FF455C",
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
    },
    quoterequestSendButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        //marginTop: 1,
        alignSelf: 'flex-end'
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
    quoterequestPricelight: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),

    },
    verticleLine: {
        height: '60%',
        width: 1,
        backgroundColor: '#909090',
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
