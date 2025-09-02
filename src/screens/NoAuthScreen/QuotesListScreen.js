import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, CheckImg, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, searchIconImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating-widget';
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
import { SafeAreaView } from 'react-native-safe-area-context';


const QuotesListScreen = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [value, setValue] = useState('All');
    const [isFocus, setIsFocus] = useState(false);
    const [therapistData, setTherapistData] = React.useState([])
    const [therapistFilterData, setTherapistFilterData] = React.useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [activeTab, setActiveTab] = useState('Experience')
    const [searchValue, setSearchValue] = useState('');
    const [sliderValuesForPrice, setSliderValuesForPrice] = useState([0, 10000]);
    const [starCount, setStarCount] = useState(5)

    useEffect(() => {

    }, []);

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const [pricevalues, setPriceValues] = useState([5000, 25000]);
    const [distancevalues, setDistanceValues] = useState([0, 25000]);

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
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'List of quotes'} onPress={() => navigation.navigate('HOME', { screen: 'Home' })} title={'List of quotes'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={styles.searchSection}>
                    <View style={styles.searchInput}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={searchIconImg}
                                style={styles.searchIcon}
                            />
                            <Text style={styles.placeholderText}>Search</Text>
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback>
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
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                    <Text style={styles.productText4}>Jammu-Kashmir</Text>
                                    <Text style={styles.productText5}>J K Travels</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(0.5) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={mappinImg}
                                            style={styles.pinImg}
                                        />
                                        <Text style={styles.addressText}>Himachal Pradesh</Text>
                                    </View>
                                    <Text style={styles.priceText2}>$72.00</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <Image
                                        source={userImg}
                                        style={styles.pinImg}
                                        tintColor={'#686868'}
                                    />
                                    <Text style={styles.packageAvlText}>Total Passengers : 08</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={timeImg}
                                            style={styles.pinImg}
                                        />
                                        <Text style={styles.packageAvlText}>3 Days 4 Nights</Text>
                                    </View>
                                    <View style={styles.rateingView}>
                                        <Image
                                            source={starImg}
                                            style={styles.staricon}
                                        />
                                        <Text style={styles.ratingText}>3.5</Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        borderBottomColor: '#C0C0C0',
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                        marginVertical: 5
                                    }}
                                />
                                <Text style={styles.productText6}>Required documents</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image
                                            source={CheckImg}
                                            style={styles.checkicon}
                                        />
                                        <Text style={styles.packageAvlText}>Adhar Card</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image
                                            source={CheckImg}
                                            style={styles.checkicon}
                                        />
                                        <Text style={styles.packageAvlText}>Pan Card</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image
                                            source={CheckImg}
                                            style={styles.checkicon}
                                        />
                                        <Text style={styles.packageAvlText}>Photos</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image
                                            source={CheckImg}
                                            style={styles.checkicon}
                                        />
                                        <Text style={styles.packageAvlText}>Passport</Text>
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
            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '60%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Filter</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    {/* <ScrollView style={{ marginBottom: responsiveHeight(0) }} > */}
                    <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
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
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Distance</Text>
                        <View style={styles.slidercontainer}>
                            <MultiSlider
                                values={distancevalues}
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
                                <Text style={styles.valueText}>{distancevalues[0]} KM</Text>
                                <Text style={styles.valueText}>{distancevalues[1]} KM</Text>
                            </View>
                        </View>
                    </View>
                    {/* </ScrollView> */}
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
    )
}

export default QuotesListScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    productSection: {
        marginTop: responsiveHeight(0),
        marginLeft: 20
    },
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        width: responsiveWidth(90),
        height: responsiveHeight(45),
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
        height: responsiveHeight(21),
        width: responsiveFontSize(42),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText4: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.8),
        marginTop: responsiveHeight(1),
    },
    productText5: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        marginTop: responsiveHeight(1),
    },
    productText6: {
        color: '#1B2234',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.8),
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
    travelerText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
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
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    checkicon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
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
        position: 'absolute',
        top: responsiveHeight(16),
        right: responsiveWidth(5),
    },
    tagText: {
        color: '#FFFFFF',
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
