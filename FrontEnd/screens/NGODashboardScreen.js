"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"
import { Ionicons } from "@expo/vector-icons"

const NGODashboardScreen = ({ navigation, route }) => {
  const { userInfo, setUserToken, setUserInfo } = route.params
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("all")

  const fetchDonations = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await fetch(`${API_URL}/api/donations`, {
        headers: {
          "x-auth-token": token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch donations")
      }

      const data = await response.json()
      setDonations(data)
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDonations()
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userInfo")
      setUserToken(null)
      setUserInfo(null)
    } catch (error) {
      Alert.alert("Error", "Failed to logout")
    }
  }

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

  const filteredDonations = filter === "all" ? donations : donations.filter((donation) => donation.status === filter)

  const renderDonationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.donationItem}
      onPress={() => navigation.navigate("DonationDetails", { donation: item })}
    >
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle}>{item.foodName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.donorName}>From: {item.donorName}</Text>
      <Text style={styles.donationQuantity}>Quantity: {item.quantity}</Text>
      <Text style={styles.donationDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.donationFooter}>
        <Text style={styles.donationDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{userInfo.fullName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Donations</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "pending" && styles.filterButtonActive]}
            onPress={() => setFilter("pending")}
          >
            <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "accepted" && styles.filterButtonActive]}
            onPress={() => setFilter("accepted")}
          >
            <Text style={[styles.filterText, filter === "accepted" && styles.filterTextActive]}>Accepted</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "completed" && styles.filterButtonActive]}
            onPress={() => setFilter("completed")}
          >
            <Text style={[styles.filterText, filter === "completed" && styles.filterTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : filteredDonations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No donations available</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDonations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  donationItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  donorName: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 5,
  },
  donationQuantity: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  donationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  donationDate: {
    fontSize: 14,
    color: "#888",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
})

export default NGODashboardScreen

