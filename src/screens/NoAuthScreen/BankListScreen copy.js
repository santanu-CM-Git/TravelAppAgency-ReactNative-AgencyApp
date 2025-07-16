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
import Icon from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { addIconImg, bankImg, plus, productImg, userPhoto } from '../../utils/Images';
import CustomHeader from '../../components/CustomHeader';
import Modal from "react-native-modal";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const BankListScreen = ({ route }) => {
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(false)
    const [isFilterModalVisible2, setFilterModalVisible2] = useState(false);
    const banks = [
        { name: 'SBI', image: productImg },
        { name: 'Yes Bank', image: productImg },
        { name: 'IDBI', image: productImg },
        { name: 'BOB', image: productImg },
        { name: 'PNB', image: productImg },
        { name: 'IOB', image: productImg },
        { name: 'HDFC', image: productImg },
        { name: 'AXIS', image: productImg },
        { name: 'KOTAK', image: productImg },
        { name: 'ICICI', image: productImg },
        { name: 'BOI', image: productImg },
        { name: 'INDUSIND', image: productImg },
    ];
    const toggleFilterModal2 = () => {
        setFilterModalVisible2(!isFilterModalVisible2);
    };

    if (isLoading) {
        return (
            <Loader />
        )
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
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Bank'} onPress={() => navigation.goBack()} title={'Bank'} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>

                <View style={styles.wrapper}>
                    <View style={styles.bankcontainer}>
                        <Text style={styles.title}>Select your Bank</Text>
                        <FlatList
                            data={banks}
                            keyExtractor={(item) => item.name}
                            numColumns={3}
                            contentContainerStyle={styles.listContainer}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => toggleFilterModal2()}>
                                    <View style={styles.bankCard}>
                                        <Image source={item.image} style={styles.bankImage} />
                                        <Text style={styles.bankName}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>


            </KeyboardAwareScrollView>
            {/* add new cotraveler modal */}
            <Modal
                isVisible={isFilterModalVisible2}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '40%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Add Bank of Baroda Account</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal2} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5, }}>
                            <Text style={styles.cancelText}>To improve your payments experience, extra UPI IDs will be activated. Standard SMS charges apply.<Text style={styles.learnmore}> Learn More</Text></Text>
                            <Text style={styles.cancelText}>Your phone number +91 xxxxx xxxxx will be linked as UPI number to receive money in this account.</Text>
                        </View>
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Continue"}
                                onPress={() => navigation.navigate('BankOtpScreen')}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView >
    );
};

export default BankListScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    wrapper: {
        paddingHorizontal: 23,
        //height: responsiveHeight(78)
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2),
        alignItems: 'center',
    },
    buttonwrapper: {
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        width: responsiveWidth(100),
    },
    bankcontainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: responsiveFontSize(2),
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 12,
    },
    listContainer: {
        alignItems: 'center',
    },
    bankCard: {
        width: 90,
        height: 90,
        backgroundColor: '#F8F9FD',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    bankImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    bankName: {
        marginTop: 6,
        fontSize: responsiveFontSize(1.6),
        color: "#686868",
        fontFamily: 'Poppins-Medium',
    },
    learnmore: {
        fontSize: responsiveFontSize(1.7),
        color: "#FF455C",
        fontFamily: 'Poppins-Regular',
    },
    cancelText: {
        fontSize: responsiveFontSize(1.7),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
    }
});
