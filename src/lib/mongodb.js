import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 10000,
}).then((mongoose) => {
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;