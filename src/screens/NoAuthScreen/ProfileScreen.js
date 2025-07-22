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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
import { addIconImg, editImg, plus, userPhoto } from '../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState([])

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
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingTop: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileEditScreen')}>
          <Image
            source={editImg}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.photocontainer}>
        {/* Cover Photo Section */}
        <View style={styles.coverPhotoContainer}>
          <Image source={{ uri: userInfo?.cover_photo_url }} style={styles.coverPhotoImage} />
        </View>
        {/* SVG for Circular Ripple with Bottom Fade */}
        <Svg height="250" width="250" style={styles.svg}>
          <Defs>
            {/* Gradient Mask to Fade Top */}
            <LinearGradient id="fadeGradient" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="white" stopOpacity="1" />
              <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="white" stopOpacity="0" />
            </LinearGradient>

            {/* Masking the Circles */}
            <Mask id="circleMask">
              <Rect x="0" y="90" width="250" height="160" fill="url(#fadeGradient)" />
            </Mask>
          </Defs>

          {/* Outer Circles with Mask */}
          <Circle cx="125" cy="125" r="55" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
          <Circle cx="125" cy="125" r="45" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
        </Svg>
        {/* Profile Picture Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profilePicWrapper}>
            <Image
              source={{ uri: userInfo?.profile_photo_url }} // Replace with actual profile image
              style={styles.profilePic}
            />
            {/* Profile Picture Camera Icon */}
            {/* <TouchableOpacity style={styles.cameraIconProfile}>
                <Image source={plus} style={styles.iconStyle2} />
              </TouchableOpacity> */}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: responsiveHeight(5) }}>
        <Text style={styles.username}>{userInfo?.name}</Text>
      </View>
      <View style={styles.wrapper}>
        {/* <View style={styles.mainView}>
            <View style={styles.imageContainer}>
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={styles.imageStyle} />
                  ) : (
                    <Image source={userPhoto} style={styles.imageStyle} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={styles.imageStyle} />
                )
              )}
            </View>
            <TouchableOpacity style={styles.plusIcon} onPress={pickDocument}>
              <Image source={plus} style={styles.iconStyle} />
            </TouchableOpacity>
          </View> */}
        <View style={styles.aboutContainer}>
          {/* Contact Info */}
          <View style={styles.contactRow}>
            <FontAwesome name="phone" size={16} color="red" />
            <Text style={styles.contactText}>{userInfo?.country_code} {userInfo?.mobile}</Text>
          </View>

          <View style={styles.contactRow}>
            <FontAwesome name="map-marker" size={16} color="red" />
            <Text style={styles.contactText}>{userInfo?.address}</Text>
          </View>

          {/* About Me Section */}
          <Text style={styles.aboutTitle}>About Me</Text>
          <Text style={styles.aboutText}>
            {userInfo?.tag_line}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 15,
    //height: responsiveHeight(78)
    marginBottom: responsiveHeight(2)
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
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  coverPhotoContainer: {
    height: responsiveHeight(20),
    width: '100%',
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
    bottom: -10,
    // right: 150,
    // left: 150,
    zIndex: 3,
    alignSelf: 'center',
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
  aboutContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactText: {
    color: "#746868",
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    marginLeft: 8,
  },
  aboutTitle: {
    color: "#000000",
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(2),
    marginTop: 10,
  },
  aboutText: {
    color: "#746868",
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
    marginTop: 5,
  },
  svg: {
    position: 'absolute',
    bottom: -responsiveHeight(12.5),
    zIndex: 2,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
