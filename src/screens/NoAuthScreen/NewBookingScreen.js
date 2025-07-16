import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    BackHandler
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { plus, userPhoto } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import { useFocusEffect } from '@react-navigation/native';
import { CountryPicker } from "react-native-country-codes-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const noOfAudult = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
    { label: '13', value: '13' },
    { label: '14', value: '14' },
    { label: '15', value: '15' },
];
const noOfChid = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
    { label: '13', value: '13' },
    { label: '14', value: '14' },
    { label: '15', value: '15' },
];
const paymentStatus = [
    { label: 'Partial', value: 'partisal' },
    { label: 'Full', value: 'full' },
]

const NewBookingScreen = ({ navigation, route }) => {

    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')
    const [phone, setPhone] = useState('');
    const [mobileError, setMobileError] = useState('')
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [price, setPrice] = useState('');
    const [priceError, setPriceError] = useState('')
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+91');
    const [packagelist, setPackagelist] = useState([]);
    const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
    const [pickedDocument, setPickedDocument] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);


    // package dropdown
    const [packagevalue, setPackageValue] = useState(null);
    const [isPackageFocus, setYearIsFocus] = useState(false);
    //payment status
    const [paymentstatusvalue, setPaymentStatusValue] = useState(null);
    const [isPaymentStatusFocus, setPaymentStatusIsFocus] = useState(false);
    //travelers status
    const [travelersstatusvalue, setTravelersStatusValue] = useState(null);
    const [isTravelerStatusFocus, setTravelerStatusIsFocus] = useState(false);

    //travelers status child
    const [travelersstatusvaluechild, setTravelersStatusValuechild] = useState(null);
    const [isTravelerStatusFocuschild, setTravelerStatusIsFocuschild] = useState(false);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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
                    const formattedData = userInfo.map(item => ({
                        label: item.name,
                        value: item.id
                    }));
                    console.log(userInfo, 'active package');
                    setPackagelist(formattedData);
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`all package error ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchactivePackage()
    }, []);
    const changeFirstname = (text) => {
        setFirstname(text)
        if (text) {
            setFirstNameError('')
        } else {
            setFirstNameError('Please enter name.')
        }
    }

    const changeEmail = (text) => {
        let reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (reg.test(text) === false) {
            //console.log("Email is Not Correct");
            setEmail(text)
            setEmailError('Please enter correct email id.')
            return false;
        }
        else {
            setEmailError('')
            //console.log("Email is Correct");
            setEmail(text)
        }
    }

    const onChangeText = (text) => {
        const phoneRegex = /^\d{10}$/;
        setPhone(text)
        if (!phoneRegex.test(text)) {
            setMobileError('Please enter a 10-digit number.')
        } else {
            setMobileError('')
        }
    }

    const changePrice = (text) => {
        setPrice(text)
        if (text) {
            setPriceError('')
        } else {
            setPriceError('Please enter price.')
        }
    }

    const submitForm = async() => {
        try {
        let isValid = true;

        // Validate firstname
        if (!firstname) {
            setFirstNameError('Please enter name.');
            isValid = false;
        } else {
            setFirstNameError('');
        }

        // Validate phone
        if (!phone) {
            setMobileError('Please enter phone number.');
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            setMobileError('Please enter a valid 10-digit phone number.');
            isValid = false;
        } else {
            setMobileError('');
        }

        // Validate email
        if (!email) {
            setEmailError('Please enter email id.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email id.');
            isValid = false;
        } else {
            setEmailError('');
        }

        // Validate package
        if (!packagevalue) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a package',
                position: 'top'
            });
        }

        // Validate price
        if (!price) {
            setPriceError('Please enter price.');
            isValid = false;
        } else {
            setPriceError('');
        }

        // Validate dates
        if (!startDate) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select start date',
                position: 'top'
            });
        }

        if (!endDate) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select end date',
                position: 'top'
            });
        }

        // Validate payment status
        if (!paymentstatusvalue) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select payment status',
                position: 'top'
            });
        }

        // Validate travelers
        if (!travelersstatusvalue) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select number of adult travelers',
                position: 'top'
            });
        }

        if (!travelersstatusvaluechild) {
            isValid = false;
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select number of child travelers',
                position: 'top'
            });
        }

        if (isValid) {
            setIsLoading(true);
            const bookingData = {
                name: firstname,
                country_code: countryCode,
                mobile: phone,
                email: email,
                booking_type: 'Offline',
                package_id: packagevalue,
                amount: price,
                start_date: moment(startDate).format('YYYY-MM-DD'),
                end_date: moment(endDate).format('YYYY-MM-DD'),
                payment_status: paymentstatusvalue,
                adult: travelersstatusvalue,
                children: travelersstatusvaluechild
            };

            // Here you would typically make an API call to submit the booking
            // For now, we'll just navigate to the success screen
            setIsLoading(false);
            console.log(bookingData, 'bookingDatabookingData');
            const userToken = await AsyncStorage.getItem('userToken');
            console.log(userToken, 'userToken')
            const response = await axios.post(`${API_URL}/agent/new-booking-cash`, bookingData, {
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
                    text2: response.data.message || 'Booking added successfully!',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to Booking',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
            }

        }
    } catch (error) {
        console.error('Error creating package:', error);
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

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
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

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'New Booking'} onPress={() => navigation.navigate('HOME', { screen: 'Home' })} title={'New Booking'} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Customer name</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter Customer name'}
                                keyboardType=" "
                                value={firstname}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeFirstname(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Customer Phone Number</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {mobileError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{mobileError}</Text> : <></>}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.countryModal}>
                                <TouchableOpacity onPress={() => setShow(true)} style={styles.countryInputView}>
                                    <Text style={{ color: '#808080', fontSize: responsiveFontSize(2) }}>{countryCode}</Text>
                                </TouchableOpacity>
                                {Platform.OS === 'android' && (
                                    <CountryPicker
                                        show={show}
                                        initialState={''}
                                        pickerButtonOnPress={(item) => {
                                            setCountryCode(item.dial_code);
                                            setShow(false);
                                        }}
                                        style={{
                                            modal: {
                                                height: responsiveHeight(60),
                                            },
                                            textInput: {
                                                color: '#808080'
                                            },
                                            dialCode: {
                                                color: '#808080'
                                            },
                                            countryName: {
                                                color: '#808080'
                                            }
                                        }}
                                    />
                                )}
                            </View>
                            <InputField
                                label={'Mobile Number'}
                                keyboardType="numeric"
                                value={phone}
                                inputType={'login'}
                                onChangeText={(text) => onChangeText(text)}
                                helperText={mobileError}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Customer E-mail</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {emailError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{emailError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Customer E-mail'}
                                keyboardType=" "
                                value={email}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeEmail(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Package</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isPackageFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={packagelist}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isPackageFocus ? 'Select Package' : '...'}
                                searchPlaceholder="Search..."
                                value={packagevalue}
                                onFocus={() => setYearIsFocus(true)}
                                onBlur={() => setYearIsFocus(false)}
                                onChange={item => {
                                    setPackageValue(item.value);
                                    setYearIsFocus(false);
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Price</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {priceError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{priceError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter Price'}
                                keyboardType="numeric"
                                value={price}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changePrice(text)}
                            />
                        </View>
                        <View style={styles.dateContainer}>
                            <View style={styles.dateinputContainer}>
                                <Text style={styles.header}>Start Date <Text style={styles.requiredheader}>*</Text></Text>
                                <TouchableOpacity
                                    style={styles.inputBox}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <FontAwesome name="calendar" size={16} color="#FF455C" />
                                    <Text style={styles.inputText}>
                                        {startDate ? moment(startDate).format('DD-MM-YYYY') : 'Select Start Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateinputContainer}>
                                <Text style={styles.header}>End Date <Text style={styles.requiredheader}>*</Text></Text>
                                <TouchableOpacity
                                    style={styles.inputBox}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <FontAwesome name="calendar" size={16} color="#FF455C" />
                                    <Text style={styles.inputText}>
                                        {endDate ? moment(endDate).format('DD-MM-YYYY') : 'Select End Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showStartDatePicker && (
                            <RNDateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onStartDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {showEndDatePicker && (
                            <RNDateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onEndDateChange}
                                minimumDate={startDate || new Date()}
                            />
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>payment status</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isPaymentStatusFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={paymentStatus}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isPaymentStatusFocus ? 'Select payment status' : '...'}
                                searchPlaceholder="Search..."
                                value={paymentstatusvalue}
                                onFocus={() => setPaymentStatusIsFocus(true)}
                                onBlur={() => setPaymentStatusIsFocus(false)}
                                onChange={item => {
                                    setPaymentStatusValue(item.value);
                                    setPaymentStatusIsFocus(false);
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Travelers (Adult)</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isTravelerStatusFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={noOfAudult}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isTravelerStatusFocus ? `Select number of adult` : '...'}
                                searchPlaceholder="Search..."
                                value={travelersstatusvalue}
                                onFocus={() => setTravelerStatusIsFocus(true)}
                                onBlur={() => setTravelerStatusIsFocus(false)}
                                onChange={item => {
                                    setTravelersStatusValue(item.value);
                                    setTravelerStatusIsFocus(false);
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Travelers (Child)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isTravelerStatusFocuschild && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={noOfChid}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isTravelerStatusFocuschild ? `Select number of child` : '...'}
                                searchPlaceholder="Search..."
                                value={travelersstatusvaluechild}
                                onFocus={() => setTravelerStatusIsFocuschild(true)}
                                onBlur={() => setTravelerStatusIsFocuschild(false)}
                                onChange={item => {
                                    setTravelersStatusValuechild(item.value);
                                    setTravelerStatusIsFocuschild(false);
                                }}
                            />
                        </View>
                    </View>

                </View>


            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>

                <CustomButton label={"Submit"}
                    //onPress={() => { navigation.navigate('PaymentSuccessScreen') }}
                    onPress={() => submitForm()}
                />
            </View>
        </SafeAreaView >
    );
};

export default NewBookingScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 23,
        //height: responsiveHeight(78)
        marginBottom: responsiveHeight(2)
    },
    header1: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(3),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    header: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    requiredheader: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.5),
        color: '#E1293B',
        marginBottom: responsiveHeight(1),
        marginLeft: responsiveWidth(1)
    },
    subheader: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '400',
        color: '#808080',
        marginBottom: responsiveHeight(1),
    },
    photoheader: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F'
    },
    imageView: {
        marginTop: responsiveHeight(2)
    },
    imageStyle: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10
    },
    plusIcon: {
        position: 'absolute',
        bottom: 10,
        left: 50
    },
    textinputview: {
        marginBottom: responsiveHeight(15),
        marginTop: responsiveHeight(5)
    },
    inputView: {
        paddingVertical: 1
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
    searchInput: {
        color: '#333',
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        //borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5
    },
    dropdownMenu: {
        backgroundColor: '#FFF'
    },
    dropdownMenuSubsection: {
        borderBottomWidth: 0,

    },
    mainWrapper: {
        flex: 1,
        marginTop: responsiveHeight(1)

    },
    dropdownHalf: {
        height: responsiveHeight(6),
        width: responsiveWidth(89),
        borderColor: '#DDD',
        borderWidth: 0.7,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: responsiveHeight(4)
    },
    placeholderStyle: {
        fontSize: responsiveFontSize(1.8),
        color: '#2F2F2F',
        fontFamily: 'Poppins-Regular'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#2F2F2F'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2F2F2F'
    },
    dayname: {
        color: '#716E6E',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.8),
        fontWeight: '500'
    },
    calenderInput: {
        height: responsiveHeight(7),
        width: responsiveWidth(88),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: responsiveHeight(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    termsView: {
        marginBottom: responsiveHeight(3),
        paddingHorizontal: 10,
        //alignSelf: 'flex-start',
    },
    termsText: {
        color: '#746868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        //textAlign: 'center',
    },
    termsLinkText: {
        color: '#746868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        textAlign: 'center',
        textDecorationLine: 'underline', // Optional: to make the link look more like a link
    },
    doneButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#EEF8FF',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: responsiveHeight(5)
    },
    doneText: {
        color: '#000',
        fontWeight: 'bold',
    },
    mainView: {
        alignSelf: 'center',
        marginTop: responsiveHeight(2)
    },
    imageContainer: {
        height: 90,
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    loader: {
        position: 'absolute',
    },
    iconStyle: { height: 25, width: 25, resizeMode: 'contain' },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: responsiveHeight(0),
        marginBottom: responsiveHeight(2)
    },
    dateinputContainer: {
        //flex: 1,
        width: responsiveWidth(40)
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: responsiveHeight(1)
    },
    inputText: {
        marginLeft: 8,
        color: '#767676',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    countryInputView: {
        height: responsiveHeight(6),
        width: responsiveWidth(17),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        marginTop: -responsiveHeight(2)
    },
});