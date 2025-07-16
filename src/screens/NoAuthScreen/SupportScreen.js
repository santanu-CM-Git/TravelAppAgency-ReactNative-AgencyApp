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
    Linking,
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
import { accountMenu, accountSettingsMenu, arrowRightImg, bankMenu, editImg, logoutMenuImg, mybookingMenuImg, newMemberButton, packagepostMenuImg, plus, policyMenuImg, productImg, profileMenu, settingsMenuImg, supportMenuImg, teamMenu, termMenuImg, transactionMenuImg, userPhoto } from '../../utils/Images';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

const SupportScreen = ({ navigation, route }) => {
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
    const email = "nevaeh.simmons@example.com";
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                    <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Support</Text>
                </View>
            </View>
            <View style={styles.mainContain}>
                <Text style={styles.text}>
                    <Text style={styles.bullet}>{'\u2B24'}</Text>   You can contact us for more support on the{' '}

                </Text>
                <Text
                    style={styles.email}
                    onPress={() => Linking.openURL(`mailto:${email}`)}
                >
                    {email}
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default SupportScreen;

const styles = StyleSheet.create({

    container: {
        //justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        flex: 1
    },
    mainContain: {
        padding: 15,
    },
    text: {
        color: '#1B2234',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    email: {
        color: '#FF455C', // Red email text
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginLeft: responsiveWidth(5)
    },
});
