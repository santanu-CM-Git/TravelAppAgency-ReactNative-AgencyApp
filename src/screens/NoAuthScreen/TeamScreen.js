import React, { useContext, useState, useRef, useCallback,useEffect } from 'react';
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
import moment from "moment"
import Toast from 'react-native-toast-message';
import { accountMenu, accountSettingsMenu, arrowRightImg, bankMenu, editImg, logoutMenuImg, mybookingMenuImg, newMemberButton, packagepostMenuImg, plus, policyMenuImg, productImg, profileMenu, settingsMenuImg, supportMenuImg, teamMenu, termMenuImg, transactionMenuImg, userPhoto } from '../../utils/Images';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const TeamScreen = ({ route }) => {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const UserCard = ({ item }) => (
        <View style={styles.card}>
            <Image source={productImg} style={styles.avatar} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.position}>{item.user_type?.user_type?.name || 'Admin'}</Text>
                <Text style={styles.position}>{item.country_code} {item.mobile}</Text>
            </View>
            {/* <Text style={styles.role}>{item.role}</Text> */}
        </View>
    );

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

    const fetchalluser = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/agent/team-member`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;
                    console.log(userInfo, 'User Type')
                    setUsers(userInfo)
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }
    useEffect(() => {
        fetchalluser();
    }, [])
    useFocusEffect(
        useCallback(() => {
            fetchalluser();
        }, [navigation])
      );
    

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
            <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Team</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AddNewMemberScreen')}>
                    <Image
                        source={newMemberButton}
                        style={styles.editIcon}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 5 }}>
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <UserCard item={item} />}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
            <View style={styles.buttonwrapper}>

                <CustomButton label={"Manage user type"}
                    buttonColor={'small'}
                    onPress={() => { navigation.navigate('UserTypeScreen') }}
                //onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default TeamScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        flex: 1,
    },
    loader: {
        position: 'absolute',
    },
    editIcon: {
        height: responsiveHeight(5),
        width: responsiveWidth(40),
        resizeMode: 'contain',
    },
    listContainer: {
        padding: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.8),
        color: '#000000',
    },
    position: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
        color: '#777',
    },
    role: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.5),
        color: '#777',
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
});
