"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import DateTimePicker from "@react-native-community/datetimepicker"
import { API_URL } from "../config"
import { Ionicons } from "@expo/vector-icons"

const CreateDonationScreen = ({ navigation, route }) => {
  const { userInfo } = route.params

  const [foodName, setFoodName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [description, setDescription] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expiryDate
    setShowDatePicker(Platform.OS === "ios")
    setExpiryDate(currentDate)
  }

  const handleSubmit = async () => {
    if (!foodName || !quantity || !description || !pickupAddress) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await fetch(`${API_URL}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          foodName,
          quantity,
          description,
          pickupAddress,
          expiryDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.msg || "Failed to create donation")
      }

      Alert.alert("Success", "Your donation has been created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("DonorDashboard"),
        },
      ])
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Donate Food</Text>
          <Text style={styles.formSubtitle}>Fill in the details about the food you want to donate</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Food Name</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Rice, Bread, Canned Goods"
              value={foodName}
              onChangeText={setFoodName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 5kg, 10 packets, 3 boxes"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide details about the food, its condition, etc."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pickup Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter the address where the food can be picked up"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{expiryDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Donation</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default CreateDonationScreen

