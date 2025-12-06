export default function handler(req, res) {
  res.status(200).json({ 
    success: true,
    message: "後端活了！",
    time: new Date().toISOString()
  })
}
