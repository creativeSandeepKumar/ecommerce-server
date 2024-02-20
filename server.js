import { configDotenv } from "dotenv";
import { httpServer } from "./app.js";
import connectDB from "./db/db.js";

configDotenv({
    path: "/.env"
})


const startServer = () => {
    httpServer.listen(process.env.PORT || 8080, () => {
        console.info(`Visit documentaion at: http://localhost:${process.env.PORT || 8080}`);
        console.log("Srver is running on port: " + process.env.PORT);
    })
}

try {
    connectDB().then(() => {
        startServer();
    })
} catch (err) {
        console.log("MongoDB connect error: ", err);
}