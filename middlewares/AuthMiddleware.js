import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
	const token = req.header("Authorization")?.replace("Bearer ", "")
	if (!token) {
		return res.status(401).json({ error: "Yetkilendirme reddedildi!" })
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (err) {
		res.status(400).json({ error: "Geçersiz token!" })
	}
}
