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
    BackHandler
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import { addIconImg, plus, userPhoto } from '../../utils/Images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CountryPicker } from "react-native-country-codes-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';


const AddNewMemberScreen = ({ route }) => {
    const navigation = useNavigation();
    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phone, setPhone] = useState('');
    const [mobileError, setMobileError] = useState('')

    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+91');
    const [roleError, setRoleError] = useState('')
    const [userType, setUserType] = useState([])

    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    // package dropdown
    const [packagevalue, setPackageValue] = useState(null);
    const [isPackageFocus, setYearIsFocus] = useState(false);


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

    const onChangeMobile = (text) => {
        const phoneRegex = /^\d{10}$/;
        setPhone(text)
        if (!phoneRegex.test(text)) {
            setMobileError('Please enter a 10-digit number.')
        } else {
            setMobileError('')
        }
    }

    const submitForm = () => {
        if (!firstname) {
            setFirstNameError('Please enter name.');
        } else {
            setFirstNameError('');
        }

        if (!email) {
            setEmailError('Please enter email id.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email id.');
        } else {
            setEmailError('');
        }
        if (!phone) {
            setMobileError('Please enter mobile number.');
        } else if (phone.length < 10) {
            setMobileError('Please enter a valid mobile number.');
        } else {
            setMobileError('');
        }
        if (!packagevalue) {
            setRoleError('Please select role.');
        } else {
            setRoleError('');
        }

        if (firstname && email && /\S+@\S+\.\S+/.test(email) && phone && packagevalue) {
            //login()
            setIsLoading(true)
            const option = {
                "first_name": firstname,
                "email": email,
                "country_code": countryCode,
                "mobile": phone,
                "user_type": packagevalue,
            }
            console.log(option, 'dhhhdhhd')
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${API_URL}/agent/create-member`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": 'Bearer ' + usertoken,
                    },
                })
                    .then(res => {
                        //console.log(res.data)
                        if (res.data.response == true) {
                            setIsLoading(false)
                            Toast.show({
                                type: 'success',
                                text1: '',
                                text2: "Member Added successfully.",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            navigation.navigate('TeamScreen')
                        } else {
                            //console.log('not okk')
                            setIsLoading(false)
                            Alert.alert('Oops..', "Something went wrong.", [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        }
                    })
                    .catch(e => {
                        setIsLoading(false)
                        console.log(`user update error ${e}`)
                        console.log(e.response.data?.response.records)
                        Alert.alert('Oops..', "Something went wrong", [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    });
            });
        } else {
            // Optionally handle case where some fields are still invalid
        }
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

    const fetchallusertype = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/user-type-display`, {}, {
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

                    console.log(formattedData, 'Formatted User Type');
                    setUserType(formattedData);
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchallusertype();
    }, [])

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
                <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Create a new team member</Text>
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Name</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter name'}
                                keyboardType=" "
                                value={firstname}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeFirstname(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Phone No.</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {mobileError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{mobileError}</Text> : <></>}
                        <View style={styles.phonenoView}>
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
                                onChangeText={(text) => onChangeMobile(text)}
                                helperText={mobileError}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>E-mail</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {emailError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{emailError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter  E-mail'}
                                keyboardType=" "
                                value={email}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeEmail(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Role</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {roleError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{roleError}</Text> : <></>}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Dropdown
                                style={[styles.dropdownHalf, isPackageFocus && { borderColor: '#DDD' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={userType}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isPackageFocus ? 'Select Role' : '...'}
                                searchPlaceholder="Search..."
                                value={packagevalue}
                                onFocus={() => setYearIsFocus(true)}
                                onBlur={() => setYearIsFocus(false)}
                                onChange={item => {
                                    setPackageValue(item.value);
                                    setYearIsFocus(false);
                                    setRoleError('');
                                }}
                            />
                        </View>
                    </View>

                </View>


            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>

                <CustomButton label={"Create Team Member"}
                    //onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default AddNewMemberScreen;

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
        marginBottom: responsiveHeight(5),
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
    photocontainer: {
        backgroundColor: "#f0f0f0",
        paddingBottom: 40,
    },
    coverPhotoContainer: {
        height: 120,
        backgroundColor: "#EAEAEA",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
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
        bottom: -30,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    iconStyle2: {
        height: 20, width: 20, resizeMode: 'contain'
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
    countryInputView: {
        height: responsiveHeight(6),
        width: responsiveWidth(15),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        marginTop: -responsiveHeight(2)
    },
    phonenoView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
