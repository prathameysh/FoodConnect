"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"

// Import screens
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import DonorDashboardScreen from "./screens/DonorDashboardScreen"
import NGODashboardScreen from "./screens/NGODashboardScreen"
import CreateDonationScreen from "./screens/CreateDonationScreen"
import DonationDetailsScreen from "./screens/DonationDetailsScreen"

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const userInfoStr = await AsyncStorage.getItem("userInfo")

      if (token && userInfoStr) {
        setUserToken(token)
        setUserInfo(JSON.parse(userInfoStr))
      }

      setIsLoading(false)
    } catch (error) {
      console.log("Error checking login status:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkLoginStatus()
  }, [])

  if (isLoading) {
    return null // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {userToken === null ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "FoodForGood - Login",
                headerTitleAlign: "center"
               }}
              initialParams={{ setUserToken, setUserInfo }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "FoodForGood - Register",
                headerTitleAlign: "center"
               }}
              initialParams={{ setUserToken, setUserInfo }}
            />
          </>
        ) : (
          // App screens
          <>
            {userInfo && userInfo.userType === "donor" ? (
              <>
                <Stack.Screen
                  name="DonorDashboard"
                  component={DonorDashboardScreen}
                  options={{ title: "Donor Dashboard",
                    headerTitleAlign: "center"
                   }}
                  initialParams={{ userInfo, setUserToken, setUserInfo }}
                />
                <Stack.Screen
                  name="CreateDonation"
                  component={CreateDonationScreen}
                  options={{ title: "Donate Food" ,
                    headerTitleAlign: "center"
                  }}
                  initialParams={{ userInfo }}
                />
                <Stack.Screen
                  name="DonationDetails"
                  component={DonationDetailsScreen}
                  options={{ title: "Donation Details",
                    headerTitleAlign: "center"
                   }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="NGODashboard"
                  component={NGODashboardScreen}
                  options={{ title: "NGO Dashboard" ,
                    headerTitleAlign: "center"
                  }}
                  initialParams={{ userInfo, setUserToken, setUserInfo }}
                />
                <Stack.Screen
                  name="DonationDetails"
                  component={DonationDetailsScreen}
                  options={{ title: "Donation Details",
                    headerTitleAlign: "center"
                   }}
                  initialParams={{ userInfo }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

