import React, { useContext, useState, useRef, useCallback } from 'react';
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
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomHeader from '../../components/CustomHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankListScreen = ({ route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        agentName: '',
        accountNumber: '',
        ifscCode: '',
        email: '',
        mobileNumber: '',
        street: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        countryCode: '',
        pan: '',
        gst: ''
    });

    const fetchCountryCode = async (countryName) => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
            const data = await response.json();
            return data[0]?.cca2; // Returns 2-letter code
        } catch (error) {
            console.error('Error fetching country code:', error);
            return null;
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const panRegex = /^[a-zA-z]{5}\d{4}[a-zA-Z]{1}$/;
        const gstRegex = /^[0123][0-9][a-z]{5}[0-9]{4}[a-z][0-9][a-z0-9][a-z0-9]$/gi;
        
        const isPanValid = panRegex.test(formData.pan);
        const isGstValid = gstRegex.test(formData.gst);

        if (!isPanValid) {
            Alert.alert('Error', 'Please enter a valid PAN number');
            return true;
        }

        if (!isGstValid) {
            Alert.alert('Error', 'Please enter a valid GST number');
            return true;
        }

        return !formData.agentName || !formData.accountNumber || !formData.ifscCode ||
            !formData.email || !formData.mobileNumber || !formData.street || !formData.street2 ||
            !formData.city || !formData.state || !formData.postalCode || !formData.country ||
            !formData.pan || !formData.gst;
    };

    const createRazorpayBankAccount = async (formData) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.post(`${API_URL}/agent/razorpay-bank-account-create`, {
                agent_name: formData.agentName,
                bank_account_no: formData.accountNumber,
                ifsc_code: formData.ifscCode,
                email: formData.email,
                phone_no: formData.mobileNumber,
                street: formData.street,
                street2: formData.street2,
                city: formData.city,
                state: formData.state,
                pincode: formData.postalCode,
                country: formData.countryCode,
                pan: formData.pan,
                gst: formData.gst
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating bank account:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const countryCode = await fetchCountryCode(formData.country);
            if (!countryCode) {
                Alert.alert('Error', 'Invalid country name');
                return;
            }

            const updatedFormData = {
                ...formData,
                countryCode
            };

            setFormData(updatedFormData);
            console.log('Form Data with Country Code:', updatedFormData);

            // Create Razorpay bank account
            const bankAccountResponse = await createRazorpayBankAccount(updatedFormData);
            console.log('Bank Account Response:', bankAccountResponse);

            if (bankAccountResponse.response === true) {
                // Navigate to next screen with API response data
                // navigation.navigate('BankLinkedScreen', { 
                //     bankAccountData: bankAccountResponse.data,
                //     message: bankAccountResponse.message
                // });
                const subAccountId = bankAccountResponse.data?.razorpayAccountId; // Adjust key as per your API response

                // if (subAccountId) {
                //     const hostedKycUrl = `https://dashboard.razorpay.com/partners/onboarding?account_id=${subAccountId}`;

                //     console.log('Hosted KYC URL:', hostedKycUrl);
                //     // Option 1: Open in WebView screen (recommended)
                //     navigation.navigate('KycWebView', { url: hostedKycUrl });

                //     // Option 2: Open in external browser
                //      //Linking.openURL(hostedKycUrl);
                // } else {
                //     Alert.alert('Error', 'Sub-account ID missing in response');
                // }
                navigation.navigate('BankLinkedScreen');
            } else {
                Alert.alert('Error', bankAccountResponse.message || 'Failed to create bank account');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create bank account');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.goBack();
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );

    if (isLoading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Bank'} onPress={() => navigation.goBack()} title={'Agent Bank Account'} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
                <View style={styles.wrapper}>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Enter Bank Account Details</Text>

                        <InputField
                            label="Agent Name"
                            value={formData.agentName}
                            onChangeText={(text) => handleInputChange('agentName', text)}
                            placeholder="Enter your full name"
                            inputType="others"
                        />

                        <InputField
                            label="Bank Account Number"
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            placeholder="Enter account number"
                            keyboardType="numeric"
                            inputType="others"
                        />

                        <InputField
                            label="IFSC Code"
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
                            placeholder="Enter IFSC code"
                            inputType="ifsc"
                        />

                        <InputField
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            inputType="others"
                        />

                        <InputField
                            label="Mobile Number"
                            value={formData.mobileNumber}
                            onChangeText={(text) => handleInputChange('mobileNumber', text)}
                            placeholder="Enter mobile number"
                            keyboardType="phone-pad"
                            inputType="others"
                        />

                        <Text style={[styles.title, { marginTop: 20 }]}>Address Details</Text>

                        <InputField
                            label="Enter street address"
                            value={formData.street}
                            onChangeText={(text) => handleInputChange('street', text)}
                            placeholder="Enter street address"
                            inputType="others"
                        />

                        <InputField
                            label="Enter apartment, suite, unit, etc."
                            value={formData.street2}
                            onChangeText={(text) => handleInputChange('street2', text)}
                            placeholder="Enter apartment, suite, unit, etc."
                            inputType="others"
                        />

                        <InputField
                            label="City"
                            value={formData.city}
                            onChangeText={(text) => handleInputChange('city', text)}
                            placeholder="Enter city"
                            inputType="others"
                        />

                        <InputField
                            label="State"
                            value={formData.state}
                            onChangeText={(text) => handleInputChange('state', text)}
                            placeholder="Enter state"
                            inputType="others"
                        />

                        <InputField
                            label="Postal Code"
                            value={formData.postalCode}
                            onChangeText={(text) => handleInputChange('postalCode', text)}
                            placeholder="Enter postal code"
                            keyboardType="numeric"
                            inputType="others"
                        />

                        <InputField
                            label="Country"
                            value={formData.country}
                            onChangeText={(text) => handleInputChange('country', text)}
                            placeholder="Enter country"
                            inputType="others"
                        />

                        <InputField
                            label="PAN Number"
                            value={formData.pan}
                            onChangeText={(text) => handleInputChange('pan', text.toUpperCase())}
                            placeholder="Enter PAN number (e.g., AVOJB1111K)"
                            inputType="ifsc"
                        />

                        <InputField
                            label="GST Number"
                            value={formData.gst}
                            onChangeText={(text) => handleInputChange('gst', text.toUpperCase())}
                            placeholder="Enter GST number"
                            inputType="ifsc"
                        />

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                label="Continue"
                                onPress={handleSubmit}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default BankListScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 23,
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    title: {
        fontSize: responsiveFontSize(2),
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2),
    },
    addressInput: {
        height: responsiveHeight(10),
        textAlignVertical: 'top',
    },
    countryCodeContainer: {
        marginTop: 5,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    countryCodeText: {
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
    }
});
