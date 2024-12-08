import express from "express";
import {
  getAllPeminjaman,
  getPeminjamanById,
  addPeminjaman,
  pengembalianBarang,
  usageReport,
} from "../controllers/peminjaman_controllers.js";

import { authorize } from "../controllers/auth_controllers.js";
import { IsMember, IsAdmin } from "../middleware/role_validation.js";

const app = express();

// app.get("/borrow", [IsAdmin, IsMember], authorize, getAllPeminjaman);
app.get("/borrow", getAllPeminjaman);
app.get("/borrow/:id", authorize, getPeminjamanById);
app.post("/borrow", addPeminjaman);
app.post("/return", pengembalianBarang);
app.post("/usage-report", usageReport);

export default app;
