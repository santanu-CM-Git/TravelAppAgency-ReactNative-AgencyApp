import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, ActivityIndicator, useWindowDimensions, Switch, Alert, Platform, BackHandler } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { logoIconImg, dateIcon, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, BASE_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';
import Icon from 'react-native-vector-icons/Feather';
import CheckBox from '@react-native-community/checkbox';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookingSummary = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [couponCode, setCouponCode] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [gstPercentage, setGstPercentage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [starCount, setStarCount] = useState(4);
    const [profileDetails, setProfileDetails] = useState(route?.params?.profileDetails);
    const [previousPageData, setPreviousPageData] = useState(route?.params?.submitData);
    const [payableAmount, setPayableAmount] = useState(route?.params?.submitData?.transaction_amount);
    const [consultFees, setCounsultFees] = useState(route?.params?.submitData?.transaction_amount)
    const [isEnabled, setIsEnabled] = useState(false);
    const [minTime, setMinTime] = useState(null);
    const [maxTime, setMaxTime] = useState(null);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [couponDeduction, setCouponDeduction] = useState(0);
    const [couponId, setCouponId] = useState(null)
    const [walletDeduction, setWalletDeduction] = useState(0);
    const [patientDetails, setPatientDetails] = useState(null)
    const [toggleCheckBox, setToggleCheckBox] = useState(true)




    const razorpayKeyId = RAZORPAY_KEY_ID;
    const razorpayKeySecret = RAZORPAY_KEY_SECRET;

    const convertTime = (time) => {
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };

    const findTimeBounds = (data) => {
        let minStartTime = data[0].slot_start_time;
        let maxEndTime = data[0].slot_end_time;

        data.forEach(slot => {
            if (slot.slot_start_time < minStartTime) {
                minStartTime = slot.slot_start_time;
            }
            if (slot.slot_end_time > maxEndTime) {
                maxEndTime = slot.slot_end_time;
            }
        });

        return { minStartTime, maxEndTime };
    };



    const beforeHandlePayment = () => {
        const option = {
            "therapist_id": previousPageData?.therapist_id,
            "slot_ids": previousPageData?.slot_ids,
            "date": previousPageData?.date,
            "booking_type": 'paid'
        }
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/slot-book-checking`, option, {
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    //console.log(JSON.stringify(res.data.data), 'submit form response')
                    if (res.data.response == true) {
                        setIsLoading(false)
                        handlePayment()
                    } else {
                        //console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', res?.data?.message || "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`slot booking checking error ${e}`)
                    console.log(e.response)
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                    ]);
                });
        });
    }

    const handlePayment = async () => {
        const totalAmount = payableAmount;

        if (totalAmount === 0) {
            submitForm(""); // Handle free payments
        } else {
            try {
                // Step 1: Retrieve the user token from AsyncStorage
                AsyncStorage.getItem('userToken', async (err, userToken) => {
                    console.log(userToken)
                    if (err || !userToken) {
                        console.error('Error retrieving user token:', err);
                        navigation.navigate('PaymentFailed', { message: 'User authentication failed' });
                        return;
                    }

                    // Step 2: Create an order on the server
                    const response = await axios.post(
                        `${API_URL}/patient/razorpay-order-create`,
                        {
                            "amount": totalAmount * 100, // Convert to smallest currency unit
                        },
                        {
                            headers: {
                                Accept: 'application/json',
                                Authorization: `Bearer ${userToken}`, // Add token to headers
                            },
                        }
                    );

                    const { order_id } = response.data; // Assuming the response includes { order_id: 'order_xyz' }

                    console.log(order_id)

                    if (order_id) {
                        // Step 3: Open Razorpay Checkout
                        const options = {
                            description: 'MYJOIE',
                            image: `https://res.cloudinary.com/dzl5v6ndv/image/upload/v1733826925/mtxdsgytrery6npks4qq.png`,
                            currency: 'INR',
                            key: razorpayKeyId,
                            amount: totalAmount * 100, // Amount in smallest currency unit
                            name: patientDetails?.name,
                            order_id: order_id, // Use the order ID from the server
                            prefill: {
                                email: patientDetails?.email,
                                contact: patientDetails?.mobile,
                                name: patientDetails?.name,
                            },
                            theme: { color: '#519ED8' },
                        };

                        RazorpayCheckout.open(options)
                            .then((data) => {
                                // Payment successful
                                submitForm(data.razorpay_payment_id);
                            })
                            .catch((error) => {
                                // Payment failed
                                console.error('Payment failed:', error.description);
                                navigation.navigate('PaymentFailed', { message: error.description });
                            });
                    } else {
                        navigation.navigate('PaymentFailed', { message: 'Order creation failed' });
                    }
                });
            } catch (error) {
                console.error('Error creating order:', error);
                navigation.navigate('PaymentFailed', { message: 'Failed to create order' });
            }
        }
    };

    const submitForm = (transactionId) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("therapist_id", previousPageData?.therapist_id);
        formData.append("slot_ids", previousPageData?.slot_ids);
        formData.append("date", previousPageData?.date);
        formData.append("coupon_id", couponId || '');
        formData.append("purpose", previousPageData?.purpose);
        formData.append("mode_of_conversation", previousPageData?.mode_of_conversation);
        formData.append("payment_mode", previousPageData?.payment_mode);
        formData.append("gateway_name", previousPageData?.gateway_name);
        formData.append("prescription_checked", previousPageData?.prescription_checked);
        formData.append("payment_status", previousPageData?.payment_status);
        formData.append("order_id", previousPageData?.order_id);
        formData.append("transaction_no", transactionId);
        formData.append("amount", previousPageData?.transaction_amount);
        formData.append("coupon_deduction", couponDeduction);
        formData.append("gst_amount", taxableAmount);
        formData.append("wallet_deduction", isEnabled ? walletDeduction : "0");
        formData.append("transaction_amount", payableAmount);

        //console.log(formData);

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/slot-book`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    //console.log(JSON.stringify(res.data.data), 'submit form response');
                    if (res.data.response) {
                        setIsLoading(false);
                        // Alert.alert('Hello..', res.data.message, [
                        //     {
                        //         text: 'Cancel',
                        //         onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }),
                        //         style: 'cancel',
                        //     },
                        //     { text: 'OK', onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }) },
                        // ]);
                        logPurchaseEvent(payableAmount)
                        // if(Platform.OS === 'ios'){
                        logPurchaseEventGoogle(payableAmount, transactionId)
                        // }
                        navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) })
                    } else {
                        //console.log('not ok');
                        setIsLoading(false);
                        Alert.alert('Oops..', res.data.message || "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false);
                    console.log(`booking submit from booking summary error ${e}`);
                    console.log(e.response);
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    };

    const logPurchaseEvent = async (finalPayAmount) => {
        // if (typeof finalPayAmount !== 'number' || finalPayAmount <= 0) {
        //     console.error("Invalid purchase amount:", finalPayAmount);
        //     return false;
        // }

        const params = {
            fb_currency: 'INR',
        };

        try {
            console.log("Logging purchase on iOS:", finalPayAmount, "INR");
            AppEventsLogger.logPurchase(finalPayAmount, 'INR', params);
            return true;
        } catch (error) {
            console.error("Error logging purchase event:", error);
            return false;
        }
    };
    const logPurchaseEventGoogle = async (amount, transactionId) => {
        try {
            await analytics().logEvent('purchase', {
                value: amount,
                currency: "INR", // e.g., 'USD'
                transaction_id: transactionId,
            });
            console.log('logPurchaseEventGoogle: Event logged successfully');
        } catch (error) {
            console.error('logPurchaseEventGoogle: Failed to log event', error);
        }
    };

    const changeCouponCode = (text) => {
        setCouponCode(text);
    };

    const callForCoupon = async () => {
        if (couponCode) {
            setIsCouponLoading(true);
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                if (!userToken) {
                    throw new Error('User token not found');
                }
                const option = {
                    "coupon_code": couponCode
                };

                const response = await axios.post(`${API_URL}/patient/coupon`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (response.data.response === true) {
                    setIsCouponLoading(false);
                    setCouponCode('');
                    const couponData = response.data.data[0];
                    //console.log(couponData, 'response from coupon code');
                    if (couponData) {
                        setCouponId(couponData.id)
                        // Calculate coupon deduction based on type
                        if (couponData.type === 'percentage') {
                            const couponAmount = (consultFees * couponData.discount_percentage) / 100;
                            setCouponDeduction(couponAmount);
                            const tax = ((consultFees - couponAmount) * gstPercentage) / 100
                            setTaxableAmount(tax)
                            setPayableAmount(consultFees - couponAmount + tax - walletDeduction);

                        } else if (couponData.type === 'flat') {
                            const couponAmount = parseFloat(couponData.discount_percentage);
                            setCouponDeduction(couponAmount);
                            const tax = ((consultFees - couponAmount) * gstPercentage) / 100
                            setTaxableAmount(tax)
                            setPayableAmount(consultFees - couponAmount + tax - walletDeduction);
                        }
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Sorry',
                            text2: "Coupon code is not valid.",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        setCouponDeduction(0)
                    }

                }
            } catch (error) {
                setIsCouponLoading(false);
                console.log(`Coupon apply error ${error}`);
                Alert.alert('Oops..', error.message || 'Something went wrong.', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            }
        } else {
            Alert.alert('Oops..', "Please enter coupon code first.", [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
    };

    const removeCoupon = () => {
        // Reset coupon deduction to 0
        setCouponDeduction(0);

        // Recalculate taxable amount based on original amount and GST percentage
        const originalAmount = route?.params?.submitData?.transaction_amount || 0;
        const calculatedTaxableAmount = ((originalAmount) * gstPercentage) / 100;
        //console.log(calculatedTaxableAmount, 'taxable amount')
        setTaxableAmount(calculatedTaxableAmount);

        // Calculate new payable amount
        let newPayableAmount = originalAmount + calculatedTaxableAmount;

        // Deduct wallet balance if the switch is enabled
        //console.log(isEnabled, 'wallet balance check or not')
        //console.log(walletDeduction, 'wallet balance')
        if (isEnabled) {
            newPayableAmount -= walletDeduction;
        }

        // Ensure payable amount is not negative
        newPayableAmount = Math.max(newPayableAmount, 0);

        // Update payable amount state
        setPayableAmount(newPayableAmount);
    };

    useEffect(() => {

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
    if (isLoading) {
        return (
            <Loader />
        )
    }



    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Summary'} onPress={() => navigation.goBack()} title={'Summary'} />

            <ScrollView style={styles.wrapper}>
                <View style={styles.card}>
                    <Text style={styles.title}>Jammu-Kashmir By Omega Tours</Text>
                    <Text style={styles.subtitle}>Jammu-Kashmir</Text>

                    <View style={styles.detailsRow}>
                        <Text style={styles.personText}>Person X 1</Text>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={styles.price}>$ 80</Text>
                            <View style={styles.dateRow}>
                                <Icon name="calendar" size={14} color="#999" />
                                <Text style={styles.date}> 20 Nov 2024</Text>
                            </View>
                        </View>
                    </View>

                    {/* <View style={styles.dateRow}>
                        <Icon name="calendar" size={14} color="#999" />
                        <Text style={styles.date}> 20 Nov 2024</Text>
                    </View> */}

                    <Text style={styles.cancellationText}>
                        Free Cancellation (48-Hours Notice)
                    </Text>
                </View>
                <View style={styles.card}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.couponText}>Enter promo code</Text>
                        <InputField
                            label={'Enter promo code'}
                            keyboardType=" "
                            value={couponCode}
                            //helperText={'Please enter lastname'}
                            inputType={'coupon'}
                            onChangeText={(text) => changeCouponCode(text)}
                        />
                    </View>
                    {couponDeduction === 0 ?
                        <TouchableOpacity style={styles.callCouponButton} onPress={() => callForCoupon()}>
                            {isCouponLoading ? (
                                <ActivityIndicator size="small" color="#417AA4" />
                            ) : (
                                <Text style={styles.callCouponText}>APPLY</Text>
                            )}
                        </TouchableOpacity>
                        :
                        <Text style={styles.callCouponText2}>Coupon already applied</Text>
                    }
                </View>
                <View style={{ marginHorizontal: 10, }}>
                    <Text style={styles.productText3}>Price Summary</Text>
                </View>
                <View style={styles.containerpricebreckdown}>
                    {/* Persons */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Person</Text>
                        <Text style={styles.value}>04 persons</Text>
                    </View>

                    {/* Price Details */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Price</Text>
                        <Text style={styles.value}>$ 80</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Taxes</Text>
                        <Text style={styles.value}>$ 10</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Booking Fee</Text>
                        <Text style={styles.value}>$ 05</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Subtotal */}
                    <View style={styles.row}>
                        <Text style={[styles.label, styles.bold, styles.red]}>Subtotal</Text>
                        <Text style={[styles.value, styles.bold, styles.red]}>$ 95</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Discounts */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Discount</Text>
                        <Text style={styles.value}>- $08</Text>
                    </View>
                    <Text style={styles.subText}>Promo Code Applied "SAVE20"</Text>

                    <View style={styles.divider} />

                    {/* Grand Total */}
                    <View style={styles.row}>
                        <Text style={[styles.label, styles.bold, styles.red, styles.large]}>Grand Total</Text>
                        <Text style={[styles.value, styles.bold, styles.red, styles.large]}>$ 87</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 10, }}>
                    <Text style={styles.productText3}>Cancellation Policy</Text>
                </View>
                <View style={[styles.cancelContainer, { marginBottom: responsiveHeight(5) }]}>
                    {/* Table Header */}
                    <View style={[styles.cancelRow, styles.cancelHeader]}>
                        <Text style={[styles.cancelText, styles.cancelBold]}>Time Of Cancellation</Text>
                        <Text style={[styles.cancelText, styles.cancelBold]}>Penalty Amount</Text>
                    </View>

                    {/* Cancellation Policies */}
                    {[
                        { time: '48 hrs before chart Preparation', amount: '$ 70' },
                        { time: '48-12 Hrs Before Chart Preparation', amount: '$ 70' },
                        { time: '12-4 Hrs Before Chart Preparation', amount: '$ 50' },
                        { time: '4 Hrs Before Chart Preparation', amount: 'Non Refundable', isNonRefundable: true },
                    ].map((item, index) => (
                        <View key={index} style={styles.cancelRow}>
                            <Text style={styles.cancelText}>{item.time}</Text>
                            <Text style={[styles.cancelText, item.isNonRefundable && styles.cancelGreyText]}>
                                {item.amount}
                            </Text>
                        </View>
                    ))}
                </View>
                <View style={styles.termsView}>
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            disabled={false}
                            value={toggleCheckBox}
                            onValueChange={(newValue) => setToggleCheckBox(newValue)}
                            tintColors={{ true: '#FF455C', false: '#444343' }}
                        />
                    </View>
                    <Text style={styles.termsText}>
                        I accept term and condition and privacy policy and cancellation policy
                    </Text>
                </View>
            </ScrollView>
            <View style={styles.buttonwrapper}>
                <View style={styles.buttonwrapperSection1}>
                    <Text style={styles.buttonwrapperText2}>$ 100</Text>
                </View>
                <View style={{ marginTop: responsiveHeight(1) }}>
                    <CustomButton label={"Pay Now"}
                        //onPress={() => beforeHandlePayment()}
                        onPress={() => navigation.navigate('PaymentSuccessScreen')}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default BookingSummary

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),
        marginBottom: responsiveHeight(10)
    },
    buttonwrapper: {
        paddingHorizontal: 25,
        bottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: '#E3E3E3',
        borderTopWidth: 1,
        paddingTop: 5,
        position: 'absolute',
        width: responsiveWidth(100),
        backgroundColor: '#fff'
    },
    buttonwrapperSection1: { flexDirection: 'column', },
    buttonwrapperText1: { color: '#746868', fontSize: responsiveFontSize(1.7), fontFamily: 'Poppins-Medium', },
    buttonwrapperText2: { color: '#444343', fontSize: responsiveFontSize(2.5), fontFamily: 'Poppins-Bold', },
    total3Value: { width: responsiveWidth(89), height: responsiveHeight(15), backgroundColor: '#FFF', padding: 10, borderRadius: 15, elevation: 5, justifyContent: 'center', marginTop: responsiveHeight(2), alignSelf: 'center', marginBottom: 5 },
    couponText: { color: '#2D2D2D', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), marginLeft: responsiveWidth(1) },
    callCouponButton: { position: 'absolute', right: 25, top: responsiveHeight(9) },
    callCouponText: { color: '#FF455C', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), },
    callCouponText2: { position: 'absolute', right: 25, top: responsiveHeight(7), color: '#FF455C', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(1.7), },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3, // For Android
    },
    title: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginVertical: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    personText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#444',
    },
    price: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Bold',
        color: '#FF3B5C',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    date: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },
    cancellationText: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-bold',
        color: '#28a745',
        fontWeight: 'bold',
        marginTop: 10,
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2.5),
        marginTop: responsiveHeight(1),
    },
    containerpricebreckdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3, // For Android
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    label: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    value: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#868686',
    },
    bold: {
        fontWeight: 'bold',
    },
    red: {
        color: '#FF455C',
    },
    large: {
        fontSize: responsiveFontSize(2),
    },
    subText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        color: '#424242',
        marginBottom: 5,
        marginLeft: 10,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginVertical: 8,
    },
    cancelContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    cancelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,

    },
    cancelHeader: {
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
    },
    cancelText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
    },
    cancelBold: {
        fontWeight: 'bold',
    },
    cancelGreyText: {
        color: '#868686',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.5),
    },
    termsView: {
        marginBottom: responsiveHeight(5),
        paddingHorizontal: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    termsText: {
        color: '#746868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
        textAlign: 'left',
    },
    checkboxContainer: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
        // Adjust the scale values to control the size
    },
});
