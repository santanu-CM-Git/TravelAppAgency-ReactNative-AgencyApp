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
    BackHandler
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { addIconImg, plus, userPhoto } from '../../utils/Images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddNewUserType = ({ route }) => {
    const navigation = useNavigation();
    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const [selectedItems, setSelectedItems] = useState([]);
    const options = [
        'Booking',
        'Messages',
        'Accounts',
        'Team',
        'Bank',
        'Packages',
    ];

    const toggleSelection = (item) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(item)
                ? prevSelected.filter((i) => i !== item)
                : [...prevSelected, item]
        );
    };

    const changeFirstname = (text) => {
        setFirstname(text)
        if (text) {
            setFirstNameError('')
        } else {
            setFirstNameError('Please enter user type.')
        }
    }



    const submitForm = () => {
        if (!firstname) {
            setFirstNameError('Please enter user type.');
        } else {
            setFirstNameError('');
        }

        if (firstname) {
            setIsLoading(true)
            const option = {
                "name": firstname,
                "permission": selectedItems,
            }
            console.log(option, 'dhhhdhhd')
            AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/user-type-create-update`, option, {
                headers: {
                    'Accept': 'application/json',
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
                            text2: "User type created successfully.",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        navigation.navigate('UserTypeScreen')
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
                    console.log(`user type create error ${e}`)
                    //console.log(e.response.data?.response.records)
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
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Create a new User Type</Text>
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Name of user type</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Enter Name of user type'}
                                keyboardType=" "
                                value={firstname}
                                //helperText={'Please enter lastname'}
                                inputType={'others'}
                                onChangeText={(text) => changeFirstname(text)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Permission</Text>
                            <Text style={styles.requiredheader}>*</Text>
                        </View>
                        <View style={styles.fieldcontainer}>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => toggleSelection(item)}
                                    >
                                        <MaterialCommunityIcons
                                            name={selectedItems.includes(item) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                            size={24}
                                            color="#444"
                                        />
                                        <Text style={styles.text}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>

                </View>


            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>

                <CustomButton label={"Create User type"}
                    //onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default AddNewUserType;

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
    fieldcontainer: {
        padding: 0,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    text: {
        color: '#746868',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginLeft: 10,
    },
});
