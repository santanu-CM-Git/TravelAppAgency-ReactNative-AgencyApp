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
import { addIconImg, bankImg, plus, productImg, userPhoto } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankLinkedScreen = ({ route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [bankAccounts, setBankAccounts] = useState([])

    const fetchBankAccounts = () => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log('usertoken', usertoken)
            axios.post(`${API_URL}/agent/razorpay-bank-account-fetch`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log('Bank accounts:', res.data)
                    setBankAccounts(res.data.data ? [res.data.data] : [])
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`Bank accounts fetch error: ${e}`)
                    setIsLoading(false)
                });
        });
    }

    const deleteBankAccount = (accountId) => {
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.delete(`${API_URL}/agent/razorpay-bank-account-delete`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log('Delete response:', res.data)
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Bank account deleted successfully'
                    });
                    fetchBankAccounts() // Refresh the list
                })
                .catch(e => {
                    console.log(`Delete error: ${e}`)
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to delete bank account'
                    });
                    setIsLoading(false)
                });
        });
    }

    const handleDelete = (accountId) => {
        Alert.alert(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => deleteBankAccount(accountId),
                    style: 'destructive'
                }
            ]
        );
    }

    useEffect(() => {
        fetchBankAccounts()
    }, [])



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
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Bank'} onPress={() => navigation.goBack()} title={'Bank'} />
            <View showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>

                <View style={styles.wrapper}>
                    <Text style={styles.productText3}>Bank Account</Text>
                </View>
                {bankAccounts.length > 0 ? (
                    bankAccounts.map((account, index) => (
                        <View key={index} style={styles.card}>
                            <Image source={bankImg} style={styles.bankLogo} />
                            <View style={styles.textContainer}>
                                <Text style={styles.bankName}>{account.bank_name || 'Bank Account'} {account.bank_account_no}</Text>
                                <Text style={styles.accountType}>IFSC: {account.ifsc_code}</Text>
                                <Text style={styles.accountHolder}>Account Holder: {account.account_holder_name || account.agent_name}</Text>
                                
                                {/* KYC Verification Tag */}
                                {/* <View style={styles.kycContainer}>
                                    <View style={[
                                        styles.kycTag,
                                        { backgroundColor: (account.kyc_verified === true) ? '#E8F5E8' : '#FFF3E0' }
                                    ]}>
                                        <View style={[
                                            styles.kycDot,
                                            { backgroundColor: (account.kyc_verified === true) ? '#4CAF50' : '#FF9800' }
                                        ]} />
                                        <Text style={[
                                            styles.kycText,
                                            { color: (account.kyc_verified === true) ? '#2E7D32' : '#E65100' }
                                        ]}>
                                            {(account.kyc_verified === true) ? 'KYC Verified' : 'KYC Not Verified'}
                                        </Text>
                                    </View>
                                </View> */}
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(account.id)}>
                                <MaterialIcons name="delete" size={24} color="#FF0000" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.noAccountsContainer}>
                        <Text style={styles.noAccountsText}>No bank accounts linked</Text>
                    </View>
                )}

            </View>
            {bankAccounts.length === 0 && (
                <View style={styles.buttonwrapper}>
                    <CustomButton label={"Add Bank Account"}
                        onPress={() => { navigation.navigate('BankScreen') }}
                    />
                </View>
            )}
        </SafeAreaView >
    );
};

export default BankLinkedScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 15,
        //height: responsiveHeight(78)
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        marginTop: responsiveHeight(1),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        margin: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    bankLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    bankName: {
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    accountType: {
        color: '#808080',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    accountHolder: {
        color: '#808080',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    noAccountsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noAccountsText: {
        color: '#808080',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.8),
    },
    kycContainer: {
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    kycTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    kycDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    kycText: {
        fontSize: responsiveFontSize(1.4),
        fontFamily: 'Poppins-Medium',
    },
});
