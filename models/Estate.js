import mongoose from "mongoose"

const estateSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		},
		rooms: {
			type: String,
			required: true,
		},
		images: {
			type: [String], // Birden fazla dosya adı (resim)
			required: true, // Çoğu zaman tek resim yüklenecekse, bu required olabilir
		},

		removeOldImages: {
			type: Boolean,
		},

		selectedImageIndex: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
)

const Estate = mongoose.model("Estate", estateSchema)
export default Estate
