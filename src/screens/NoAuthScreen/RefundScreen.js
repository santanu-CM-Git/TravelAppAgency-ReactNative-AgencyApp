import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, BackHandler, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../../assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment-timezone';
import Icon from "react-native-vector-icons/Entypo";
import { arrowRightImg, failedImg } from '../../utils/Images';
import { TouchableOpacity } from 'react-native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RefundScreen = ({ route }) => {
    const navigation = useNavigation();
    const [data, setData] = useState(JSON.stringify(route?.params?.message));
    const [appendView, setAppendView] = useState(false)
    const [appendView2, setAppendView2] = useState(false)

    useEffect(() => {
        // const detailsData = JSON.parse(route?.params?.detailsData);
        // setData(detailsData);
    }, []);

    const toggleView = () => {
        setAppendView(!appendView)
    }
    const toggleView2 = () => {
        setAppendView2(!appendView2)
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
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'Booking is Cancelled'} onPress={() => navigation.goBack()} title={'Booking is Cancelled'} />
            {/* <View style={styles.thankYouImageWrapper}>
                <Image
                    source={require('../../assets/images/payment_fail_icon.png')}
                    style={styles.filterIcon}
                />
                
            </View>
            <View style={styles.thankYouTextWrapper}>
                <Text style={styles.thankYouText}>Payment Status Awaited</Text>
                <Text style={styles.appreciationText}>Payment Failed, please try again.</Text>
            </View>
            <CustomButton label={"Back to Home"}
                onPress={() => navigation.navigate('Home')}
            /> */}
            <ScrollView>
                <View style={{ padding: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.unsuccessfullbookingText}>Refund of $ 75 processed</Text>
                    <Text style={styles.unsuccessfullbookingValue}>You cancelled all traveler(s)</Text>
                </View>

                <View style={styles.cardcontainer}>
                    {/* Booking Amount */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Refundable Amount</Text>
                        <Text style={styles.amountValue}>$ 80</Text>
                    </View>
                    {/* <Text style={styles.amountSubText}>In oikaxs</Text> */}
                    <View
                        style={{
                            borderBottomColor: '#C0C0C0',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 5
                        }}
                    />
                    {/* Timeline */}
                    <View style={styles.timeline}>
                        {/* Step 1: Booking Failed */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircleRed}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                                <View style={styles.verticalLine} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Booking cancelled</Text>
                                <Text style={styles.stepTime}>22 Nov, 02:11 AM</Text>
                            </View>
                        </View>

                        {/* Step 2: Checking Payment Status */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircleRed}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                                <View style={styles.verticalLine} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Refund Processed : $ 75</Text>
                                <Text style={styles.stepTime}>30 Oct 2024, 10:58</Text>
                            </View>
                        </View>
                        {/* Step 3: Checking Payment Status */}
                        <View style={styles.timelineItem}>
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircleRed}>
                                    <Text style={styles.stepNumber}>✔</Text>
                                </View>
                                {/* <View style={styles.verticalLine} /> */}
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Refund credited in account</Text>
                                <Text style={styles.stepTime}>Expected in 2-3 days</Text>
                                {/* Message Box */}
                                <View style={styles.messageBox}>
                                    <Text style={styles.messageText}>
                                        Refund of $ 75 with RRN number order_PF8j4MG9bEUmLO has been processed to your okaxis account.
                                        It takes 0-2 working days for refund to reflect in okaxis account.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            borderBottomColor: '#C0C0C0',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 10,
                        }}
                    />
                    <TouchableWithoutFeedback onPress={() => toggleView()}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.menuText}>View Refund Breakup</Text>
                            {/* <Icon name="chevron-right" size={16} color="#ff5b77" /> */}
                            <Image
                                source={arrowRightImg}
                                style={styles.arrowIcon}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                    {appendView ?
                        <Text>fsdfsdfdsf</Text> : <></>}
                    <View
                        style={{
                            borderBottomColor: '#C0C0C0',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 10,
                        }}
                    />
                    <TouchableWithoutFeedback onPress={() => toggleView2()}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.menuText}>How to check refund in bank statement?</Text>
                            {/* <Icon name="chevron-right" size={16} color="#ff5b77" /> */}
                            <Image
                                source={arrowRightImg}
                                style={styles.arrowIcon}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                    {appendView2 ?
                        <Text>fsdfsdfdsf</Text> : <></>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RefundScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //padding: 20,

    },
    thankYouImageWrapper: {
        flex: 0.4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thankYouTextWrapper: {
        paddingHorizontal: 20,
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    thankYouText: {
        color: '#444343',
        alignSelf: 'center',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        textAlign: 'center',
        marginBottom: 10,
    },
    appreciationText: {
        color: '#746868',
        alignSelf: 'center',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        height: responsiveHeight(7),
        backgroundColor: '#DEDEDE',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        alignItems: 'center',
    },
    headerText: {
        color: '#7D7D7D',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        textAlign: 'center',
        marginLeft: responsiveWidth(2),
    },
    filterIcon: {
        height: 80,
        width: 80,
        resizeMode: 'contain'
    },
    cardcontainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        margin: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    amountContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: responsiveHeight(3)
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    amountValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FF455C",
    },
    amountSubText: {
        fontSize: 14,
        color: "#777",
        marginBottom: 16,
    },
    timeline: {
        marginTop: 10,
    },
    timelineItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    iconCircleRed: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FF455C",
        justifyContent: "center",
        alignItems: "center",
    },
    iconCircleGray: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    stepNumber: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    stepContent: {
        marginLeft: 12,
        flex: 1,
    },
    stepTitle: {
        color: '#1B2234',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
    },
    stepTime: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
        marginBottom: 8,
    },
    messageBox: {
        backgroundColor: "#FFFAE6",
        padding: 10,
        borderRadius: 8,
    },
    messageText: {
        color: '#9B6E00',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    unsuccessfullbookingText: {
        color: '#686868',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    unsuccessfullbookingValue: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    failedIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    verticalLine: {
        position: "absolute",
        top: responsiveHeight(3.5),  // Position below the first circle
        left: "50%",
        width: 2,
        height: 40, // Adjust this to control spacing
        backgroundColor: "#FF455C",
    },
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    menuText: {
        flex: 1,
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#333',
    },
});