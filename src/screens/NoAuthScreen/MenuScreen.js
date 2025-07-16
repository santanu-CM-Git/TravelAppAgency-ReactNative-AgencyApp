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
import { accountMenu, accountSettingsMenu, arrowRightImg, bankMenu, editImg, logoutMenuImg, mybookingMenuImg, packagepostMenuImg, plus, policyMenuImg, profileMenu, settingsMenuImg, supportMenuImg, teamMenu, termMenuImg, transactionMenuImg, userPhoto } from '../../utils/Images';
import Icon from 'react-native-vector-icons/FontAwesome';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
    { id: 1, title: 'Profile', icon: profileMenu, page: 'ProfileScreen', alwaysVisible: true },
    { id: 3, title: 'Accounts', icon: accountMenu, page: 'TransactionScreen', permission: 'Accounts' },
    { id: 4, title: 'Team', icon: teamMenu, page: 'TeamScreen', permission: 'Team' },
    { id: 6, title: 'Bank', icon: bankMenu, page: 'BankLinkedScreen', permission: 'Bank' },
    { id: 7, title: 'Delete Account', icon: settingsMenuImg, page: 'DeleteAccount', alwaysVisible: true },
    { id: 9, title: 'Support', icon: supportMenuImg, page: 'SupportScreen', alwaysVisible: true },
    { id: 10, title: 'Logout', icon: logoutMenuImg, page: 'Logout', alwaysVisible: true },
];

const MenuScreen = ({ navigation, route }) => {

    const [userInfo, setUserInfo] = useState([])
    const [filteredMenuItems, setFilteredMenuItems] = useState([])
    const { login, userToken, logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true)


    const navigationFunction = (item) => {
        if (item === 'Logout') {
            Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Logout',
                        onPress: () => logout(),
                        style: 'destructive', // optional: makes it red on iOS
                    },
                ],
                { cancelable: true }
            );
        } else if (item === "DeleteAccount") {
            Alert.alert(
                'Confirm Delete Account',
                'Are you sure you want to delete your account?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: () => null,
                        style: 'destructive', // optional: makes it red on iOS
                    },
                ],
                { cancelable: true }
            );
        } else {
            navigation.navigate(item);
        }
    };
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

    const filterMenuItems = (permissions, userType) => {
        // If user type is null, show all menu items
        if (!userType) {
            return menuItems;
        }
        return menuItems.filter(item => {
            if (item.alwaysVisible) return true;
            return permissions.includes(item.permission);
        });
    };

    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/profile-details`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;
                    console.log(userInfo, 'user data from contact informmation')
                    setUserInfo(userInfo)
                    // Filter menu items based on permissions
                    const permissions = userInfo?.user_type?.user_type?.permission || [];
                    const userType = userInfo?.user_type;
                    setFilteredMenuItems(filterMenuItems(permissions, userType));
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchProfileDetails();
    }, [])

    useFocusEffect(
        useCallback(() => {
            fetchProfileDetails();
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
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(2) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
                    </View>
                    {/* <TouchableOpacity onPress={() => navigation.navigate('ProfileEditScreen')}>
                        <Image
                            source={editImg}
                            style={styles.editIcon}
                        />
                    </TouchableOpacity> */}
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.mainView}>
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
                            <Circle cx="125" cy="125" r="60" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                            <Circle cx="125" cy="125" r="50" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                        </Svg>
                        <View style={styles.imageContainer}>

                            <Image source={{ uri: userInfo.profile_photo_url }} style={styles.imageStyle} />
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.username}>{userInfo?.name}</Text>
                        </View>
                    </View>
                    <View style={styles.menucontainer}>
                        <FlatList
                            data={filteredMenuItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.menuItem} onPress={() => navigationFunction(item.page)}>
                                    <View style={styles.iconContainer}>
                                        <Image
                                            source={item.icon}
                                            style={styles.menuIcon}
                                        />
                                    </View>
                                    <Text style={styles.menuText}>{item.title}</Text>
                                    {/* <Icon name="chevron-right" size={16} color="#ff5b77" /> */}
                                    <Image
                                        source={arrowRightImg}
                                        style={styles.arrowIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                </View>


            </KeyboardAwareScrollView>

        </SafeAreaView >
    );
};

export default MenuScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 10,
        //height: responsiveHeight(78)
        marginBottom: responsiveHeight(2)
    },
    mainView: {
        alignSelf: 'center',
        marginTop: responsiveHeight(2),
        justifyContent: 'center',
        alignItems: 'center'
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
    imageStyle: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10
    },
    editIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
        marginRight: 15
    },
    username: {
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    useremail: {
        color: "#545F71",
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(2),
    },
    menucontainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        marginTop: responsiveWidth(2),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 5,
        borderRadius: 10,
        elevation: 3, // Shadow effect
        margin: 5
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffe5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Medium',
        color: '#1B2234',
    },
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    menuIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain',
    },
    svg: {
        position: 'absolute',
        bottom: -responsiveHeight(5)
    },
});
