import { PrismaClient } from "@prisma/client";
import md5 from "md5";

const prisma = new PrismaClient();

export const getAllBarang = async (req, res) => {
  try {
    const result = await prisma.iventaris.findMany() //Metode ini digunakan untuk mengambil banyak data yang sesuai dengan kriteria filter tertentu
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getBarangById = async (req, res) => {
  try {
    const result = await prisma.iventaris.findUnique({ //Hanya bisa digunakan jika Anda melakukan pencarian berdasarkan kolom yang unik
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};
export const addBarang = async (req, res) => {
  try {
    const { name, category, location, quantity } = req.body;
    const result = await prisma.iventaris.create({
      data: {
        name: name,
        category: category,
        location: location,
        quantity: quantity,
      },
    });
    res.status(201).json({
      success: true,
      message: "barang berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const updateBarang = async (req, res) => {
  try {
    const { name, category, location, quantity } = req.body;
    const dataCheck = await prisma.iventaris.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (!dataCheck) {
      res.status(401).json({
        msg: "tidak ditemukan",
      });
    } else {
      const result = await prisma.iventaris.update({
        where: {
          id_barang: Number(req.params.id),
        },
        data: {
          name: name,
          category: category,
          location: location,
          quantity: quantity,
        },
      });
      res.status(201).json({
        success: true,
        message: "Barang berhasil diubah",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const deleteBarang = async (req, res) => {
  try {
    const dataCheck = await prisma.iventaris.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (!dataCheck) {
      res.status(401).json({
        msg: "tidak ditemukan",
      });
    } else {
      const result = await prisma.iventaris.delete({
        where: {
          id_barang: Number(req.params.id),
        },
      });
      res.json({
        success: true,
        message: "Data barang berhasil dihapus",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
