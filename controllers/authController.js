import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User.js"

export const register = async (req, res) => {
	const { name, email, password } = req.body

	if (!name || !email || !password) {
		return res.status(400).json({ success: false, message: "Email ve şifre zorunludur." })
	}

	try {
		const userExist = await User.findOne({ email })

		if (userExist) {
			return res.status(409).json({ success: false, message: "Kullanıcı zaten kayıtlı!" })
		}

		const user = new User({ name, email, password })

		await user.save()

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

		res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
}

export const login = async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		return res.status(400).json({ success: false, message: "Email ve şifre zorunludur." })
	}

	try {
		const user = await User.findOne({ email })

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ success: false, message: "Geçersiz email veya şifre" })
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

		res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
}

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password") // Şifreyi döndürme

		if (!user) {
			return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı!" })
		}

		res.json({ success: true, user })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}
