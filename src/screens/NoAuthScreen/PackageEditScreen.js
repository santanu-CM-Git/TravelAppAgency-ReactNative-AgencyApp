import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import IOSDatePickerModal from '../../components/IOSDatePickerModal';

const PackageEditScreen = ({ route }) => {
    const navigation = useNavigation();
    const { packageId } = route.params;
    const autocompleteRef = useRef(null);
    const [packageDescription, setPackageDescription] = useState('');
    const [packageDescriptionError, setPackageDescriptionError] = useState('')
    const [packageName, setPackageName] = useState('');
    const [packageNameError, setPackageNameError] = useState('');
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
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);

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
    const [hasExistingBookings, setHasExistingBookings] = useState(false);

    const handleSelection = (option) => {
        // Prevent changing date type if there are existing bookings
        if (hasExistingBookings) {
            Toast.show({
                type: 'error',
                text1: 'Cannot Change Date Type',
                text2: 'Cannot change date type when package has existing bookings'
            });
            return;
        }
        
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
    const [days, setDays] = useState([]);

    const [selectedDay, setSelectedDay] = useState(null);
    const [description, setDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showIOSStartDatePicker, setShowIOSStartDatePicker] = useState(false);
    const [showIOSEndDatePicker, setShowIOSEndDatePicker] = useState(false);
    const [showIOSExpireDatePicker, setShowIOSExpireDatePicker] = useState(false);

    const onStartDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") {
            setShowStartDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                setStartDate(selectedDate);
            }
        } else {
            // iOS - handled by modal
            if (selectedDate) setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") {
            setShowEndDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                setEndDate(selectedDate);
            }
        } else {
            // iOS - handled by modal
            if (selectedDate) setEndDate(selectedDate);
        }
    };

    const onExpireDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") {
            setShowExpireDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                setExpireDate(selectedDate);
            }
        } else {
            // iOS - handled by modal
            if (selectedDate) setExpireDate(selectedDate);
        }
    };

    // iOS Modal handlers
    const handleIOSStartDateConfirm = useCallback((selectedDate) => {
        setStartDate(selectedDate);
        setShowIOSStartDatePicker(false);
    }, []);

    const handleIOSEndDateConfirm = useCallback((selectedDate) => {
        setEndDate(selectedDate);
        setShowIOSEndDatePicker(false);
    }, []);

    const handleIOSExpireDateConfirm = useCallback((selectedDate) => {
        setExpireDate(selectedDate);
        setShowIOSExpireDatePicker(false);
    }, []);

    const [policies, setPolicies] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemsInclusions, setSelectedItemsInclusions] = useState([]);
    const [selectedItemsExclusion, setSelectedItemsExclusion] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    const options = ["Adhar Card", "Pan Card", "Passport", "Photos"];
    const optionsInclusions = ["Air ticket", "Breakfast", "Dinner", "Daily transport"];
    const optionsExclusion = ["Air ticket", "Breakfast", "Dinner", "Daily transport"];

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

    useEffect(() => {
        fetchPackageDetails();
        fetchalllocation();
    }, []);

    const fetchPackageDetails = async () => {
        try {
            setIsLoading(true);
            const option = {
                "package_id": route?.params?.packageId
            }
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/agent/package-details`, option, {
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    "Content-Type": 'application/json'
                }
            });

            if (response.data.status) {
                const packageData = response.data.data[0];
                console.log(JSON.stringify(packageData), 'packageData');
                setPackageDescription(packageData.description);
                setPackageName(packageData.name);
                setlocation(packageData.location.name);
                setLocationId(packageData.location_id);
                setPackageValue(JSON.parse(packageData.location_id));
                setSlot(packageData.date_type == 0 ? packageData.seat_slots : '');
                setPrice(packageData.price);
                setDiscountedPrice(packageData.discounted_price);
                setChildPrice(packageData.children_price);
                setSelectedOption(packageData.date_type == 0 ? 'fixedDate' : 'customDate');
                if (packageData.date_type == 0) {
                    setStartDate(packageData.start_date ? new Date(packageData.start_date) : null);
                    setEndDate(packageData.end_date ? new Date(packageData.end_date) : null);
                } else {
                    setExpireDate(packageData.end_date ? new Date(packageData.end_date) : null);
                }
                setCoverPhotoUrl(packageData.cover_photo_url);

                // Set itinerary days
                const formattedDays = packageData.itinerary.map(item => ({
                    id: parseInt(item.day),
                    name: `Day ${item.day}`,
                    description: item.description,
                    images: item.images
                }));
                setDays(formattedDays);

                // Set refund policies
                const formattedPolicies = packageData.refund.map((item, index) => ({
                    id: index + 1,
                    day: item.condition,
                    percentage: item.refund
                }));
                setPolicies(formattedPolicies);

                // Set selected documents
                const documents = JSON.parse(packageData.document);
                setSelectedItems(documents);

                // Set inclusions and exclusions
                const inclusions = JSON.parse(packageData.package_inclusion);
                const exclusions = JSON.parse(packageData.package_exclusion);
                setSelectedItemsInclusions(inclusions);
                setSelectedItemsExclusion(exclusions);

                // Check if package has existing bookings
                console.log('Package bookings data:', packageData.bookings);
                if (packageData.bookings && packageData.bookings.length > 0) {
                    console.log('Package has existing bookings, disabling date fields');
                    setHasExistingBookings(true);
                } else {
                    console.log('Package has no existing bookings, date fields enabled');
                    setHasExistingBookings(false);
                }
            }
        } catch (error) {
            console.error('Error fetching package details:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch package details'
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                setLocationList(formattedData);
            })
            .catch(e => {
                console.log(`location error ${e}`)
            });
    }

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

    const toggleCheckbox = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter((i) => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const toggleCheckboxInclusions = (item) => {
        if (selectedItemsInclusions.includes(item)) {
            // Remove from inclusions
            setSelectedItemsInclusions(selectedItemsInclusions.filter((i) => i !== item));
        } else {
            // Add to inclusions and remove from exclusions (mutual exclusivity)
            setSelectedItemsInclusions([...selectedItemsInclusions, item]);
            setSelectedItemsExclusion(selectedItemsExclusion.filter((i) => i !== item));
        }
    };

    const toggleCheckboxExclusion = (item) => {
        if (selectedItemsExclusion.includes(item)) {
            // Remove from exclusions
            setSelectedItemsExclusion(selectedItemsExclusion.filter((i) => i !== item));
        } else {
            // Add to exclusions and remove from inclusions (mutual exclusivity)
            setSelectedItemsExclusion([...selectedItemsExclusion, item]);
            setSelectedItemsInclusions(selectedItemsInclusions.filter((i) => i !== item));
        }
    };

    const handleCoverPhotoPick = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.images],
            });
            console.log('Selected cover photo:', res);
            setCoverPhoto(res);
            // Clear the existing cover photo URL when a new one is selected
            setCoverPhotoUrl(null);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                console.warn('Error picking document:', err);
            }
        }
    };

    const clearCoverPhoto = () => {
        setCoverPhoto(null);
        setCoverPhotoUrl(null);
    };

    const pickImages = async () => {
        try {
            const results = await DocumentPicker.pick({
                type: [DocumentPicker.types.images],
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

    const removeImage = (uri) => {
        setSelectedImages(selectedImages.filter((img) => img !== uri));
    };

    const submitForm = async () => {
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
            if (!location) {
                setlocationError('Please select location.');
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

            // Prepare form data
            const formData = new FormData();

            // Add basic package info
            formData.append('name', packageName);
            formData.append('location_id', locationId);
            formData.append('location', location);
            formData.append('description', packageDescription);
            formData.append('seat_slots', slot);
            formData.append('price', price);
            formData.append('discounted_price', discountedPrice);
            formData.append('children_price', childPrice);
            formData.append('date_type', selectedOption == 'fixedDate' ? 0 : 1);

            // Add cover photo if changed
            if (coverPhoto) {
                console.log('Adding cover photo to form data:', coverPhoto);
                formData.append('cover_photo', {
                    uri: coverPhoto.uri,
                    type: coverPhoto.type || 'image/jpeg',
                    name: coverPhoto.name || 'cover.jpg'
                });
            } else if (!coverPhotoUrl) {
                // If no cover photo is selected and no existing URL, send empty to remove
                console.log('Removing cover photo');
                formData.append('cover_photo', '');
            } else {
                console.log('Keeping existing cover photo:', coverPhotoUrl);
            }

            // Add dates based on selected option
            if (selectedOption === 'fixedDate') {
                formData.append('start_date', startDate.toISOString().split('T')[0]);
                formData.append('end_date', endDate.toISOString().split('T')[0]);
            } else {
                formData.append('end_date', expireDate.toISOString().split('T')[0]);
            }

            // Add itinerary data
            days.forEach((day, dayIndex) => {
                formData.append(`itinerary[${dayIndex}][day]`, day.id);
                formData.append(`itinerary[${dayIndex}][description]`, day.description);

                // Add images for this day
                day.images.forEach((image, imageIndex) => {
                    if (typeof image === 'string') {
                        // If it's a URL, it's an existing image
                        formData.append(`itinerary[${dayIndex}][images][${imageIndex}]`, {
                            uri: image,
                            type: 'image/jpeg',
                            name: `day${day.id}_image${imageIndex}.jpg`
                        });
                    } else {
                        // If it's a new image file
                        formData.append(`itinerary[${dayIndex}][images][${imageIndex}]`, {
                            uri: image,
                            type: 'image/jpeg',
                            name: `day${day.id}_image${imageIndex}.jpg`
                        });
                    }
                });
            });

            // Add refund policies
            policies.forEach((policy, index) => {
                formData.append(`refund[${index}][condition]`, policy.day);
                formData.append(`refund[${index}][refund]`, policy.percentage);
            });

            // Add required documents
            formData.append('document', JSON.stringify(selectedItems));

            // Add package inclusions and exclusions
            formData.append('package_inclusion', JSON.stringify(selectedItemsInclusions));
            formData.append('package_exclusion', JSON.stringify(selectedItemsExclusion));
            formData.append('package_id', packageId);
            console.log(formData, 'formData')

            // Make API call
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/agent/package-update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + userToken
                }
            });

            if (response.data.status) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Package updated successfully!',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to update package',
                    position: 'top',
                    topOffset: Platform.OS == 'ios' ? 55 : 20
                });
            }
        } catch (error) {
            console.error('Error updating package:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(key => {
                    Toast.show({
                        type: 'error',
                        text1: 'Validation Error',
                        text2: errors[key][0]
                    });
                });
                console.log(errors[key][0], 'errors');
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
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <CustomHeader commingFrom={'Edit Package'} onPress={() => navigation.goBack()} title={'Edit Package'} />
            <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }} style={{ marginBottom: responsiveHeight(4) }}>
                <View style={styles.photocontainer}>
                    <View style={styles.coverPhotoContainer}>
                        {coverPhoto ? (
                            <View style={styles.coverPhotoWrapper}>
                                <Image source={{ uri: coverPhoto.uri }} style={styles.coverPhotoImage} />
                                <View style={styles.newPhotoIndicator}>
                                    <Text style={styles.newPhotoText}>New</Text>
                                </View>
                            </View>
                        ) : coverPhotoUrl ? (
                            <Image source={{ uri: coverPhotoUrl }} style={styles.coverPhotoImage} />
                        ) : (
                            <TouchableOpacity style={styles.addCoverButton} activeOpacity={0.7} onPress={handleCoverPhotoPick}>
                                <Image source={addIconImg} style={styles.iconStyle2} />
                                <Text style={styles.addCoverText}>Add Cover Photo</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.cameraIconCover} onPress={handleCoverPhotoPick}>
                            <Image source={plus} style={styles.iconStyle2} />
                        </TouchableOpacity>
                        {/* {(coverPhoto || coverPhotoUrl) && (
                            <TouchableOpacity style={styles.clearCoverButton} onPress={clearCoverPhoto}>
                                <FontAwesome name="trash" size={16} color="#FF455C" />
                            </TouchableOpacity>
                        )} */}
                    </View>
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
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
                                onChangeText={(text) => {
                                    setPackageName(text);
                                    if (text) {
                                        setPackageNameError('');
                                    }
                                }}
                                placeholderTextColor="#808080"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Description</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {packageDescriptionError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{packageDescriptionError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter package description'}
                                keyboardType=" "
                                value={packageDescription}
                                inputType={'address'}
                                onChangeText={(text) => {
                                    setPackageDescription(text);
                                    if (text) {
                                        setPackageDescriptionError('');
                                    }
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Location</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {locationError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{locationError}</Text> : <></>}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {/* <Dropdown
                                style={[styles.dropdownHalf, isPackageFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={locationList}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isPackageFocus ? 'Choose Location' : '...'}
                                searchPlaceholder="Search..."
                                search
                                value={packagevalue}
                                onFocus={() => setYearIsFocus(true)}
                                onBlur={() => setYearIsFocus(false)}
                                onChange={item => {
                                    setPackageValue(item.value);
                                    setlocation(item.label);
                                    setLocationId(item.value);
                                    setYearIsFocus(false);
                                    setlocationError('');
                                }}
                            /> */}
                            <InputField
                                label={'Enter package name'}
                                keyboardType="default"
                                value={packagevalue ? locationList.find(item => item.value === packagevalue)?.label : 'Choose Location'}
                                inputType={'nonedit'}
                                onChangeText={(text) => {
                                    // setPackageName(text);
                                    // if (text) {
                                    //     setPackageNameError('');
                                    // }
                                }}
                                placeholderTextColor="#808080"
                            />
                        </View>

                        <View style={styles.datetypecontainer}>
                            {hasExistingBookings && (
                                <View style={styles.bookingWarningContainer}>
                                    <Text style={styles.bookingWarningText}>
                                        ⚠️ Date fields are disabled - package has existing bookings
                                    </Text>
                                    <Text style={styles.bookingWarningSubText}>
                                        To protect existing bookings, date type, dates, and slots cannot be modified
                                    </Text>
                                </View>
                            )}
                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    value={selectedOption === 'fixedDate'}
                                    onValueChange={() => handleSelection('fixedDate')}
                                    tintColors={{ true: '#FF455C', false: '#888' }}
                                    disabled={hasExistingBookings}
                                />
                                <Text style={[styles.checkboxlabel, hasExistingBookings && styles.disabledText]}>Fixed Date</Text>
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
                                        <Text style={[styles.header, hasExistingBookings && styles.disabledText]}>Start Date <Text style={styles.requiredheader}>*</Text></Text>
                                        <TouchableOpacity
                                            style={[styles.inputBox, hasExistingBookings && styles.disabledInputBox]}
                                            onPress={() => {
                                                if (!hasExistingBookings) {
                                                    if (Platform.OS === 'ios') {
                                                        setShowIOSStartDatePicker(true);
                                                    } else {
                                                        setShowStartDatePicker(true);
                                                    }
                                                }
                                            }}
                                            disabled={hasExistingBookings}
                                        >
                                            <FontAwesome name="calendar" size={16} color="#FF455C" />
                                            <Text style={styles.inputText}>
                                                {startDate ? moment(startDate).format('DD-MM-YYYY') : 'Select Start Date'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.dateinputContainer}>
                                        <Text style={[styles.header, hasExistingBookings && styles.disabledText]}>End Date <Text style={styles.requiredheader}>*</Text></Text>
                                        <TouchableOpacity
                                            style={[styles.inputBox, hasExistingBookings && styles.disabledInputBox]}
                                            onPress={() => {
                                                if (!hasExistingBookings) {
                                                    if (Platform.OS === 'ios') {
                                                        setShowIOSEndDatePicker(true);
                                                    } else {
                                                        setShowEndDatePicker(true);
                                                    }
                                                }
                                            }}
                                            disabled={hasExistingBookings}
                                        >
                                            <FontAwesome name="calendar" size={16} color="#FF455C" />
                                            <Text style={styles.inputText}>
                                                {endDate ? moment(endDate).format('DD-MM-YYYY') : 'Select End Date'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.dateContainer}>
                                <View style={styles.dateinputContainerForExpireDate}>
                                    <Text style={[styles.header, hasExistingBookings && styles.disabledText]}>Expire Date <Text style={styles.requiredheader}>*</Text></Text>
                                    <TouchableOpacity
                                        style={[styles.inputBox, hasExistingBookings && styles.disabledInputBox]}
                                        onPress={() => {
                                            if (!hasExistingBookings) {
                                                if (Platform.OS === 'ios') {
                                                    setShowIOSExpireDatePicker(true);
                                                } else {
                                                    setShowExpireDatePicker(true);
                                                }
                                            }
                                        }}
                                        disabled={hasExistingBookings}
                                    >
                                        <FontAwesome name="calendar" size={16} color="#FF455C" />
                                        <Text style={styles.inputText}>
                                            {expireDate ? moment(expireDate).format('DD-MM-YYYY') : 'Select Expire Date'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {Platform.OS === 'android' && showStartDatePicker && (
                            <RNDateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onStartDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {Platform.OS === 'android' && showEndDatePicker && (
                            <RNDateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onEndDateChange}
                                minimumDate={startDate || new Date()}
                            />
                        )}

                        {Platform.OS === 'android' && showExpireDatePicker && (
                            <RNDateTimePicker
                                value={expireDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onExpireDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {selectedOption === 'fixedDate' && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.header, hasExistingBookings && styles.disabledText]}>Slots</Text>
                                    <Text style={styles.requiredheader}>*</Text>
                                </View>
                                {slotError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{slotError}</Text> : <></>}
                                <View style={styles.inputView}>
                                    <InputField
                                        label={'Number of Slot'}
                                        keyboardType="numeric"
                                        value={slot}
                                        inputType={'others'}
                                        onChangeText={(text) => {
                                            if (!hasExistingBookings) {
                                                setSlot(text);
                                                if (text) {
                                                    setSlotError('');
                                                }
                                            }
                                        }}
                                        editable={!hasExistingBookings}
                                    />
                                </View>
                            </>
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
                                onChangeText={(text) => {
                                    setPrice(text);
                                    if (text) {
                                        setPriceError('');
                                    }
                                }}
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
                                onChangeText={(text) => {
                                    setDiscountedPrice(text);
                                    if (text) {
                                        setDiscountedPriceError('');
                                    }
                                }}
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
                                onChangeText={(text) => {
                                    setChildPrice(text);
                                    if (text) {
                                        setChildPriceError('');
                                    }
                                }}
                            />
                        </View>

                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            <View style={styles.itineraryHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.header}>Itinerary</Text>
                                    <Text style={styles.requiredheader}>*</Text>
                                </View>
                                <TouchableOpacity style={styles.itineraryAddButton} onPress={addDay}>
                                    <Text style={styles.itineraryAddText}>+ Add Day</Text>
                                </TouchableOpacity>
                            </View>

                            {days.map((day) => (
                                <View key={day.id} style={styles.itineraryDayContainer}>
                                    <Text style={styles.itineraryDayText}>{day.name}</Text>

                                    <View style={styles.itineraryButtonGroup}>
                                        <TouchableOpacity style={styles.itineraryCreateButton} onPress={() => openModal(day)}>
                                            <FontAwesome name="plus-circle" size={16} color="#fff" />
                                            <Text style={styles.itineraryButtonText}>Edit Itinerary</Text>
                                        </TouchableOpacity>

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
                            <View style={styles.refundHeader}>
                                <Text style={styles.header}>Refund Policy</Text>
                                <TouchableOpacity style={styles.itineraryAddButton} onPress={addPolicy}>
                                    <Text style={styles.itineraryAddText}>+ Add another policy</Text>
                                </TouchableOpacity>
                            </View>

                            {policies.map((policy) => (
                                <View key={policy.id} style={styles.policyRow}>
                                    <TextInput
                                        style={styles.policyinput}
                                        placeholder="Enter Day"
                                        keyboardType="numeric"
                                        value={policy.day}
                                        onChangeText={(text) => updatePolicy(policy.id, "day", text)}
                                    />
                                    <TextInput
                                        style={styles.policyinput}
                                        placeholder="Enter Percentage"
                                        keyboardType="numeric"
                                        value={policy.percentage}
                                        onChangeText={(text) => updatePolicy(policy.id, "percentage", text)}
                                    />

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
                        <Text style={styles.mutualExclusionNote}>
                            Note: Items cannot be in both inclusions and exclusions. Selecting an item in one will automatically remove it from the other.
                        </Text>
                        <View style={styles.selectionSummary}>
                            <Text style={styles.summaryText}>
                                Currently selected: {selectedItemsInclusions.length} inclusions, {selectedItemsExclusion.length} exclusions
                            </Text>
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
                                {selectedItemsExclusion.includes(item) && (
                                    <Text style={styles.excludedNote}> (Currently in Exclusions)</Text>
                                )}
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
                                {selectedItemsInclusions.includes(item) && (
                                    <Text style={styles.includedNote}> (Currently in Inclusions)</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <Modal
                isVisible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                }}>
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
                        <Text style={styles.modallabel}>Description</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Enter Place Description"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.modallabel}>Image</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
                            <FontAwesome name="camera" size={20} color="#A6A7AC" />
                            <Text style={styles.uploadButtonText}>Upload Images</Text>
                        </TouchableOpacity>

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
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton
                                label={`Save ${selectedDay?.name} - Itinerary`}
                                onPress={handleModalSubmit}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.buttonwrapper}>
                <CustomButton
                    label={"Update Package"}
                    onPress={submitForm}
                    disabled={isLoading}
                />
            </View>
            {/* iOS Date Picker Modals */}
            {Platform.OS === 'ios' && (
                <>
                    <IOSDatePickerModal
                        visible={showIOSStartDatePicker}
                        date={startDate || new Date()}
                        minimumDate={new Date()}
                        onConfirm={handleIOSStartDateConfirm}
                        onCancel={() => setShowIOSStartDatePicker(false)}
                        mode="date"
                    />
                    <IOSDatePickerModal
                        visible={showIOSEndDatePicker}
                        date={endDate || new Date()}
                        minimumDate={startDate || new Date()}
                        onConfirm={handleIOSEndDateConfirm}
                        onCancel={() => setShowIOSEndDatePicker(false)}
                        mode="date"
                    />
                    <IOSDatePickerModal
                        visible={showIOSExpireDatePicker}
                        date={expireDate || new Date()}
                        minimumDate={new Date()}
                        onConfirm={handleIOSExpireDateConfirm}
                        onCancel={() => setShowIOSExpireDatePicker(false)}
                        mode="date"
                    />
                </>
            )}
        </SafeAreaView>
    );
};

export default PackageEditScreen;

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
        height: responsiveHeight(7.2),
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
    },
    clearCoverButton: {
        position: "absolute",
        left: 10,
        bottom: 10,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
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
    },
    profileContainer: {
        alignItems: "center",
        position: 'absolute',
        bottom: -40,
        //right: 150,
        alignSelf: 'center',
        zIndex: 3,
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
        width: responsiveWidth(40)
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
    coverPhotoWrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    newPhotoIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF455C',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newPhotoText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Poppins-Bold',
    },
    mutualExclusionNote: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.4),
        color: '#FF6B35',
        marginBottom: 15,
        paddingHorizontal: 5,
        fontStyle: 'italic',
        textAlign: 'center',
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    excludedNote: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.2),
        color: '#FF6B35',
        fontStyle: 'italic',
        marginLeft: 5,
    },
    includedNote: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.2),
        color: '#4CAF50',
        fontStyle: 'italic',
        marginLeft: 5,
    },
    selectionSummary: {
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    summaryText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
        color: '#666',
    },
    bookingWarningContainer: {
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    bookingWarningText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.4),
        color: '#FF6B35',
        textAlign: 'center',
        marginBottom: 5,
    },
    bookingWarningSubText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.2),
        color: '#FF6B35',
        textAlign: 'center',
        opacity: 0.8,
    },
    disabledText: {
        color: '#999',
        opacity: 0.6,
    },
    disabledInputBox: {
        opacity: 0.6,
        backgroundColor: '#f5f5f5',
    },
}); 