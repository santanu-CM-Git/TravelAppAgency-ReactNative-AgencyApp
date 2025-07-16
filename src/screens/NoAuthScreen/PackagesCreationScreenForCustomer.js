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
    BackHandler,
    TouchableWithoutFeedback
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Entypo';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL, GOOGLE_MAP_KEY } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { addIconImg, facebookImg, googleImg, plus, userPhoto } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import CheckBox from '@react-native-community/checkbox';
import Modal from "react-native-modal";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PackagesCreationScreenForCustomer = ({ route }) => {
    const navigation = useNavigation();
    const autocompleteRef = useRef(null);
    const [packageDescription, setPackageDescription] = useState('');
    const [packageDescriptionError, setPackageDescriptionError] = useState('')
    const [location, setlocation] = useState('');
    const [locationId, setLocationId] = useState('')
    const [locationError, setlocationError] = useState('');
    const [long, setlong] = useState('');
    const [lat, setlat] = useState('');
    const [slot, setSlot] = useState('');
    const [slotError, setSlotError] = useState('');
    const [price, setPrice] = useState('');
    const [priceError, setPriceError] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [discountedPriceError, setDiscountedPriceError] = useState('');
    const [childPrice, setChildPrice] = useState('');
    const [childPriceError, setChildPriceError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
    const [pickedDocument, setPickedDocument] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);

    const [locationList, setLocationList] = useState([])
    const [packagevalue, setPackageValue] = useState(null);
    const [isPackageFocus, setYearIsFocus] = useState(false);

    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const MIN_DATE = new Date(1930, 0, 1)
    const MAX_DATE = new Date()
    const [date, setDate] = useState('DD - MM  - YYYY')
    const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
    const [dobError, setdobError] = useState('');
    const [open, setOpen] = useState(false)

    const [selectedOption, setSelectedOption] = useState('fixedDate');
    const [expireDate, setExpireDate] = useState(null);
    const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);

    const [selectedItems, setSelectedItems] = useState([]);
    const options = ["Adhar Card", "Pan Card", "Passport", "Photos"];
    const toggleCheckbox = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter((i) => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };
    const [selectedItemsInclusions, setSelectedItemsInclusions] = useState([]);
    const optionsInclusions = ["Air ticket", "Breakfast", "Dinner", "Daily transport"]
    const toggleCheckboxInclusions = (item) => {
        if (selectedItemsInclusions.includes(item)) {
            setSelectedItemsInclusions(selectedItemsInclusions.filter((i) => i !== item));
        } else {
            setSelectedItemsInclusions([...selectedItemsInclusions, item]);
        }
    };
    const [selectedItemsExclusion, setSelectedItemsExclusion] = useState([]);
    const optionsExclusion = ["Air ticket", "Breakfast", "Dinner", "Daily transport"]
    const toggleCheckboxExclusion = (item) => {
        if (selectedItemsExclusion.includes(item)) {
            setSelectedItemsExclusion(selectedItemsExclusion.filter((i) => i !== item));
        } else {
            setSelectedItemsExclusion([...selectedItemsExclusion, item]);
        }
    };

    const [isModalVisible, setModalVisible] = useState(false);

    const [days, setDays] = useState([{
        id: 1,
        name: "Day 1",
        description: "",
        images: []
    }]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [description, setDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const [packageName, setPackageName] = useState('');
    const [packageNameError, setPackageNameError] = useState('');

    const [hasBankAccount, setHasBankAccount] = useState(null);
    const [showBankModal, setShowBankModal] = useState(false);

    const addDay = () => {
        const newDay = {
            id: days.length + 1,
            name: `Day ${days.length + 1}`,
            description: "",
            images: []
        };
        setDays([...days, newDay]);
    };

    const removeDay = (id) => {
        const updatedDays = days.filter((day) => day.id !== id);
        setDays(updatedDays);
    };

    const updateDayDescription = (dayId, newDescription) => {
        const updatedDays = days.map(day =>
            day.id === dayId ? { ...day, description: newDescription } : day
        );
        setDays(updatedDays);
    };

    const updateDayImages = (dayId, newImages) => {
        const updatedDays = days.map(day =>
            day.id === dayId ? { ...day, images: newImages } : day
        );
        setDays(updatedDays);
    };

    const openModal = (day) => {
        setSelectedDay(day);
        setDescription(day.description || "");
        setSelectedImages(day.images || []);
        setModalVisible(true);
    };

    const handleModalSubmit = () => {
        if (selectedDay) {
            // Update the day's description and images
            const updatedDays = days.map(day => {
                if (day.id === selectedDay.id) {
                    return {
                        ...day,
                        description: description,
                        images: selectedImages
                    };
                }
                return day;
            });
            setDays(updatedDays);
        }
        setModalVisible(false);
    };

    const [policies, setPolicies] = useState([{ id: 1, day: "", percentage: "" }]);
    const addPolicy = () => {
        const newPolicy = { id: policies.length + 1, day: "", percentage: "" };
        setPolicies([...policies, newPolicy]);
    };

    const removePolicy = (id) => {
        if (policies.length > 1) {
            setPolicies(policies.filter((policy) => policy.id !== id));
        }
    };

    const updatePolicy = (id, field, value) => {
        const updatedPolicies = policies.map((policy) =>
            policy.id === id ? { ...policy, [field]: value } : policy
        );
        setPolicies(updatedPolicies);
    };

    const handleSelection = (option) => {
        setSelectedOption(option);
        if (option === 'customDate') {
            setStartDate(null);
            setEndDate(null);
            setExpireDate(null);
            setSlot(''); // Clear slot when switching to custom date
        } else {
            setExpireDate(null);
        }
    };

    const onExpireDateChange = (event, selectedDate) => {
        setShowExpireDatePicker(false);
        if (selectedDate) {
            setExpireDate(selectedDate);
        }
    };

    const handleCoverPhotoPick = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.images],
            });
            console.log(res);
            const coverdocs = res;
            setCoverPhoto(coverdocs);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                console.warn('Error picking document:', err);
            }
        }
    };

    // Pick an image from Document Picker
    const pickImages = async () => {
        try {
            const results = await DocumentPicker.pick({
                type: [DocumentPicker.types.images], // Only allow images
                allowMultiSelection: true,
            });

            if (results) {
                setSelectedImages([...selectedImages, ...results.map((file) => file.uri)]);
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User cancelled document picker");
            } else {
                console.error("Error picking documents: ", err);
            }
        }
    };

    // Remove selected image
    const removeImage = (uri) => {
        setSelectedImages(selectedImages.filter((img) => img !== uri));
    };


    const changePackageDesc = (text) => {
        setPackageDescription(text)
        if (text) {
            setPackageDescriptionError('')
        } else {
            setPackageDescriptionError('Please enter description.')
        }
    }

    const changeSlot = (text) => {
        setSlot(text)
        if (text) {
            setSlotError('')
        } else {
            setSlotError('Please enter slot.')
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

    const changeDiscountedPrice = (text) => {
        setDiscountedPrice(text);
        if (text) {
            setDiscountedPriceError('');
        } else {
            setDiscountedPriceError('Please enter discounted price.');
        }
    }

    const changeChildPrice = (text) => {
        setChildPrice(text);
        if (text) {
            setChildPriceError('');
        } else {
            setChildPriceError('Please enter child price.');
        }
    }

    const changePackageName = (text) => {
        setPackageName(text);
        if (text) {
            setPackageNameError('');
        } else {
            setPackageNameError('Please enter package name.');
        }
    }

    const fetchalllocation = () => {
        axios.get(`${API_URL}/location`, {
            headers: {
                "Content-Type": 'application/json'
            },
        })
            .then(res => {
                let userInfo = res.data.data;
                const formattedData = userInfo.map(item => ({
                    label: item.name,
                    value: item.id
                }));

                console.log(formattedData, 'Formatted User Type');
                setLocationList(formattedData);
                setIsLoading(false)
            })
            .catch(e => {
                console.log(`location error ${e}`)
            });
    }

    const checkBankAccount = async () => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const res = await axios.post(
                `${API_URL}/agent/razorpay-bank-account-fetch`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                        "Content-Type": 'application/json'
                    }
                }
            );
            if (res.data && res.data.data) {
                setHasBankAccount(true);
            } else {
                setHasBankAccount(false);
                setShowBankModal(true);
            }
        } catch (e) {
            setHasBankAccount(false);
            setShowBankModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchalllocation();
        checkBankAccount();
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

    const submitForm = async () => {
        if (hasBankAccount === false) {
            setShowBankModal(true);
            return;
        }
        console.log('sassssss')
        try {
            setIsLoading(true);

            // Basic validation
            if (!packageName) {
                setPackageNameError('Please enter package name.');
                setIsLoading(false);
                return;
            }
            if (!packageDescription) {
                setPackageDescriptionError('Please enter description.');
                setIsLoading(false);
                return;
            }
            if (selectedOption === 'fixedDate') {
                if (!slot) {
                    setSlotError('Please enter number of slots.');
                    setIsLoading(false);
                    return;
                }
                if (!startDate || !endDate) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Please select both start and end dates'
                    });
                    setIsLoading(false);
                    return;
                }
            } else {
                if (!expireDate) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Please select expire date'
                    });
                    setIsLoading(false);
                    return;
                }
            }
            if (!price) {
                setPriceError('Please enter price.');
                setIsLoading(false);
                return;
            }
            if (!discountedPrice) {
                setDiscountedPriceError('Please enter discounted price.');
                setIsLoading(false);
                return;
            }
            if (!childPrice) {
                setChildPriceError('Please enter child price.');
                setIsLoading(false);
                return;
            }
            if (!coverPhoto) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Cover photo is required'
                });
                setIsLoading(false);
                return;
            }

            // Validate itinerary descriptions
            const hasEmptyDescription = days.some(day => !day.description.trim());
            if (hasEmptyDescription) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please add description for all days in itinerary'
                });
                setIsLoading(false);
                return;
            }

            // Prepare form data
            const formData = new FormData();

            // Add basic package info
            formData.append('customer_id', route?.params?.customerId);
            formData.append('name', packageName);
            formData.append('location_id', route?.params?.locationId);
            formData.append('location', route?.params?.locationName);
            formData.append('description', packageDescription);
            formData.append('price', price);
            formData.append('discounted_price', discountedPrice);
            formData.append('children_price', childPrice);
            formData.append('date_type', selectedOption === 'fixedDate' ? 0 : 1);

            if (selectedOption === 'fixedDate') {
                formData.append('seat_slots', slot);
                formData.append('start_date', startDate.toISOString().split('T')[0]);
                formData.append('end_date', endDate.toISOString().split('T')[0]);
            } else {
                formData.append('end_date', expireDate.toISOString().split('T')[0]);
            }

            // Add cover photo
            formData.append('cover_photo', {
                uri: coverPhoto.uri,
                type: coverPhoto.type || 'image/jpeg',
                name: coverPhoto.name || 'cover.jpg'
            });

            // Add itinerary data
            days.forEach((day, dayIndex) => {
                formData.append(`itinerary[${dayIndex}][day]`, day.id);
                formData.append(`itinerary[${dayIndex}][description]`, day.description);

                // Add images for this day
                day.images.forEach((image, imageIndex) => {
                    formData.append(`itinerary[${dayIndex}][images][${imageIndex}]`, {
                        uri: image,
                        type: 'image/jpeg',
                        name: `day${day.id}_image${imageIndex}.jpg`
                    });
                });
            });

            // Add refund policies
            // const refundData = policies.map(policy => ({
            //     days: policy.day,
            //     percentage: policy.percentage
            // }));
            // formData.append('refund', JSON.stringify(refundData));

            policies.forEach((day, dayIndex) => {
                formData.append(`refund[${dayIndex}][condition]`, day.day);
                formData.append(`refund[${dayIndex}][refund]`, day.percentage);
            });

            // Add required documents
            formData.append('document', JSON.stringify(selectedItems));

            // Add package inclusions and exclusions (if you have these fields)
            formData.append('package_inclusion', JSON.stringify(selectedItemsInclusions));
            formData.append('package_exclusion', JSON.stringify(selectedItemsExclusion));
            console.log(formData, 'fsdfdsfdsfds')
            // Make API call
            const userToken = await AsyncStorage.getItem('userToken');
            console.log(userToken, 'userToken')
            const response = await axios.post(`${API_URL}/agent/package-create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + userToken
                }
            });

            console.log(response.data)
            if (response.data.status == true) {
                Toast.show({
                    type: 'success',
                    text1: '',
                    text2: response.data.message || 'Package created successfully!',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to create package',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
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
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Create Package'} onPress={() => navigation.goBack()} title={'Create Package'} />
            <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }} style={{ marginBottom: responsiveHeight(4) }}>
                <View style={styles.photocontainer}>
                    {/* Cover Photo Section */}
                    {/* <View style={styles.coverPhotoContainer}>
                        <TouchableOpacity style={styles.addCoverButton}>
                            <Image source={addIconImg} style={styles.iconStyle2} />
                            <Text style={styles.addCoverText}>Add Cover Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraIconCover}>
                            <Image source={plus} style={styles.iconStyle2} />
                        </TouchableOpacity>
                    </View> */}
                    <View style={styles.coverPhotoContainer}>
                        {coverPhoto ? (
                            <Image source={{ uri: coverPhoto.uri }} style={styles.coverPhotoImage} />
                        ) : (
                            <TouchableOpacity style={styles.addCoverButton} activeOpacity={0.7} onPress={handleCoverPhotoPick}>
                                <Image source={addIconImg} style={styles.iconStyle2} />
                                <Text style={styles.addCoverText}>Add Cover Photo</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.cameraIconCover} onPress={handleCoverPhotoPick}>
                            <Image source={plus} style={styles.iconStyle2} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        {/* Package Name Field */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Package Name</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {packageNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{packageNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter package name'}
                                keyboardType="default"
                                value={packageName}
                                inputType={'others'}
                                onChangeText={(text) => changePackageName(text)}
                                placeholderTextColor="#808080"
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Location</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter package destination'}
                                keyboardType=" "
                                value={route?.params?.locationName}
                                //helperText={'Please enter lastname'}
                                inputType={'nonedit'}
                            //onChangeText={(text) => changeEmail(text)}
                            />
                        </View>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isPackageFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={locationList}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isPackageFocus ? 'Choose Location' : '...'}
                                searchPlaceholder="Search..."
                                value={packagevalue}
                                onFocus={() => setYearIsFocus(true)}
                                onBlur={() => setYearIsFocus(false)}
                                onChange={item => {
                                    setPackageValue(item.value);
                                    setlocation(item.label)
                                    setLocationId(item.value)
                                    setYearIsFocus(false);
                                    setlocationError('');
                                }}
                            />
                        </View> */}
                        <View style={styles.datetypecontainer}>
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    value={selectedOption === 'fixedDate'}
                                    onValueChange={() => handleSelection('fixedDate')}
                                    tintColors={{ true: '#FF455C', false: '#888' }}
                                />
                                <Text style={[styles.checkboxlabel]}>Fixed Date</Text>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    value={selectedOption === 'customDate'}
                                    onValueChange={() => handleSelection('customDate')}
                                    tintColors={{ true: '#FF455C', false: '#888' }}
                                />
                                <Text style={[styles.checkboxlabel]}>Custom Date</Text>
                            </View>
                        </View>

                        {selectedOption === 'fixedDate' ? (
                            <>
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
                                    <Text style={styles.header}>Slots</Text>
                                    <Text style={styles.requiredheader}>*</Text>
                                </View>
                                {slotError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{slotError}</Text> : <></>}
                                <View style={styles.inputView}>
                                    <InputField
                                        label={'Number of Slot'}
                                        keyboardType=" "
                                        value={slot}
                                        inputType={'others'}
                                        onChangeText={(text) => changeSlot(text)}
                                    />
                                </View>
                            </>
                        ) : (
                            <View style={styles.dateContainer}>
                                <View style={styles.dateinputContainerForExpireDate}>
                                    <Text style={styles.header}>Expire Date <Text style={styles.requiredheader}>*</Text></Text>
                                    <TouchableOpacity
                                        style={styles.inputBox}
                                        onPress={() => setShowExpireDatePicker(true)}
                                    >
                                        <FontAwesome name="calendar" size={16} color="#FF455C" />
                                        <Text style={styles.inputText}>
                                            {expireDate ? moment(expireDate).format('DD-MM-YYYY') : 'Select Expire Date'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {showExpireDatePicker && (
                            <RNDateTimePicker
                                value={expireDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onExpireDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Price</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {priceError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{priceError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter package price'}
                                keyboardType="numeric"
                                value={price}
                                inputType={'others'}
                                onChangeText={(text) => changePrice(text)}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Discounted Price</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {discountedPriceError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{discountedPriceError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter discounted price'}
                                keyboardType="numeric"
                                value={discountedPrice}
                                inputType={'others'}
                                onChangeText={(text) => changeDiscountedPrice(text)}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Child Price</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {childPriceError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{childPriceError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter child price'}
                                keyboardType="numeric"
                                value={childPrice}
                                inputType={'others'}
                                onChangeText={(text) => changeChildPrice(text)}
                            />
                        </View>

                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            {/* Header Section */}
                            <View style={styles.itineraryHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.header}>Itinerary</Text>
                                    <Text style={styles.requiredheader}>*</Text>
                                </View>
                                <TouchableOpacity style={styles.itineraryAddButton} onPress={addDay}>
                                    <Text style={styles.itineraryAddText}>+ Add Day</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Days List */}
                            {days.map((day) => (
                                <View key={day.id} style={styles.itineraryDayContainer}>
                                    <Text style={styles.itineraryDayText}>{day.name}</Text>

                                    <View style={styles.itineraryButtonGroup}>
                                        <TouchableOpacity style={styles.itineraryCreateButton} onPress={() => openModal(day)}>
                                            <FontAwesome name="plus-circle" size={16} color="#fff" />
                                            <Text style={styles.itineraryButtonText}>Create Itinerary</Text>
                                        </TouchableOpacity>

                                        {/* Remove Day Button */}
                                        {days.length > 1 && (
                                            <TouchableOpacity
                                                style={styles.itineraryRemoveButton}
                                                onPress={() => removeDay(day.id)}
                                            >
                                                <FontAwesome name="minus-circle" size={16} color="#FF455C" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            {/* Header Section */}
                            <View style={styles.refundHeader}>
                                <Text style={styles.header}>Refund Policy</Text>
                                <TouchableOpacity style={styles.itineraryAddButton} onPress={addPolicy}>
                                    <Text style={styles.itineraryAddText}>+ Add another policy</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Policy List */}
                            {policies.map((policy) => (
                                <View key={policy.id} style={styles.policyRow}>
                                    <TextInput
                                        style={styles.policyinput}
                                        placeholder="Enter Day"
                                        keyboardType="numeric"
                                        value={policy.day}
                                        onChangeText={(text) => updatePolicy(policy.id, "day", text)}
                                        placeholderTextColor="#999"
                                    />
                                    <TextInput
                                        style={styles.policyinput}
                                        placeholder="Enter Percentage"
                                        keyboardType="numeric"
                                        value={policy.percentage}
                                        onChangeText={(text) => updatePolicy(policy.id, "percentage", text)}
                                        placeholderTextColor="#999"
                                    />

                                    {/* Remove Button */}
                                    {policies.length > 1 && (
                                        <TouchableOpacity style={styles.removeButton} onPress={() => removePolicy(policy.id)}>
                                            <FontAwesome name="minus-circle" size={18} color="#FF455C" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                        <View style={styles.refundHeader}>
                            <Text style={styles.header}>Required document for travel</Text>
                        </View>
                        {options.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.option}
                                onPress={() => toggleCheckbox(item)}
                            >
                                <CheckBox
                                    value={selectedItems.includes(item)}
                                    onValueChange={() => toggleCheckbox(item)}
                                    tintColors={{ true: "#FF455C", false: "#888" }}
                                />
                                <Text style={styles.checkboxlabel}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.refundHeader}>
                            <Text style={styles.header}>Package Inclusions</Text>
                        </View>
                        {optionsInclusions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.option}
                                onPress={() => toggleCheckboxInclusions(item)}
                            >
                                <CheckBox
                                    value={selectedItemsInclusions.includes(item)}
                                    onValueChange={() => toggleCheckboxInclusions(item)}
                                    tintColors={{ true: "#FF455C", false: "#888" }}
                                />
                                <Text style={styles.checkboxlabel}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.refundHeader}>
                            <Text style={styles.header}>Package exclusion</Text>
                        </View>
                        {optionsExclusion.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.option}
                                onPress={() => toggleCheckboxExclusion(item)}
                            >
                                <CheckBox
                                    value={selectedItemsExclusion.includes(item)}
                                    onValueChange={() => toggleCheckboxExclusion(item)}
                                    tintColors={{ true: "#FF455C", false: "#888" }}
                                />
                                <Text style={styles.checkboxlabel}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </View>
            </ScrollView>
            <Modal
                isVisible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '60%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>{selectedDay?.name} - Itinerary</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0), paddingHorizontal: 15 }}>
                        {/* Description Input */}
                        <Text style={styles.modallabel}>Description</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Enter Place Description"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#999"
                        />

                        {/* Image Picker */}
                        <Text style={styles.modallabel}>Image</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
                            <FontAwesome name="camera" size={20} color="#A6A7AC" />
                            <Text style={styles.uploadButtonText}>Upload Images</Text>
                        </TouchableOpacity>

                        {/* Display Selected Images */}
                        {selectedImages.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                                {selectedImages.map((imageUri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.image} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(imageUri)}
                                        >
                                            <Text style={styles.removeImageText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                        <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                            <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                                <CustomButton
                                    label={`Save ${selectedDay?.name} - Itinerary`}
                                    onPress={handleModalSubmit}
                                />
                            </View>
                        </View>
                    </ScrollView>

                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>

            <Modal
                isVisible={showBankModal}
                onBackdropPress={() => setShowBankModal(false)}
                style={{ justifyContent: 'center', alignItems: 'center' }}
            >
                <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Add Bank Account</Text>
                    <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
                        Please add a bank account first before you can create a package.
                    </Text>
                    <CustomButton
                        label="Go to Add Bank Account"
                        onPress={() => {
                            setShowBankModal(false);
                            navigation.navigate('Menu', { screen: 'BankLinkedScreen' })
                        }}
                    />
                </View>
            </Modal>

            <View style={styles.buttonwrapper}>
                <CustomButton
                    label={"Send to customer"}
                    onPress={submitForm}
                    disabled={isLoading || hasBankAccount === false}
                />
            </View>
        </SafeAreaView >
    );
};

export default PackagesCreationScreenForCustomer;

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
        marginBottom: responsiveHeight(0),
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
    iconStyle2: {
        height: 20, width: 20, resizeMode: 'contain'
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        height: responsiveHeight(6),
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 12,
        paddingHorizontal: 10
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 12,
    },
    photocontainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 5,
    },
    coverPhotoContainer: {
        height: responsiveHeight(20),
        width: '100%',
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        //position: "relative",
        zIndex: 1,
    },
    addCoverButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    addCoverText: {
        marginLeft: 6,
        color: '#746868',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    cameraIconCover: {
        position: "absolute",
        right: 10,
        bottom: 10,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    profileContainer: {
        alignItems: "center",
        position: 'absolute',
        bottom: -40,
        right: 150
    },
    profilePicWrapper: {
        position: "relative",
    },
    profilePic: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#fff",
    },
    cameraIconProfile: {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    datetypecontainer: {
        flexDirection: 'column',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 1,
    },
    label: {
        color: '#746868',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2)
    },
    dateinputContainer: {
        //flex: 1,
        width: responsiveWidth(40)
    },
    dateinputContainerForExpireDate: {
        width: responsiveWidth(88)
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
    itineraryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    itineraryTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    itineraryAddButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderColor: '#FF455C',
        borderWidth: 1
    },
    itineraryAddText: {
        color: "#FF455C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
    },
    itineraryDayContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
        marginBottom: 8,
    },
    itineraryDayText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
        color: "#1B2234",
    },
    itineraryButtonGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    itineraryCreateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FF455C",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    itineraryButtonText: {
        color: "#fff",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
        marginLeft: 5,
    },
    itineraryRemoveButton: {
        padding: 5,
    },
    refundHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    policyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    policyinput: {
        //flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 8,
        backgroundColor: "#fff",
        width: responsiveWidth(40),
        color: '#999'
        //marginRight: 10,
    },
    removeButton: {
        padding: 5,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    label: {
        marginLeft: 10,
        fontSize: 14,
        color: "#333",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    closeButton: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ff5a5f",
    },
    label: {
        fontWeight: "bold",
        marginTop: 10,
    },
    textArea: {
        height: 80,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
        textAlignVertical: "top",
        color: '#999'
    },
    uploadButton: {
        backgroundColor: "#ff5a5f",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    uploadButtonText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: "#A6A7AC",
        marginLeft: 5,
    },
    imageContainer: {
        alignItems: "center",
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    imageScrollView: {
        flexDirection: "row",
        marginVertical: 10,
    },
    removeImageButton: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "#FF455C",
        borderRadius: 10,
        height: 20,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    removeImageText: {
        color: "#fff",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
    },
    modallabel: {
        color: "#000000",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginVertical: responsiveHeight(2)
    },
    uploadBox: {
        //width: responsiveWidth(90),
        height: 100,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
    },
    checkboxlabel: {
        color: "#767676",
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        marginLeft: 5
    },
    textInput: {
        height: 50,
        color: '#5d5d5d',
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    listView: {
        backgroundColor: '#fff',
    },
    coverPhotoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});
