const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const app = express()
const PORT = 5000
const SECRET_KEY = "Rajesh@2004"

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect("mongodb+srv://firstweb:GSQ9fjFvs6nsvKya@firstweb.9iplm.mongodb.net/FoodForGood", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err))

// User Schema
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["donor", "ngo"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Donation Schema
const DonationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  donorName: {
    type: String,
    required: true,
  },
  donorEmail: {
    type: String,
    required: true,
  },
  foodName: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model("User", UserSchema)
const Donation = mongoose.model("Donation", DonationSchema)

// Authentication Middleware
const auth = (req, res, next) => {
  const token = req.header("x-auth-token")
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" })

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" })
  }
}

// Routes
// Register User
app.post("/api/users/register", async (req, res) => {
  const { fullName, email, password, userType } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ msg: "User already exists" })
    }

    user = new User({
      fullName,
      email,
      password,
      userType,
    })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
      },
    }

    jwt.sign(payload, SECRET_KEY, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err
      res.json({ token, user: payload.user })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Login User
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" })
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
      },
    }

    jwt.sign(payload, SECRET_KEY, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err
      res.json({ token, user: payload.user })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Create Donation
app.post("/api/donations", auth, async (req, res) => {
  const { foodName, quantity, description, pickupAddress, expiryDate } = req.body

  try {
    const user = await User.findById(req.user.user.id)

    if (user.userType !== "donor") {
      return res.status(403).json({ msg: "Only donors can create donations" })
    }

    const newDonation = new Donation({
      donorId: req.user.user.id,
      donorName: user.fullName,
      donorEmail: user.email,
      foodName,
      quantity,
      description,
      pickupAddress,
      expiryDate,
    })

    const donation = await newDonation.save()
    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Get All Donations (for NGOs)
app.get("/api/donations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id)

    if (user.userType === "ngo") {
      const donations = await Donation.find().sort({ createdAt: -1 })
      return res.json(donations)
    } else {
      const donations = await Donation.find({ donorId: req.user.user.id }).sort({ createdAt: -1 })
      return res.json(donations)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Update Donation Status
app.put("/api/donations/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id)

    if (user.userType !== "ngo") {
      return res.status(403).json({ msg: "Only NGOs can update donation status" })
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

