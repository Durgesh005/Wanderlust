const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Ensure owner and fallback geometry exist for every seed listing
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6ab3689e6156805ea2edf18c", // Active user ID
    geometry: obj.geometry || {
      type: "Point",
      coordinates: [77.2090, 28.6139], // Default fallback coordinates
    },
  }));

  try {
    await Listing.insertMany(initData.data);
    console.log("Data was initialized successfully!");
  } catch (err) {
    console.error("Error inserting seed data:", err.message);
  } finally {
    mongoose.connection.close();
  }
};