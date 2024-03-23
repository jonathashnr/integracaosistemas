const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");

const dbConnectionString =
    "mongodb+srv://catalogoapi:cobraqueimada@cluster0.kf6tuaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(dbConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected for Reviews Service"))
    .catch((err) => console.log(err));

const app = express();
const port = 3001;

app.use(bodyParser.json());

const reviewSchema = new mongoose.Schema({
    filmId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
});

const Review = mongoose.model("Review", reviewSchema);

// POST /reviews
app.post("/reviews", async (req, res) => {
    const { filmId, rating, comment } = req.body;

    try {
        // Verifica se o filme existe no serviço de catálogo
        const filmResponse = await axios.get(
            `http://localhost:3000/films/${filmId}`
        );
        if (filmResponse.status !== 200) {
            return res.status(404).json({ message: "Film not found" });
        }

        const newReview = new Review({ filmId, rating, comment });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: "Film not found" });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// GET /reviews/film/:filmId
app.get("/reviews/film/:filmId", async (req, res) => {
    try {
        const reviews = await Review.find({ filmId: req.params.filmId });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /reviews/average/:filmId
app.get("/reviews/average/:filmId", async (req, res) => {
    try {
        const reviews = await Review.find({ filmId: req.params.filmId });
        const averageRating =
            reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length;
        res.status(200).json({ averageRating: averageRating || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Review service running on port ${port}`);
});
