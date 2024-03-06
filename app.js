import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { dbInstance } from "./db/db.js";
import { DB_NAME } from "./constants.js";
import fs from "fs";
import path from "path";
import {ApiError} from "./utils/ApiError.js";
import {errorHandler} from "./middlewares/error.middleware.js";
import {ApiResponse} from "./utils/ApiResponse.js";
import { configDotenv } from "dotenv";

configDotenv({
    path: "/.env"
})

const app = express();

const httpServer = createServer(app);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}));


import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/coupon", couponRoutes);

app.use("/", (req, res) => {
    res.send("Server is running successfully");
});

app.delete("/api/v1/reset-db", async(req, res) => {
    if(dbInstance) {
        await dbInstance.connection.db.dropDatabase({
            dbName: DB_NAME,
        });
        
        const directory = "./public/images";

        fs.readdir(directory, (err, files) => {
            if(err) {
                console.log("Error while removing the images: ", err);
            } else {
                for(const file of files) {
                    if(file === ".getkeep") continue;
                    fs.unlink(path.join(directory, file), (err) => {
                        if(err) throw err;
                    })
                }
            }
        });

        fs.unlink("./public/temp/seed-credentials.json", (err) => {
            if(err) console.log("Seed credentials are missing.");
        });
        return res.status(200).json(new ApiResponse(200, null, "Database dropped successfully"));
    }
    throw new ApiError(500, "Something went wrong while dropping database");
})

app.use(errorHandler);

export {httpServer};