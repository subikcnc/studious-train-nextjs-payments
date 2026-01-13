// import { useLocalSearchParams, useRouter } from "expo-router";
// import React from "react";
// import {
//   ActivityIndicator,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { WebView } from "react-native-webview";
// import { useTheme } from "../../context/theme-context";

// export default function KhaltiPaymentScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { colors } = useTheme();
//   const [isRedirecting, setIsRedirecting] = React.useState(false);

//   const url = params.url as string;

//   // Memoize source to prevent re-renders unless URL changes
//   const source = React.useMemo(() => ({ uri: url }), [url]);

//   const handleRedirect = React.useCallback(
//     (targetUrl: string) => {
//       if (isRedirecting) return false;

//       console.log("[Khalti] Checking Redirect URL:", targetUrl);

//       if (targetUrl.includes("checkout/success")) {
//         setIsRedirecting(true);
//         const match = targetUrl.match(/orderId=([^&]*)/);
//         const orderId = match ? match[1] : null;

//         if (orderId) {
//           router.replace({
//             pathname: "/(screens)/checkout/success",
//             params: { orderId },
//           });
//         }
//         return true;
//       }

//       if (targetUrl.includes("checkout/failure")) {
//         setIsRedirecting(true);
//         // Replace with orders screen so user doesn't go back to payment processing
//         router.replace("/(screens)/orders");
//         return true;
//       }

//       return false;
//     },
//     [isRedirecting, router]
//   );

//   if (!url) {
//     return (
//       <SafeAreaView
//         style={[
//           styles.container,
//           {
//             backgroundColor: colors.background,
//             justifyContent: "center",
//             alignItems: "center",
//           },
//         ]}
//       >
//         <Text style={{ color: colors.text }}>Invalid Payment URL</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//     >
//       <StatusBar barStyle="dark-content" />
//       <WebView
//         originWhitelist={["*"]}
//         source={source}
//         style={{ flex: 1 }}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         startInLoadingState={true}
//         scalesPageToFit={true}
//         allowsInlineMediaPlayback={true}
//         mediaPlaybackRequiresUserAction={false}
//         renderLoading={() => (
//           <View style={styles.loadingOverlay}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         )}
//         onNavigationStateChange={(navState) => {
//           handleRedirect(navState.url);
//         }}
//         onShouldStartLoadWithRequest={(request) => {
//           const handled = handleRedirect(request.url);
//           if (request.url.startsWith("luxstore://") || handled) {
//             return false;
//           }
//           return true;
//         }}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.warn("WebView error: ", nativeEvent);
//         }}
//       />
//       {isRedirecting && (
//         <View style={styles.redirectOverlay}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={[styles.redirectText, { color: colors.text }]}>
//             Processing Payment Result...
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 10,
//   },
//   redirectOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 20,
//   },
//   redirectText: {
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
