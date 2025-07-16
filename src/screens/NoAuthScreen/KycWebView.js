import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const KycWebView = ({ route }) => {
    const { url } = route.params;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <WebView source={{ uri: url }} startInLoadingState />
        </SafeAreaView>
    );
};

export default KycWebView;