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
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { accountMenu, accountSettingsMenu, arrowRightImg, bankMenu, editImg, logoutMenuImg, mybookingMenuImg, newMemberButton, packagepostMenuImg, plus, policyMenuImg, productImg, profileMenu, settingsMenuImg, supportMenuImg, teamMenu, termMenuImg, transactionMenuImg, userPhoto, userTypeButton } from '../../utils/Images';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UserTypeScreen = ({ route }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true)
    const [userType, setUserType] = useState([])
    const { login, userToken } = useContext(AuthContext);

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
                    console.log(userInfo, 'User Type')
                    setUserType(userInfo)
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
    useFocusEffect(
        useCallback(() => {
            fetchallusertype();
        }, [navigation])
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

    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>User Type</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AddNewUserType')}>
                    <Image
                        source={userTypeButton}
                        style={styles.editIcon}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 15 }}>
                {/* <View style={styles.card}>
                    <Text style={styles.roleText}>Team Manager</Text>
                    <TouchableOpacity style={styles.editButton} onPress={null}>
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                </View> */}
                <FlatList
                    data={userType}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.roleText}>{item?.name}</Text>
                            <TouchableOpacity style={styles.editButton} onPress={() => {
                                // Handle your edit logic here
                                console.log("Edit pressed for:", item);
                                 navigation.navigate('EditNewUserType', { item });
                            }}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>No user types available</Text>
                    }
                />
            </View>
        </SafeAreaView >
    );
};

export default UserTypeScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        flex: 1
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
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    roleText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    editButton: {
        backgroundColor: '#FF4D6D',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    editText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#FFFFFF',
    },
});
