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
import moment from "moment"
import Toast from 'react-native-toast-message';
import { addIconImg, editImg, plus, userPhoto } from '../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState([])

  // Calculate responsive dimensions for circular ripple
  const profileImageSize = responsiveWidth(20); // 20% of screen width
  const svgSize = profileImageSize * 2.5; // Adjusted for better proportion
  const centerPoint = svgSize / 2;
  const innerCircleRadius = profileImageSize * 0.56; // Slightly smaller for this layout
  const outerCircleRadius = profileImageSize * 0.69; // Adjusted for this layout

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
        {userInfo?.parent_data == null ?
          <TouchableOpacity onPress={() => navigation.navigate('ProfileEditScreen')}>
            <Image
              source={editImg}
              style={styles.editIcon}
            />
          </TouchableOpacity>
          :
          null}

      </View>
      <View style={styles.photocontainer}>
        {/* Cover Photo Section */}
        <View style={styles.coverPhotoContainer}>
          <Image source={{ uri: userInfo?.parent_data ? userInfo?.parent_data?.cover_photo_url : userInfo?.cover_photo_url }} style={styles.coverPhotoImage} />
        </View>
        
        {/* Responsive SVG for Circular Ripple with Top Fade */}
        <View style={[styles.svgContainer, { width: svgSize, height: svgSize }]}>
          <Svg height={svgSize} width={svgSize} style={[styles.svg, {  }]}>
            <Defs>
              {/* Gradient Mask to Fade Top */}
              <LinearGradient id="fadeGradient" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0%" stopColor="white" stopOpacity="1" />
                <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="white" stopOpacity="0" />
              </LinearGradient>

              {/* Masking the Circles */}
              <Mask id="circleMask">
                <Rect x="0" y={svgSize * 0.36} width={svgSize} height={svgSize * 0.64} fill="url(#fadeGradient)" />
              </Mask>
            </Defs>

            {/* Outer Circles with Mask - Now Responsive */}
            <Circle 
              cx={centerPoint} 
              cy={centerPoint} 
              r={outerCircleRadius} 
              stroke="#FF7788" 
              strokeWidth="2" 
              fill="none" 
              mask="url(#circleMask)" 
            />
            <Circle 
              cx={centerPoint} 
              cy={centerPoint} 
              r={innerCircleRadius} 
              stroke="#FF99AA" 
              strokeWidth="2" 
              fill="none" 
              mask="url(#circleMask)" 
            />
          </Svg>
        </View>
        
        {/* Profile Picture Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profilePicWrapper}>
            <Image
              source={{ uri: userInfo?.parent_data ? userInfo?.parent_data?.profile_photo_url : userInfo.profile_photo_url }}
              style={[styles.profilePic, {
                width: profileImageSize * 1,
                height: profileImageSize * 1,
                borderRadius: (profileImageSize * 1) / 2,
              }]}
            />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: responsiveHeight(5) }}>
        <Text style={styles.username}>
         {userInfo?.name}
          {userInfo?.parent_data ? ` (${userInfo.parent_data.name})` : ''}
        </Text>
      </View>
      <View style={styles.wrapper}>
        <View style={styles.aboutContainer}>
          {/* Contact Info */}
          <View style={styles.contactRow}>
            <FontAwesome name="phone" size={16} color="red" />
            <Text style={styles.contactText}>{userInfo?.country_code} {userInfo?.mobile}</Text>
          </View>

          <View style={styles.contactRow}>
            <FontAwesome name="map-marker" size={16} color="red" />
            <Text style={styles.contactText}>{userInfo?.parent_data ? userInfo?.parent_data?.address : userInfo?.address}</Text>
          </View>

          {/* About Me Section */}
          <Text style={styles.aboutTitle}>About Me</Text>
          <Text style={styles.aboutText}>
            {userInfo?.parent_data ?userInfo?.parent_data?.tag_line:userInfo?.tag_line}
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
  // Added new responsive svgContainer style
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
  },
  profileContainer: {
    alignItems: "center",
    position: 'absolute',
    bottom: -10,
    zIndex: 3,
    alignSelf: 'center',
  },
  profilePicWrapper: {
    position: "relative",
  },
  // Modified profilePic style - removed fixed dimensions
  profilePic: {
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
    bottom: -responsiveHeight(9),
    zIndex: 2,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});