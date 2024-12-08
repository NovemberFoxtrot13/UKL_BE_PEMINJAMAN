import express from "express";
import {
  getAllUser,
  getUserById,
  addUser,
  updateUser,
  delateUser,
} from "../controllers/user_controller.js";

const app = express();

app.use(express.json());

app.get("/", getAllUser);
app.get("/:id", getUserById);
app.post("/", addUser);
app.put("/:id", updateUser);
app.delete("/:id", delateUser);

export default app;
