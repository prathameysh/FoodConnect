"use client"

import { useState } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"
import { Ionicons } from "@expo/vector-icons"

const DonationDetailsScreen = ({ route, navigation }) => {
  const { donation, userInfo } = route.params
  const [status, setStatus] = useState(donation.status)
  const [isLoading, setIsLoading] = useState(false)
  const isNGO = userInfo && userInfo.userType === "ngo"

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFC107"
      case "accepted":
        return "#2196F3"
      case "completed":
        return "#4CAF50"
      default:
        return "#757575"
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setIsLoading(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await fetch(`${API_URL}/api/donations/${donation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update donation status")
      }

      setStatus(newStatus)
      Alert.alert("Success", "Donation status updated successfully")
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{donation.foodName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donor Information</Text>
          <Text style={styles.donorName}>{donation.donorName}</Text>
          <Text style={styles.donorEmail}>{donation.donorEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>Quantity: {donation.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>Expiry Date: {new Date(donation.expiryDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#4CAF50" />
            <Text style={styles.detailText}>Posted on: {new Date(donation.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{donation.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Address</Text>
          <Text style={styles.address}>{donation.pickupAddress}</Text>
        </View>

        {isNGO && status === "pending" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStatusUpdate("accepted")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Accept Donation</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isNGO && status === "accepted" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
            onPress={() => handleStatusUpdate("completed")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark as Completed</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  donorName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
  },
  donorEmail: {
    fontSize: 16,
    color: "#666",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  address: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
})

export default DonationDetailsScreen

