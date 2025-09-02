import React, { useContext, useState, useRef, useCallback } from 'react';
import {
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
    FlatList,
    StatusBar,
    BackHandler
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
import { addIconImg, bankImg, plus, userPhoto } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BankScreen = ({ route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)

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
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Bank'} onPress={() => navigation.goBack()} title={'Bank'} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>

                <View style={styles.wrapper}>
                    <View style={styles.imagecontainer}>
                        {/* SVG for Circular Ripple with Bottom Fade */}
                        <Svg height="250" width="250" style={styles.svg}>
                            <Defs>
                                {/* Gradient Mask to Fade Bottom */}
                                <LinearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0%" stopColor="white" stopOpacity="1" />
                                    <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
                                    <Stop offset="100%" stopColor="white" stopOpacity="0" />
                                </LinearGradient>

                                {/* Masking the Circles */}
                                <Mask id="circleMask">
                                    <Rect x="0" y="0" width="250" height="160" fill="url(#fadeGradient)" />
                                </Mask>
                            </Defs>

                            {/* Outer Circles with Mask */}
                            <Circle cx="125" cy="125" r="100" stroke="#FF5566" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                            <Circle cx="125" cy="125" r="85" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                            <Circle cx="125" cy="125" r="70" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                        </Svg>

                        {/* Inner Circle with Bank Icon */}
                        <View style={styles.innerCircle}>
                            <Image source={bankImg} style={styles.icon} />
                        </View>
                    </View>
                    <Text style={styles.title}>Link your Bank Account</Text>
                    <Text style={styles.description}>
                        "Welcome! Let’s get started by linking your bank account. It’s a quick and secure
                        process that gives you access to all the features you need to manage your money effortlessly."
                    </Text>
                </View>


            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>

                <CustomButton label={"Link Bank"}
                    onPress={() => { navigation.navigate('BankListScreen') }}
                //onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default BankScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 23,
        //height: responsiveHeight(78)
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
        alignItems: 'center',
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFD6D6', // Light red circle
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD6D6', // Slightly darker red inner circle
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 50,
        height: 50,
        tintColor: '#E40046', // Red icon color
    },
    title: {
        fontSize: responsiveFontSize(2),
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        marginTop: 15,
    },
    description: {
        fontSize: responsiveFontSize(1.7),
        color: "#555",
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 8,
    },
    imagecontainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: responsiveHeight(10),
        marginBottom: responsiveHeight(10)
    },
    svg: {
        position: 'absolute',
    },

});
