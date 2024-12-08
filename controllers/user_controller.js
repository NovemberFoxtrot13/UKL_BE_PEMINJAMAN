import { PrismaClient } from "@prisma/client";
import { response } from "express";

const prisma = new PrismaClient()

export const getAllUser = async (req, res) => {
  try {
    const result = await prisma.user.findMany()
    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    })
  }
}
export const getUserById = async (req, res) => {
  try {
    const result = await prisma.user.findUnique({
      where : {
        id_user: Number (req.params.id),
      },
    })
    response.status(200).json({
      success: true,
      data: result,
    })
  } catch (error){
    console.log(error)
    res.json({
      msg : message.error,
    })
  }
}
export const addUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body
    const result = await prisma.user.create({
      data: {
      nama_user: nama,
      username: username,
      password: password,
      role: role
      },
    })
    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.log(error)
    res.json({
      msg: `msg.error${error}`
    })
  }
}
export const updateUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body
    const result = await prisma.user.update({
      where: {
        id_user: req.params.id,
      },
      data: {
        nama_user: nama,
        username: username,
        password: password,
        role: role
      },
    })
    response.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.log(error)
    res.json({
      msg: message.error,
    })
  }
}
export const delateUser = async (req, res) => {
  try {
    const result = await prisma.user.delete({
      where: {
        id_user: req.params.id,
      },
    })
    response.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.log(error)
    res.json({
      msg: message.error,
    })
  }
}