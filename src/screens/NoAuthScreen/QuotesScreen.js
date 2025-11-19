import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../utils/Images'
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
import { SafeAreaView } from 'react-native-safe-area-context';

const QuotesScreen = ({  route }) => {
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

    useEffect(() => {

    }, []);
    useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            navigation.goBack();
            return true;
          };
      
          const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
          return () => backHandler.remove(); // Proper cleanup
        }, [navigation])
      );


    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'My request'} onPress={() => navigation.navigate('HOME', { screen: 'Home' })} title={'My request'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={styles.cardContainer}>
                    <Image source={tourImg} style={styles.image} />
                    <View style={styles.detailsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title}>Jammu-Kashmir</Text>

                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={timeImg} style={[styles.timeimage, { marginRight: 5 }]} />
                            <Text style={styles.duration}>10 Days 09 Nights</Text>
                        </View>
                        <View style={styles.statsContainer}>
                            <Image source={userImg} style={[styles.timeimage, { marginRight: 5 }]} />
                            <Text style={styles.statsText}> Total Adult: 08</Text>
                            <Text style={styles.statsText}> Total Kids: 08</Text>
                        </View>

                    </View>
                    <View style={styles.dateContainer}>
                        <Image source={calendarImg} style={[styles.timeimage, { marginRight: 5 }]} />
                        <Text style={styles.dateText}>04 Sept 2024</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <TouchableOpacity onPress={() => navigation.navigate('QuotesListScreen')}>
                    <Image source={plusIconstickyImg} style={styles.image} />
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    )
}

export default QuotesScreen

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
});
