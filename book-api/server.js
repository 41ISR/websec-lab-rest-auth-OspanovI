require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./src/db");

const authRoutes = require("./src/routes/authRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
app.get("/", (req, res) => {
  res.json({
    message: "Book API работает. Доступные эндпоинты начинаются с /api/...",
    docs: "Используйте Bruno/Postman для тестирования",
  });
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Маршрут не найден" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
