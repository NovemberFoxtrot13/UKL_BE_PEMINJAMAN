import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });
    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const BorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const ReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: BorrowDate,
        return_date: ReturnDate,
      };
    });
    if (formattedData) {
      res.json({
        success: true,
        data: formattedData,
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
export const addPeminjaman = async (req, res) => {
  const { id_user, id_item, borrow_date, return_date, qty } = req.body;

  const formattedBorrowDate = new Date(borrow_date).toISOString(); // Format tanggal
  const formattedReturnDate = new Date(return_date).toISOString();

  try {
    const [getUserId, getBarangId] = await Promise.all([
      prisma.user.findUnique({ where: { id_user: Number(id_user) } }),
      prisma.iventaris.findUnique({ where: { id_barang: Number(id_item) } }),
    ]);

    if (!getUserId || !getBarangId) {
      return res.status(404).json({ msg: "User atau barang tidak ditemukan." });
    }

    // Tambahkan validasi ketersediaan barang
    if (getBarangId.quantity < qty) {
      return res.status(400).json({ msg: "Stok barang tidak mencukupi." });
    }

    const result = await prisma.peminjaman.create({
      data: {
        user: { connect: { id_user: Number(id_user) } },
        barang: { connect: { id_barang: Number(id_item) } },
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
        qty: qty, // Pastikan qty dicatat
      },
    });

    res.status(201).json({
      success: true,
      message: "Peminjaman Berhasil Dicatat",
      data: {
        id_user: result.id_user,
        id_barang: result.id_barang,
        qty: result.qty,
        borrow_date: result.borrow_date.toISOString().split("T")[0],
        return_date: result.return_date.toISOString().split("T")[0],
        status: result.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

export const pengembalianBarang = async (req, res) => {
  const { borrow_id, return_date } = req.body;

  try {
    const formattedReturnDate = new Date(return_date).toISOString();

    // Cek data peminjaman
    const cekBorrow = await prisma.peminjaman.findUnique({
      where: { id_peminjaman: Number(borrow_id) },
    });

    if (!cekBorrow) {
      return res.status(404).json({
        status: "failed",
        message: "ID peminjaman tidak ditemukan",
      });
    }

    if (cekBorrow.status !== "dipinjam") {
      return res.status(400).json({
        status: "failed",
        message: "Barang sudah dikembalikan atau status tidak valid",
      });
    }

    // Update peminjaman dengan return_date dan status "kembali"
    const updatedPeminjaman = await prisma.peminjaman.update({
      where: {
        id_peminjaman: Number(borrow_id),
      },
      data: {
        return_date: formattedReturnDate,
        status: "kembali",
      },
    });

    // Cek barang terkait
    const item = await prisma.iventaris.findUnique({
      where: { id_barang: Number(cekBorrow.id_barang) },
    });

    if (!item) {
      return res.status(404).json({
        status: "failed",
        message: `Barang dengan ID ${cekBorrow.id_barang} tidak ditemukan`,
      });
    }

    // Kembalikan stok barang
    const restoreQty = item.quantity + cekBorrow.qty;

    const updatedBarang = await prisma.iventaris.update({
      where: {
        id_barang: Number(cekBorrow.id_barang),
      },
      data: {
        quantity: restoreQty,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Pengembalian berhasil dicatat",
      data: {
        borrow_id: updatedPeminjaman.id_peminjaman,
        item_id: updatedPeminjaman.id_barang,
        user_id: updatedPeminjaman.id_user,
        actual_return_date: updatedPeminjaman.return_date,
        return_date: updatedPeminjaman.return_date.toISOString().split("T")[0],
        status: updatedPeminjaman.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Terjadi kesalahan saat memproses pengembalian",
    });
  }
};


export const usageReport = async (req, res) => {
    const { start_date, end_date, category, location } = req.body;
  
    try {
      // Validasi input tanggal
      if (!start_date || !end_date) {
        return res.status(400).json({
          status: "failed",
          message: "Masukan tanggal mulai dan tanggal selesai",
        });
      }
  
      const formattedStartDate = new Date(start_date);
      const formattedEndDate = new Date(end_date);
  
      if (isNaN(formattedStartDate) || isNaN(formattedEndDate)) {
        return res.status(400).json({
          status: "failed",
          message: "Format tanggal tidak valid",
        });
      }
  
    
      const items = await prisma.barang.findMany({
        where: {
          AND: [
            { category: { contains: category || "" } },
            { location: { contains: location || "" } },
          ],
        },
      });
  
      if (items.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "Tidak ada barang yang sesuai dengan kriteria",
        });
      }
  
      const borrowRecords = await prisma.peminjaman.findMany({
        where: {
          borrow_date: { gte: formattedStartDate.toISOString() },
          return_date: { lte: formattedEndDate.toISOString() },
        },
      });
  
      const analysis = items.map((item) => {
        const relevantBorrows = borrowRecords.filter(
          (record) => record.id_barang === item.id_barang
        );
  
        const totalBorrowed = relevantBorrows.reduce(
          (sum, record) => sum + record.qty,
          0
        );
  
        const totalReturned = relevantBorrows.reduce(
          (sum, record) => (record.status === "dikembalikan" ? sum + record.qty : sum),
          0
        );
  
        return {
          group: item.category, 
          location: item.location,
          total_borrowed: totalBorrowed,
          total_returned: totalReturned,
          items_in_use: totalBorrowed - totalReturned,
        };
      });
  
      res.status(200).json({
        status: "success",
        data: {
          analysis_period: {
            start_date,
            end_date,
          },
          usage_analysis: analysis,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "Terjadi error",
        error: error.message,
      });
    }
  };
  