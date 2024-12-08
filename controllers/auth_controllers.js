import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secretKey = "moklet";

export const authenticate = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Username tidak ditemukan",
      });
    }

    if (user.password !== md5(password)) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    const payload = {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" }); // token valid selama 1 jam
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const authorize = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak diberikan atau format salah",
      });
    }

    const token = authHeader.split(" ")[1];
    const verifiedUser = jwt.verify(token, secretKey);
    req.user = verifiedUser; // Tambahkan payload token ke req.user
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Token telah kadaluwarsa",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Token tidak valid",
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat memverifikasi token",
    });
  }
};
