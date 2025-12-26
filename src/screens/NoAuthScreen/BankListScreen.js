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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

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
        companyPan: '',
        gst: '',
        aadhar: '',
        businessType: ''
    });
    const [isBusinessTypeFocus, setIsBusinessTypeFocus] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const businessTypeData = [
        { label: 'LLP', value: 'llp' },
        { label: 'NGO', value: 'ngo' },
        { label: 'Other', value: 'other' },
        { label: 'Individual', value: 'individual' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Proprietorship', value: 'proprietorship' },
        { label: 'Public Limited', value: 'public_limited' },
        { label: 'Private Limited', value: 'private_limited' },
        { label: 'Trust, Society', value: 'trust_society' },
        { label: 'Not Yet Registered', value: 'not_yet_registered' },
        { label: 'Educational Institutes', value: 'educational_institutes' }
    ];

    const fetchCountryCode = async (countryName) => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
            const data = await response.json();
            
            // Find exact match first (case-insensitive)
            const exactMatch = data.find(country => 
                country.name.common.toLowerCase() === countryName.toLowerCase() ||
                country.name.official.toLowerCase() === countryName.toLowerCase()
            );
            
            // Return exact match if found, otherwise return first result
            return exactMatch?.cca2 || data[0]?.cca2;
        } catch (error) {
            console.error('Error fetching country code:', error);
            return null;
        }
    };

    const validateField = (field, value) => {
        let error = '';
        
        switch (field) {
            case 'agentName':
                if (!value.trim()) {
                    error = 'Account holder name is required';
                } else if (value.trim().length < 2) {
                    error = 'Account holder name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    error = 'Account holder name should contain only letters and spaces';
                }
                break;
                
            case 'accountNumber':
                if (!value.trim()) {
                    error = 'Account number is required';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Account number should contain only digits';
                } else if (value.length < 9 || value.length > 18) {
                    error = 'Account number must be between 9 and 18 digits';
                }
                break;
                
            case 'ifscCode':
                if (!value.trim()) {
                    error = 'IFSC code is required';
                } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) {
                    error = 'Invalid IFSC code format (e.g., ABCD0123456)';
                }
                break;
                
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
                
            case 'mobileNumber':
                if (!value.trim()) {
                    error = 'Mobile number is required';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Mobile number should contain only digits';
                } else if (value.length !== 10) {
                    error = 'Mobile number must be 10 digits';
                }
                break;
                
            case 'street':
                if (!value.trim()) {
                    error = 'Street address is required';
                } else if (value.trim().length < 5) {
                    error = 'Street address must be at least 5 characters';
                }
                break;
                
            case 'street2':
                if (!value.trim()) {
                    error = 'Apartment/Suite/Unit is required';
                } else if (value.trim().length < 2) {
                    error = 'Please enter apartment, suite, or unit details';
                }
                break;
                
            case 'city':
                if (!value.trim()) {
                    error = 'City is required';
                } else if (value.trim().length < 2) {
                    error = 'City name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    error = 'City should contain only letters and spaces';
                }
                break;
                
            case 'state':
                if (!value.trim()) {
                    error = 'State is required';
                } else if (value.trim().length < 2) {
                    error = 'State name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    error = 'State should contain only letters and spaces';
                }
                break;
                
            case 'postalCode':
                if (!value.trim()) {
                    error = 'Postal code is required';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Postal code should contain only digits';
                } else if (value.length !== 6) {
                    error = 'Postal code must be 6 digits';
                }
                break;
                
            case 'country':
                if (!value.trim()) {
                    error = 'Country is required';
                } else if (value.trim().length < 2) {
                    error = 'Country name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    error = 'Country should contain only letters and spaces';
                }
                break;
                
            case 'pan':
                if (!value.trim()) {
                    error = 'PAN number is required';
                } else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value.toUpperCase())) {
                    error = 'Invalid PAN format (e.g., AVOJB1111K)';
                }
                break;
                
            case 'companyPan':
                if (value.trim() && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value.toUpperCase())) {
                    error = 'Invalid PAN format (e.g., AVOJB1111K)';
                }
                break;
                
            case 'gst':
                if (value.trim() && !/^[0123][0-9][a-zA-Z]{5}[0-9]{4}[a-zA-Z][0-9][a-zA-Z0-9][a-zA-Z0-9]$/i.test(value)) {
                    error = 'Invalid GST number format';
                }
                break;
                
            case 'aadhar':
                if (value.trim() && value.length !== 12) {
                    error = 'Aadhar number must be 12 digits';
                } else if (value.trim() && !/^\d{12}$/.test(value)) {
                    error = 'Aadhar number should contain only digits';
                }
                break;
                
            case 'businessType':
                if (!value) {
                    error = 'Business type is required';
                }
                break;
                
            default:
                break;
        }
        
        return error;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field] && touched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        
        const error = validateField(field, formData[field]);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const fieldsToValidate = [
            'agentName', 'accountNumber', 'ifscCode', 'email', 'mobileNumber',
            'street', 'street2', 'city', 'state', 'postalCode', 'country',
            'pan', 'businessType', 'companyPan', 'gst', 'aadhar'
        ];
        
        // Mark all fields as touched
        const newTouched = {};
        fieldsToValidate.forEach(field => {
            newTouched[field] = true;
        });
        setTouched(newTouched);
        
        // Validate all fields
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });
        
        setErrors(newErrors);
        
        // Check if there are any errors
        return Object.keys(newErrors).length > 0;
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
                company_pan: formData.companyPan || '',
                gst: formData.gst || '',
                aadhar: formData.aadhar,
                business_type: formData.businessType
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
            Alert.alert('Error', 'Please fix all validation errors before submitting');
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
      
          const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
          return () => backHandler.remove(); // Proper cleanup
        }, [navigation])
      );

    if (isLoading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'Bank'} onPress={() => navigation.goBack()} title={'Agent Bank Account'} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
                <View style={styles.wrapper}>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Enter Bank Account Details</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Account holder name</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Account holder name"
                            value={formData.agentName}
                            onChangeText={(text) => handleInputChange('agentName', text)}
                            onBlur={() => handleBlur('agentName')}
                            placeholder="Enter name exactly as it appears in bank account"
                            inputType="others"
                            error={touched.agentName && errors.agentName ? true : false}
                        />
                        {touched.agentName && errors.agentName ? (
                            <Text style={styles.errorText}>{errors.agentName}</Text>
                        ) : (
                            <Text style={styles.helperText}>Name must match exactly as per your bank account records</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Bank Account Number</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Bank Account Number"
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            onBlur={() => handleBlur('accountNumber')}
                            placeholder="Enter account number"
                            keyboardType="numeric"
                            inputType="others"
                            error={touched.accountNumber && errors.accountNumber ? true : false}
                        />
                        {touched.accountNumber && errors.accountNumber && (
                            <Text style={styles.errorText}>{errors.accountNumber}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>IFSC Code</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="IFSC Code"
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text.toUpperCase())}
                            onBlur={() => handleBlur('ifscCode')}
                            placeholder="Enter IFSC code"
                            inputType="ifsc"
                            error={touched.ifscCode && errors.ifscCode ? true : false}
                        />
                        {touched.ifscCode && errors.ifscCode && (
                            <Text style={styles.errorText}>{errors.ifscCode}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            onBlur={() => handleBlur('email')}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            inputType="others"
                            error={touched.email && errors.email ? true : false}
                        />
                        {touched.email && errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Mobile Number"
                            value={formData.mobileNumber}
                            onChangeText={(text) => handleInputChange('mobileNumber', text.replace(/\D/g, '').slice(0, 10))}
                            onBlur={() => handleBlur('mobileNumber')}
                            placeholder="Enter mobile number"
                            keyboardType="phone-pad"
                            inputType="others"
                            error={touched.mobileNumber && errors.mobileNumber ? true : false}
                        />
                        {touched.mobileNumber && errors.mobileNumber && (
                            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                        )}

                        <Text style={[styles.title, { marginTop: 20 }]}>Address Details</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Street Address</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Enter street address"
                            value={formData.street}
                            onChangeText={(text) => handleInputChange('street', text)}
                            onBlur={() => handleBlur('street')}
                            placeholder="Enter street address"
                            inputType="others"
                            error={touched.street && errors.street ? true : false}
                        />
                        {touched.street && errors.street && (
                            <Text style={styles.errorText}>{errors.street}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Apartment, Suite, Unit, etc.</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Enter apartment, suite, unit, etc."
                            value={formData.street2}
                            onChangeText={(text) => handleInputChange('street2', text)}
                            onBlur={() => handleBlur('street2')}
                            placeholder="Enter apartment, suite, unit, etc."
                            inputType="others"
                            error={touched.street2 && errors.street2 ? true : false}
                        />
                        {touched.street2 && errors.street2 && (
                            <Text style={styles.errorText}>{errors.street2}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>City</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="City"
                            value={formData.city}
                            onChangeText={(text) => handleInputChange('city', text)}
                            onBlur={() => handleBlur('city')}
                            placeholder="Enter city"
                            inputType="others"
                            error={touched.city && errors.city ? true : false}
                        />
                        {touched.city && errors.city && (
                            <Text style={styles.errorText}>{errors.city}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>State</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="State"
                            value={formData.state}
                            onChangeText={(text) => handleInputChange('state', text)}
                            onBlur={() => handleBlur('state')}
                            placeholder="Enter state"
                            inputType="others"
                            error={touched.state && errors.state ? true : false}
                        />
                        {touched.state && errors.state && (
                            <Text style={styles.errorText}>{errors.state}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Postal Code</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Postal Code"
                            value={formData.postalCode}
                            onChangeText={(text) => handleInputChange('postalCode', text.replace(/\D/g, '').slice(0, 6))}
                            onBlur={() => handleBlur('postalCode')}
                            placeholder="Enter postal code"
                            keyboardType="numeric"
                            inputType="others"
                            error={touched.postalCode && errors.postalCode ? true : false}
                        />
                        {touched.postalCode && errors.postalCode && (
                            <Text style={styles.errorText}>{errors.postalCode}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Country</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Country"
                            value={formData.country}
                            onChangeText={(text) => handleInputChange('country', text)}
                            onBlur={() => handleBlur('country')}
                            placeholder="Enter country"
                            inputType="others"
                            error={touched.country && errors.country ? true : false}
                        />
                        {touched.country && errors.country && (
                            <Text style={styles.errorText}>{errors.country}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Authorized Signatory Personal PAN</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <InputField
                            label="Authorized Signatory Personal PAN"
                            value={formData.pan}
                            onChangeText={(text) => handleInputChange('pan', text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                            onBlur={() => handleBlur('pan')}
                            placeholder="Enter PAN number (e.g., AVOJB1111K)"
                            inputType="ifsc"
                            error={touched.pan && errors.pan ? true : false}
                        />
                        {touched.pan && errors.pan && (
                            <Text style={styles.errorText}>{errors.pan}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Company PAN (if any)</Text>
                        </View>
                        <InputField
                            label="Company PAN (if any)"
                            value={formData.companyPan}
                            onChangeText={(text) => handleInputChange('companyPan', text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                            onBlur={() => handleBlur('companyPan')}
                            placeholder="Enter Company PAN number (e.g., AVOJB1111K)"
                            inputType="ifsc"
                            error={touched.companyPan && errors.companyPan ? true : false}
                        />
                        {touched.companyPan && errors.companyPan && (
                            <Text style={styles.errorText}>{errors.companyPan}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Aadhar Number (Optional)</Text>
                        </View>
                        <InputField
                            label="Aadhar Number (Optional)"
                            value={formData.aadhar}
                            onChangeText={(text) => handleInputChange('aadhar', text.replace(/\D/g, '').slice(0, 12))}
                            onBlur={() => handleBlur('aadhar')}
                            placeholder="Enter Aadhar number (12 digits)"
                            keyboardType="numeric"
                            inputType="others"
                            error={touched.aadhar && errors.aadhar ? true : false}
                        />
                        {touched.aadhar && errors.aadhar && (
                            <Text style={styles.errorText}>{errors.aadhar}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>Business Type</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <Dropdown
                            style={[styles.dropdown, isBusinessTypeFocus && { borderColor: '#DDD' }, touched.businessType && errors.businessType && styles.dropdownError]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.selectedTextStyle}
                            data={businessTypeData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={!isBusinessTypeFocus ? 'Select Business Type' : '...'}
                            searchPlaceholder="Search..."
                            value={formData.businessType}
                            onFocus={() => setIsBusinessTypeFocus(true)}
                            onBlur={() => {
                                setIsBusinessTypeFocus(false);
                                handleBlur('businessType');
                            }}
                            onChange={item => {
                                handleInputChange('businessType', item.value);
                                setIsBusinessTypeFocus(false);
                            }}
                        />
                        {touched.businessType && errors.businessType && (
                            <Text style={styles.errorText}>{errors.businessType}</Text>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.label}>GST Number (Optional)</Text>
                        </View>
                        <InputField
                            label="GST Number (Optional)"
                            value={formData.gst}
                            onChangeText={(text) => handleInputChange('gst', text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
                            onBlur={() => handleBlur('gst')}
                            placeholder="Enter GST number"
                            inputType="ifsc"
                            error={touched.gst && errors.gst ? true : false}
                        />
                        {touched.gst && errors.gst && (
                            <Text style={styles.errorText}>{errors.gst}</Text>
                        )}

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
        flex: 1,
        marginBottom: Platform.OS === 'ios' ? -responsiveHeight(3):0,
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
    },
    label: {
        fontSize: responsiveFontSize(1.8),
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 5,
    },
    required: {
        fontSize: responsiveFontSize(1.8),
        color: "#FF0000",
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 2,
    },
    dropdown: {
        height: responsiveHeight(6),
        width: '100%',
        borderColor: '#DDD',
        borderWidth: 0.7,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: responsiveHeight(2)
    },
    placeholderStyle: {
        fontSize: responsiveFontSize(1.8),
        color: '#2F2F2F',
        fontFamily: 'Poppins-Regular'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#2F2F2F',
        fontFamily: 'Poppins-Regular'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2F2F2F',
        fontFamily: 'Poppins-Regular'
    },
    errorText: {
        color: '#FF0000',
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Poppins-Regular',
        marginTop: -responsiveHeight(2),
        marginBottom: responsiveHeight(1),
        marginLeft: responsiveHeight(0.5)
    },
    helperText: {
        color: '#666666',
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Poppins-Regular',
        marginTop: -responsiveHeight(2),
        marginBottom: responsiveHeight(1),
        marginLeft: responsiveHeight(0.5)
    },
    dropdownError: {
        borderColor: '#FF0000',
        borderWidth: 1
    }
});
