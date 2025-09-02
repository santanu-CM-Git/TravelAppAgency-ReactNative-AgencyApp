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
import { addIconImg, facebookImg, googleImg, plus, userPhoto } from '../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileEditScreen = ({ route }) => {
  const navigation = useNavigation();
  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [contactno, setContactno] = useState('');
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [websiteurl, setwebsiteurl] = useState('');
  const [googlelink, setGooglelink] = useState('')
  const [facebooklink, setFacebooklink] = useState('')
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);

  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter agency name.')
    }
  }

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const pickedDocument = result[0];
      setPickedDocument(pickedDocument);

      // const formData = new FormData();
      // if (pickedDocument) {
      //   formData.append("profile_pic", {
      //     uri: pickedDocument.uri,
      //     type: pickedDocument.type || 'image/jpeg',
      //     name: pickedDocument.name || 'photo.jpg',
      //   });
      // } else {
      //   formData.append("profile_pic", "");
      // }

    } catch (err) {
      setIsPicUploadLoading(false);
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker was cancelled');
      } else if (err.response) {
        console.log('Error response:', err.response.data?.response?.records);
        handleAlert('Oops..', err.response.data?.message);
      } else {
        console.error('Error picking document', err);
      }
    }
  };

  const handleCoverPhotoPick = async () => {

    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      console.log(res);
      const coverdocs = res;
      setCoverFile(null)
      setCoverPhoto(coverdocs);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.warn('Error picking document:', err);
      }
    }
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
          setFirstname(userInfo?.name)
          const countryCode = userInfo?.country_code;
          const mobile = userInfo?.mobile;
          setContactno(countryCode + mobile)
          setLocation(userInfo?.address)
          setDescription(userInfo?.tag_line)
          setwebsiteurl(userInfo?.website_url)
          setGooglelink(userInfo?.google_profile)
          setFacebooklink(userInfo?.fb_profile)
          setImageFile(userInfo?.profile_photo_url)
          setCoverFile(userInfo?.cover_photo_url)
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

  const submitForm = () => {
    if (!firstname) {
      setFirstNameError('Please enter name.');
    } else {
      setFirstNameError('');
    }

    if (!description) {
      setDescriptionError('Please enter tagline.');
    } else {
      setDescriptionError('');
    }

    if (firstname && description) {
      console.log('okkkkk')
      const formData = new FormData();
      if (pickedDocument) {
        formData.append("profile_photo", {
          uri: pickedDocument.uri,
          type: pickedDocument.type || 'image/jpeg',
          name: pickedDocument.name || 'photo.jpg',
        });
      } else {
        formData.append("profile_photo", "");
      }
      if (coverPhoto) {
        formData.append("cover_photo", {
          uri: coverPhoto.uri,
          type: coverPhoto.type || 'image/jpeg',
          name: coverPhoto.name || 'photo.jpg',
        });
      } else {
        formData.append("cover_photo", "");
      }
      formData.append("name", firstname);
      formData.append("tag_line", description);
      formData.append("google_profile", googlelink);
      formData.append("fb_profile", facebooklink);
      formData.append("website_url", websiteurl);

      console.log(JSON.stringify(formData), 'hhhhhhhh');

      setIsLoading(true)
      AsyncStorage.getItem('userToken', (err, usertoken) => {
        console.log(usertoken, 'dsadasd')
        axios.post(`${API_URL}/agent/profile-update`, formData, {
          headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${usertoken}`,
            'Content-Type': 'multipart/form-data'
          },
        })
          .then(res => {
            console.log(res.data)
            if (res.data.response == true) {
              setIsLoading(false)
              Toast.show({
                type: 'success',
                text1: '',
                text2: "Profile data updated successfully.",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
              });
              navigation.navigate('ProfileScreen')
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
          .catch(error => {
            setIsLoading(false)
            console.log(`user update error ${error}`)
            if (error.response?.data?.errors) {
              // Handle validation errors
              const errors = error.response.data.errors;
              Object.keys(errors).forEach(key => {
                Toast.show({
                  type: 'error',
                  text1: 'Validation Error',
                  text2: errors[key][0]
                });
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Something went wrong'
              });
            }
          });
      });
    } else {
      // Optionally handle case where some fields are still invalid
    }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 20, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
        </View>
        <View style={styles.photocontainer}>
          {/* Cover Photo Section */}
          {/* <View style={styles.coverPhotoContainer}>
            <TouchableOpacity style={styles.addCoverButton}>
              <Image source={addIconImg} style={styles.iconStyle2} />
              <Text style={styles.addCoverText}>Add Cover Photo</Text>
            </TouchableOpacity>
             <TouchableOpacity style={styles.cameraIconCover}>
              <Image source={plus} style={styles.iconStyle2} />
            </TouchableOpacity>
          </View> */}
          <View style={styles.coverPhotoContainer}>
            {coverPhoto || coverFile ? (
              <Image source={{ uri: coverFile ? coverFile : coverPhoto.uri }} style={styles.coverPhotoImage} />
            ) : (
              <TouchableOpacity style={styles.addCoverButton} activeOpacity={0.7} onPress={handleCoverPhotoPick}>
                <Image source={addIconImg} style={styles.iconStyle2} />
                <Text style={styles.addCoverText}>Add Cover Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cameraIconCover} onPress={handleCoverPhotoPick}>
              <Image source={plus} style={styles.iconStyle2} />
            </TouchableOpacity>
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
              {/* <Image
                source={userPhoto} // Replace with actual profile image
                style={styles.profilePic}
              /> */}
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={styles.profilePic} />
                  ) : (
                    <Image source={userPhoto} style={styles.profilePic} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={styles.profilePic} />
                )
              )}
              {/* Profile Picture Camera Icon */}
              <TouchableOpacity style={styles.cameraIconProfile} onPress={pickDocument}>
                <Image source={plus} style={styles.iconStyle2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.wrapper}>

          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Agency Name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Agency Name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Contact No.</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Contact No.'}
                keyboardType=" "
                value={contactno}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => setContactno(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Location</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {/* <View style={styles.inputView}>
              <InputField
                label={'Location'}
                keyboardType=" "
                value={location}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => setLocation(text)}
              />
            </View> */}
            {/* <View style={[styles.inputContainer, { backgroundColor: '#F4F5F5' }]}>
              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor="#A0A0A0"
                value={location}
                onChangeText={(text) => setLocation(text)}
                editable={false}
                scrollEnabled={true}
                multiline={false}
                textAlign="left"
              />
            </View> */}

            <View style={[styles.inputContainer, { backgroundColor: '#F4F5F5' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.input}>
                  {location}
                </Text>
              </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Tag Line</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {descriptionError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{descriptionError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Tag line'}
                keyboardType=" "
                value={description}
                //helperText={'Please enter lastname'}
                inputType={'address'}
                onChangeText={(text) => setDescription(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Website url</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Enter your Website url'}
                keyboardType=" "
                value={websiteurl}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setwebsiteurl(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Social profiles</Text>
            </View>
            <View style={styles.inputContainer}>
              <Image source={googleImg} style={[styles.iconStyle, { marginRight: 10 }]} />
              <TextInput
                style={styles.input}
                placeholder="Enter your url"
                placeholderTextColor="#A0A0A0"
                value={googlelink}
                onChangeText={(text) => setGooglelink(text)}
              />
            </View>

            {/* Facebook Input */}
            <View style={styles.inputContainer}>
              <Image source={facebookImg} style={[styles.iconStyle, { marginRight: 10 }]} />
              <TextInput
                style={styles.input}
                placeholder="Enter your url"
                placeholderTextColor="#A0A0A0"
                value={facebooklink}
                onChangeText={(text) => setFacebooklink(text)}
              />
            </View>
          </View>

        </View>


      </KeyboardAwareScrollView>
      <View style={styles.buttonwrapper}>

        <CustomButton label={"Update"}
          //onPress={() => { login() }}
          onPress={() => { submitForm() }}
        />
      </View>
    </SafeAreaView >
  );
};

export default ProfileEditScreen;

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
    marginTop: responsiveHeight(2)
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
    bottom: 10,
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
    elevation: 3,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: "#A0A0A0",
    paddingVertical: 12,
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
