import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import authRoute from "./routes/auth_route.js";
import userRoute from "./routes/user_route.js";
import peminjamanRoute from "./routes/peminjaman_route.js";
import inverisRoute from "./routes/iventaris_route.js";

const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use(userRoute())
// app.use(peminjamanRoute())
// app.use(inverisRoute())
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/inventaris", inverisRoute);
app.use("/api/peminjaman", peminjamanRoute);

app.use(bodyParser.json());

app.listen(process.env.APP_PORT, () => {
  console.log("server run on port " + process.env.APP_PORT);
});
