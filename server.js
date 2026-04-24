import express from "express"
import mongoose from "mongoose"
import "./config/env.js" // this we have done because without it cloudinary.js gets reached first and at that time environment variables are not loaded in process.env so we dont get cloudinary_name api and secret which results an error
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import emailRoutes from "./routes/emailRoutes.js"
import paymentsRoutes from "./routes/paymentsRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
const app = express()
app.use(cors());
app.use(express.json()) // it converts the stringified object back into usable object, it is a built-in middleware
const port = process.env.PORT || 3000; // render apna khud ka ek port deta hai jo ki process.env.PORT me aa jata hai


await mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("MongoDB connected")
})
.catch((error)=>{
    console.log(error)
});

app.use("/api/users",userRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/email",emailRoutes)
app.use("/api/reset",emailRoutes)
app.use("/api/reset-password",emailRoutes)
app.use("/api/payments",paymentsRoutes)
app.use("/api/orders",orderRoutes)
app.use("/api/dashboard",dashboardRoutes)
app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})