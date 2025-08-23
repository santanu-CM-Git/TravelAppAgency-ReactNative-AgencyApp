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
    BackHandler,
    Modal
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
import DocumentPicker from 'react-native-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const BankListScreencopy = ({ route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
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
        gst: '',
        // KYC Fields
        aadhaarNumber: '',
        dateOfBirth: '',
        gender: '',
        occupation: '',
        annualIncome: '',
        sourceOfFunds: '',
        // Document uploads
        panCardImage: null,
        aadhaarFrontImage: null,
        aadhaarBackImage: null,
        bankPassbookImage: null,
        addressProofImage: null
    });

    const [kycFormData, setKycFormData] = useState({
        aadhaarNumber: '',
        dateOfBirth: '',
        gender: '',
        occupation: '',
        annualIncome: '',
        sourceOfFunds: '',
        panCardImage: null,
        aadhaarFrontImage: null,
        aadhaarBackImage: null,
        bankPassbookImage: null,
        addressProofImage: null
    });

    const genderOptions = ['Male', 'Female', 'Other'];
    const occupationOptions = ['Salaried', 'Self-Employed', 'Business Owner', 'Student', 'Retired', 'Other'];
    const sourceOfFundsOptions = ['Salary', 'Business Income', 'Investment Returns', 'Rental Income', 'Other'];

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

    const pickDocument = async (type) => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
                copyTo: 'cachesDirectory',
            });
            
            const file = result[0];
            const updatedData = { ...kycFormData, [type]: file };
            setKycFormData(updatedData);
            
            // Also update main form data
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));
            
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                Alert.alert('Error', 'Failed to pick document');
            }
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
            const formattedDate = selectedDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            handleKycInputChange('dateOfBirth', formattedDate);
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const handleKycInputChange = (field, value) => {
        setKycFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Also update main form data
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
        const aadhaarRegex = /^\d{12}$/;
        
        const isPanValid = panRegex.test(formData.pan);
        const isGstValid = gstRegex.test(formData.gst);
        const isAadhaarValid = aadhaarRegex.test(formData.aadhaarNumber);

        if (!isPanValid) {
            Alert.alert('Error', 'Please enter a valid PAN number');
            return true;
        }

        if (!isGstValid) {
            Alert.alert('Error', 'Please enter a valid GST number');
            return true;
        }

        if (!isAadhaarValid) {
            Alert.alert('Error', 'Please enter a valid 12-digit Aadhaar number');
            return true;
        }

        return !formData.agentName || !formData.accountNumber || !formData.ifscCode ||
            !formData.email || !formData.mobileNumber || !formData.street || !formData.street2 ||
            !formData.city || !formData.state || !formData.postalCode || !formData.country ||
            !formData.pan || !formData.gst || !formData.aadhaarNumber || !formData.dateOfBirth ||
            !formData.gender || !formData.occupation || !formData.annualIncome || !formData.sourceOfFunds;
    };

    const createRazorpayBankAccount = async (formData) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('Authentication token not found');
            }

            // Create FormData for file uploads
            const formDataToSend = new FormData();
            formDataToSend.append('agent_name', formData.agentName);
            formDataToSend.append('bank_account_no', formData.accountNumber);
            formDataToSend.append('ifsc_code', formData.ifscCode);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone_no', formData.mobileNumber);
            formDataToSend.append('street', formData.street);
            formDataToSend.append('street2', formData.street2);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('state', formData.state);
            formDataToSend.append('pincode', formData.postalCode);
            formDataToSend.append('country', formData.countryCode);
            formDataToSend.append('pan', formData.pan);
            formDataToSend.append('gst', formData.gst);
            
            // Add KYC fields
            formDataToSend.append('aadhaar_number', formData.aadhaarNumber);
            formDataToSend.append('date_of_birth', formData.dateOfBirth);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('occupation', formData.occupation);
            formDataToSend.append('annual_income', formData.annualIncome);
            formDataToSend.append('source_of_funds', formData.sourceOfFunds);

            // Add document files
            if (formData.panCardImage) {
                formDataToSend.append('pan_card_image', {
                    uri: formData.panCardImage.fileCopyUri || formData.panCardImage.uri,
                    type: formData.panCardImage.type || 'image/jpeg',
                    name: formData.panCardImage.name || 'pan_card.jpg'
                });
            }
            if (formData.aadhaarFrontImage) {
                formDataToSend.append('aadhaar_front_image', {
                    uri: formData.aadhaarFrontImage.fileCopyUri || formData.aadhaarFrontImage.uri,
                    type: formData.aadhaarFrontImage.type || 'image/jpeg',
                    name: formData.aadhaarFrontImage.name || 'aadhaar_front.jpg'
                });
            }
            if (formData.aadhaarBackImage) {
                formDataToSend.append('aadhaar_back_image', {
                    uri: formData.aadhaarBackImage.fileCopyUri || formData.aadhaarBackImage.uri,
                    type: formData.aadhaarBackImage.type || 'image/jpeg',
                    name: formData.aadhaarBackImage.name || 'aadhaar_back.jpg'
                });
            }
            if (formData.bankPassbookImage) {
                formDataToSend.append('bank_passbook_image', {
                    uri: formData.bankPassbookImage.fileCopyUri || formData.bankPassbookImage.uri,
                    type: formData.bankPassbookImage.type || 'image/jpeg',
                    name: formData.bankPassbookImage.name || 'bank_passbook.jpg'
                });
            }
            if (formData.addressProofImage) {
                formDataToSend.append('address_proof_image', {
                    uri: formData.addressProofImage.fileCopyUri || formData.addressProofImage.uri,
                    type: formData.addressProofImage.type || 'image/jpeg',
                    name: formData.addressProofImage.name || 'address_proof.jpg'
                });
            }

            const response = await axios.post(`${API_URL}/agent/razorpay-bank-account-create`, formDataToSend, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'multipart/form-data'
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
      
          const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
          return () => backHandler.remove(); // Proper cleanup
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

                        <Text style={[styles.title, { marginTop: 20 }]}>KYC Details</Text>

                        <InputField
                            label="Aadhaar Number"
                            value={formData.aadhaarNumber}
                            onChangeText={(text) => handleKycInputChange('aadhaarNumber', text)}
                            placeholder="Enter 12-digit Aadhaar number"
                            keyboardType="numeric"
                            maxLength={12}
                            inputType="others"
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity 
                                style={styles.dateInput}
                                onPress={showDatePickerModal}
                            >
                                <Text style={[styles.dateInputText, !formData.dateOfBirth && styles.placeholderText]}>
                                    {formData.dateOfBirth || 'Select Date of Birth'}
                                </Text>
                                <MaterialIcons name="calendar-today" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dropdownContainer}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity 
                                style={styles.dropdownButton}
                                onPress={() => setShowKycModal(true)}
                            >
                                <Text style={[styles.dropdownText, !formData.gender && styles.placeholderText]}>
                                    {formData.gender || 'Select Gender'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dropdownContainer}>
                            <Text style={styles.label}>Occupation</Text>
                            <TouchableOpacity 
                                style={styles.dropdownButton}
                                onPress={() => setShowKycModal(true)}
                            >
                                <Text style={[styles.dropdownText, !formData.occupation && styles.placeholderText]}>
                                    {formData.occupation || 'Select Occupation'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <InputField
                            label="Annual Income"
                            value={formData.annualIncome}
                            onChangeText={(text) => handleKycInputChange('annualIncome', text)}
                            placeholder="Enter annual income"
                            keyboardType="numeric"
                            inputType="others"
                        />

                        <View style={styles.dropdownContainer}>
                            <Text style={styles.label}>Source of Funds</Text>
                            <TouchableOpacity 
                                style={styles.dropdownButton}
                                onPress={() => setShowKycModal(true)}
                            >
                                <Text style={[styles.dropdownText, !formData.sourceOfFunds && styles.placeholderText]}>
                                    {formData.sourceOfFunds || 'Select Source of Funds'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.title, { marginTop: 20 }]}>Document Upload</Text>

                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>PAN Card</Text>
                            <TouchableOpacity 
                                style={styles.uploadButton}
                                onPress={() => pickDocument('panCardImage')}
                            >
                                <MaterialIcons name="upload-file" size={24} color="#007AFF" />
                                <Text style={styles.uploadText}>
                                    {formData.panCardImage ? 'Document Selected' : 'Upload PAN Card'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>Aadhaar Card (Front)</Text>
                            <TouchableOpacity 
                                style={styles.uploadButton}
                                onPress={() => pickDocument('aadhaarFrontImage')}
                            >
                                <MaterialIcons name="upload-file" size={24} color="#007AFF" />
                                <Text style={styles.uploadText}>
                                    {formData.aadhaarFrontImage ? 'Document Selected' : 'Upload Aadhaar Front'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>Aadhaar Card (Back)</Text>
                            <TouchableOpacity 
                                style={styles.uploadButton}
                                onPress={() => pickDocument('aadhaarBackImage')}
                            >
                                <MaterialIcons name="upload-file" size={24} color="#007AFF" />
                                <Text style={styles.uploadText}>
                                    {formData.aadhaarBackImage ? 'Document Selected' : 'Upload Aadhaar Back'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>Bank Passbook</Text>
                            <TouchableOpacity 
                                style={styles.uploadButton}
                                onPress={() => pickDocument('bankPassbookImage')}
                            >
                                <MaterialIcons name="upload-file" size={24} color="#007AFF" />
                                <Text style={styles.uploadText}>
                                    {formData.bankPassbookImage ? 'Document Selected' : 'Upload Bank Passbook'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>Address Proof</Text>
                            <TouchableOpacity 
                                style={styles.uploadButton}
                                onPress={() => pickDocument('addressProofImage')}
                            >
                                <MaterialIcons name="upload-file" size={24} color="#007AFF" />
                                <Text style={styles.uploadText}>
                                    {formData.addressProofImage ? 'Document Selected' : 'Upload Address Proof'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <CustomButton
                                label="Continue"
                                onPress={handleSubmit}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* KYC Dropdown Modal */}
            <Modal
                visible={showKycModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowKycModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Option</Text>
                            <TouchableOpacity onPress={() => setShowKycModal(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalSectionTitle}>Gender</Text>
                            {genderOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => {
                                        handleKycInputChange('gender', option);
                                        setShowKycModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                    {formData.gender === option && (
                                        <MaterialIcons name="check" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <Text style={styles.modalSectionTitle}>Occupation</Text>
                            {occupationOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => {
                                        handleKycInputChange('occupation', option);
                                        setShowKycModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                    {formData.occupation === option && (
                                        <MaterialIcons name="check" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}

                            <Text style={styles.modalSectionTitle}>Source of Funds</Text>
                            {sourceOfFundsOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => {
                                        handleKycInputChange('sourceOfFunds', option);
                                        setShowKycModal(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                    {formData.sourceOfFunds === option && (
                                        <MaterialIcons name="check" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    mode="date"
                    display="default"
                    value={selectedDate}
                    onChange={handleDateChange}
                    minimumDate={new Date('1900-01-01')}
                    maximumDate={new Date()}
                />
            )}
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
    formContainer: {
        flex: 1,
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
    dropdownContainer: {
        marginTop: 15,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    label: {
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
        marginBottom: 5,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dropdownText: {
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    placeholderText: {
        color: '#999',
    },
    documentSection: {
        marginTop: 15,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    documentLabel: {
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
        marginBottom: 5,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    uploadText: {
        marginLeft: 10,
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: responsiveWidth(90),
        maxHeight: responsiveHeight(70),
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
    },
    modalBody: {
        maxHeight: responsiveHeight(50),
    },
    modalSectionTitle: {
        fontSize: responsiveFontSize(1.8),
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 10,
        marginTop: 15,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: responsiveFontSize(1.8),
        fontFamily: 'Poppins-Regular',
        color: '#333',
    },
    inputContainer: {
        marginTop: 15,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dateInputText: {
        fontSize: responsiveFontSize(1.8),
        color: '#333',
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
});
