import React, { useContext, useState, useRef } from 'react';
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
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard
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
import { API_URL, GOOGLE_MAP_KEY } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from "moment"
import Toast from 'react-native-toast-message';
import { addIconImg, facebookImg, googleImg, plus, userPhoto } from '../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];
const dataMarital = [
  { label: 'Married', value: 'Married' },
  { label: 'Single', value: 'Single' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' }
];

const PersonalInformation = ({ route }) => {
  const navigation = useNavigation();
  const autocompleteRef = useRef(null);

  const [firstname, setFirstname] = useState(route?.params?.name);
  const [firstNameError, setFirstNameError] = useState('')
  const [tagline, settagline] = useState('');
  const [taglineError, settaglineError] = useState('');
  const [location, setlocation] = useState('');
  const [locationError, setlocationError] = useState('');
  const [long, setlong] = useState('54.222');
  const [lat, setlat] = useState('22.444');
  const [country, setcountry] = useState('');
  const [websiteurl, setwebsiteurl] = useState('');
  const [websiteurlError, setwebsiteurlError] = useState('');
  const [googleurl, setgoogleurl] = useState('');
  const [facebookurl, setfacebookurl] = useState('');

  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [coverPhoto, setCoverPhoto] = useState(null);

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  // Calculate responsive dimensions for circular ripple
  const profileImageSize = responsiveWidth(20); // 20% of screen width
  const svgSize = profileImageSize * 2.5; // Adjusted for better proportion
  const centerPoint = svgSize / 2;
  const innerCircleRadius = profileImageSize * 0.56; // Slightly smaller for this layout
  const outerCircleRadius = profileImageSize * 0.69; // Adjusted for this layout

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [dobError, setdobError] = useState('');
  const [open, setOpen] = useState(false)


  // experience dropdown
  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);


  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);

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
      setCoverPhoto(coverdocs);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.warn('Error picking document:', err);
      }
    }
  };


  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter name.')
    }
  }

  const changetagline = (text) => {
    settagline(text)
    if (text) {
      settaglineError('')
    } else {
      settaglineError('Please enter name.')
    }
  }
  const changelocation = (text) => {
    setlocation(text)
    if (text) {
      setlocationError('')
    } else {
      setlocationError('Please enter location.')
    }
  }
  const changewebsiteurl = (text) => {
    setwebsiteurl(text)
    if (text) {
      setwebsiteurlError('')
    } else {
      setwebsiteurlError('Please enter website url.')
    }
  }

  const submitForm = () => {
    if (!firstname) {
      setFirstNameError('Please enter name.');
    } else {
      setFirstNameError('');
    }

    if (!tagline) {
      settaglineError('Please enter tagline.');
    } else {
      settaglineError('');
    }

    if (!location) {
      setlocationError('Please enter location.');
    } else {
      setlocationError('');
    }

    if (!websiteurl) {
      setwebsiteurlError('Please enter website url.');
    } else {
      setwebsiteurlError('');
    }

    if (pickedDocument && coverPhoto) {
      if (firstname && tagline && location && websiteurl) {
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
        formData.append("tag_line", tagline);
        formData.append("address", location);
        formData.append("long", long);
        formData.append("lat", lat);
        formData.append("country", country);
        formData.append("website_url", websiteurl);
        formData.append("google_profile", googleurl);
        formData.append("fb_profile", facebookurl);

        console.log(JSON.stringify(formData), 'hhhhhhhh');
        console.log(route?.params?.token, 'token');


        setIsLoading(true)
        axios.post(`${API_URL}/agent/profile-update`, formData, {
          headers: {
            'Accept': 'application/json',
            "Authorization": 'Bearer ' + route?.params?.token,
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
              login(route?.params?.token)
            } else {
              //console.log('not okk')
              setIsLoading(false)
              Alert.alert('Oops..', res.data.message || "Something went wrong.", [
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
            console.log(e.response.data, 'ggg')
            Alert.alert('Oops..', e.response.data || "Something went wrong", [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          });
      } else {
        // Optionally handle case where some fields are still invalid
      }
    } else {
      alert("Please upload Profile Picture and Cover Picture.")
    }


  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  const handleAndroidChange = (event, selectedDate) => {
    if (event.type === 'set') { // User clicked OK
      const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
      setSelectedDOB(selectedDate);
      setDate(formattedDate);
      setdobError('')
    }
    setOpen(false); // Close the picker
  };

  const handleIOSChange = (event, selectedDate) => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
      setSelectedDOB(selectedDate);
      setDate(formattedDate);
      setdobError('')
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
          {/* <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} /> */}
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Tour Travel Agency registration</Text>
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
            {coverPhoto ? (
              <Image source={{ uri: coverPhoto.uri }} style={styles.coverPhotoImage} />
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
              {/* <Image
                source={userPhoto} // Replace with actual profile image
                style={styles.profilePic}
              /> */}
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={[styles.profilePic, {
                      width: profileImageSize * 1,
                      height: profileImageSize * 1,
                      borderRadius: (profileImageSize * 1) / 2,
                    }]} />
                  ) : (
                    <Image source={userPhoto} style={[styles.profilePic, {
                      width: profileImageSize * 1,
                      height: profileImageSize * 1,
                      borderRadius: (profileImageSize * 1) / 2,
                    }]} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={[styles.profilePic, {
                    width: profileImageSize * 1,
                    height: profileImageSize * 1,
                    borderRadius: (profileImageSize * 1) / 2,
                  }]} />
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
                label={'Enter your Agency Name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Tagline</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {taglineError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{taglineError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Enter your tagline'}
                keyboardType=" "
                value={tagline}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changetagline(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Location</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {locationError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{locationError}</Text> : <></>}
            {/* <View style={styles.inputView}>
              <InputField
                label={'Enter your Location address'}
                keyboardType=" "
                value={location}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changelocation(text)}
              />
            </View> */}
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss(); // Dismiss keyboard
                autocompleteRef.current?.setAddressText(location); // Prevent results from disappearing
              }}
            >
              <View style={[styles.inputViews, { flex: 1, marginBottom: responsiveHeight(2) }]} >
                {/* <InputField
                        label={'Location'}
                        keyboardType=" "
                        value={location}
                        //helperText={'Please enter lastname'}
                        inputType={'others'}
                        onChangeText={(text) => changeLocation(text)}
                    /> */}

                <GooglePlacesAutocomplete
                  placeholder="Enter Location"
                  minLength={2}
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails = true
                    console.log('Place data:', data);
                    console.log('Place details:', details);
                    setlocation(details?.formatted_address);
                    setlat(details?.geometry?.location?.lat)
                    setlong(details?.geometry?.location?.lng)
                    setlocationError('')
                    // Extract country from address_components
                    const countryComponent = details?.address_components?.find(comp =>
                      comp.types.includes("country")
                    );
                    const country = countryComponent?.long_name;
                    console.log('Country:', country);
                    setcountry(country)
                  }}
                  onFail={error => console.log(error)}
                  onNotFound={() => console.log('no results')}
                  query={{
                    key: GOOGLE_MAP_KEY,
                    language: 'en', // language of the results
                  }}
                  styles={{
                    textInput: styles.textInput,
                    listView: styles.listView,
                    row: styles.autocompleteRow,
                    separator: styles.autocompleteSeparator,
                    description: {
                      color: '#716E6E', // Text color of the suggestions
                      fontSize: responsiveFontSize(1.6),
                      fontFamily: 'Outfit-Medium'
                  },
                  }}
                  debounce={200}
                  enablePoweredByContainer={false}
                  textInputProps={{
                    autoCorrect: false,
                    autoCapitalize: 'none',
                    placeholderTextColor: '#999999',
                    onFocus: () => console.log('Input focused'),
                    onBlur: () => {
                      console.log('Input blurred');
                      autocompleteRef.current?.focus(); // Refocus input to prevent hiding results
                    },
                  }}
                />

              </View>
            </TouchableWithoutFeedback>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Website url</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {websiteurlError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{websiteurlError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Enter your Website url'}
                keyboardType=" "
                value={websiteurl}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changewebsiteurl(text)}
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
                value={googleurl}
                onChangeText={(text) => setgoogleurl(text.toLowerCase())}
              />
            </View>

            {/* Facebook Input */}
            <View style={styles.inputContainer}>
              <Image source={facebookImg} style={[styles.iconStyle, { marginRight: 10 }]} />
              <TextInput
                style={styles.input}
                placeholder="Enter your url"
                placeholderTextColor="#A0A0A0"
                value={facebookurl}
                onChangeText={(text) => setfacebookurl(text.toLowerCase())}
              />
            </View>
          </View>

        </View>


      </ScrollView>
      <View style={styles.buttonwrapper}>

        <CustomButton label={"Submit"}
          //onPress={() => { login() }}
          onPress={() => { submitForm() }}
        />
      </View>
    </SafeAreaView >
  );
};

export default PersonalInformation;

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
  iconStyle2: {
    height: 20, width: 20, resizeMode: 'contain'
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
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  photocontainer: {
    //height: responsiveHeight(1),
    //backgroundColor: "red",
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
  // Added new responsive svgContainer style
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
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
  textInput: {
    height: 50,
    color: '#5d5d5d',
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autocompleteRow: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
