import mongoose from "mongoose"
import Estate from "../models/Estate.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getAllEstates = async (req, res) => {
	try {
		const { status, type, rooms, location, minPrice, maxPrice } = req.query // Önce filtre parametrelerini alıyoruz

		// İlk başta tüm datayı çekmemek için filtreleme yapılmadan önce 10 veri çekelim
		const limit = parseInt(req.query.limit) || 10 // Eğer limit verilmediyse varsayılan olarak 10 al

		// Filtrelemeyi DB de yapacağımız için db ye göndereceğimiz query'leri bir yerde topluyoruz
		const filterQueries = {}

		// İlgili query gönderilmişse al ve filterQueries' ekle
		if (status) filterQueries.status = status
		if (type) filterQueries.type = type
		if (rooms) filterQueries.rooms = rooms
		if (location) filterQueries.location = location
		if (minPrice) filterQueries.price = { $gte: minPrice }
		if (maxPrice) filterQueries.price = { ...filterQueries.price, $lte: maxPrice }

		// Veritabanı sorgusu, gönderilen query'lere göre db'den filtre ile çek
		const estates = await Estate.find(filterQueries).limit(limit) // Limitli sorgu
		res.status(200).json({ success: true, data: estates })
	} catch (error) {
		console.error("Emlak getirilirken sorun oluştu:", error.message)
		res.status(500).json({ success: false, message: "Sunucu hatası!" })
	}
}

export const getSingleEstate = async (req, res) => {
	const { id } = req.params

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			success: false,
			message: "Geçersiz ID!",
		})
	}

	try {
		const estate = await Estate.findById(id)

		if (!estate) {
			return res.status(404).json({ success: false, message: "Emlak bulunamadı." })
		}

		res.status(200).json({
			success: true,
			message: "Emlak başarıyla getirildi.",
			data: estate,
		})
	} catch (error) {
		console.error("Emlak getirilirken sorun oluştu:", error.message)
		res.status(500).json({ success: false, message: "Sunucu hatası!" })
	}
}

export const createEstate = async (req, res) => {
	try {
		const { title, description, price, type, status, location, size, rooms, selectedImageIndex, removeOldImages } = req.body

		const images = req.files?.map((file) => file.filename) // Tüm yüklenen dosyaları alıyoruz

		const newEstate = new Estate({
			title,
			description,
			price,
			type,
			status,
			location,
			size,
			rooms,
			images, // resimleri dizi olarak ekliyoruz
			selectedImageIndex, // seçilen resmi de ekliyoruz
			removeOldImages,
		})

		await newEstate.save()

		res.status(201).json({
			success: true,
			message: "Emlak başarıyla kaydedildi.",
			data: newEstate,
		})
	} catch (error) {
		console.error("Emlak oluşturulurken hata oluştu:", error)
		res.status(500).json({ success: false, message: "Sunucu hatası!" })
	}
}

export const updateEstate = async (req, res) => {
	const { id } = req.params

	// Geçersiz ID kontrolü
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ success: false, message: "Geçersiz ID!" })
	}

	try {
		// Güncellenecek emlak kaydını bul
		const estate = await Estate.findById(id)
		if (!estate) {
			return res.status(404).json({ success: false, message: "Emlak bulunamadı." })
		}

		// Eğer yeni resimler geldiyse, sadece bunları kaydet
		let updatedImages = []
		if (req.files?.length > 0) {
			if (req.body.removeOldImages == "true") {
				estate.images.forEach((image) => {
					const imagePath = path.resolve(__dirname, "..", "public", "uploads", image)
					if (fs.existsSync(imagePath)) {
						fs.unlinkSync(imagePath)
					}
				})
				updatedImages = req.files?.map((file) => file.filename)
			}
		}

		if (req.files?.length > 0) {
			if (req.body.removeOldImages == "false") {
				updatedImages = [...estate.images, ...req.files?.map((file) => file.filename)]
			}
		}

		// Emlak kaydını güncelle (eğer yeni resim yoksa eski resimleri koru)
		const updatedEstate = await Estate.findByIdAndUpdate(
			id,
			{
				...req.body,
				images: req.files?.length > 0 ? updatedImages : estate.images,
				removeOldImages: false,
			},
			{ new: true, runValidators: true }
		)

		// Eğer yeni resimler eklendiyse, eski resimleri sil
		if (updatedImages.length > 0) {
		}

		// Güncellenen veriyi geri döndür
		res.status(200).json({
			success: true,
			message: "Emlak başarıyla güncellendi.",
			data: updatedEstate,
		})
	} catch (error) {
		console.error("Emlak güncelleme hatası:", error)
		res.status(500).json({
			success: false,
			message: "Sunucu hatası!",
			error: error.message || error,
		})
	}
}

export const deleteEstate = async (req, res) => {
	const { id } = req.params

	// ID'nin geçerli olup olmadığını kontrol et
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			message: "Geçersiz ID!",
		})
	}

	try {
		// Silinecek emlak bilgilerini bul
		const estate = await Estate.findById(id)
		if (!estate) {
			return res.status(404).json({ message: "Emlak bulunamadı!" })
		}

		// Resim dosyalarını kontrol et ve sil
		if (estate.images && estate.images.length > 0) {
			// Her bir resim için yolu oluşturup silme işlemi yap
			estate.images.forEach((image) => {
				const imagePath = path.resolve(__dirname, "..", "public", "uploads", image)

				// Resim dosyasını sil
				if (fs.existsSync(imagePath)) {
					fs.unlinkSync(imagePath)
				}
			})
		}

		// Emlak sil
		await estate.deleteOne()

		res.status(200).json({
			success: true,
			message: "Emlak ve ilgili resimler başarıyla silindi.",
		})
	} catch (error) {
		console.error("Emlak silinirken hata oluştu:", error.message)
		res.status(500).json({
			success: false,
			message: "Sunucu hatası!",
			error: error.message,
		})
	}
}
