const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const dbConnectionString =
    "mongodb+srv://catalogoapi:cobraqueimada@cluster0.kf6tuaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(dbConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

const app = express();
const port = 3000;

app.use(bodyParser.json());

const filmSchema = new mongoose.Schema({
    title: String,
    description: String,
    genre: String,
    year: Number,
});

const Film = mongoose.model("Film", filmSchema);

// POST /films
app.post("/films", async (req, res) => {
    const { title, description, genre, year } = req.body;
    const newFilm = new Film({ title, description, genre, year });

    try {
        await newFilm.save();
        res.status(201).json(newFilm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /films
app.get("/films", async (req, res) => {
    try {
        const films = await Film.find();
        res.status(200).json(films);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/films/:id", async (req, res) => {
    try {
        const film = await Film.findById(req.params.id);
        if (film) {
            res.status(200).json(film);
        } else {
            res.status(404).json({ message: "Film not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Film catalog service running on port ${port}`);
});

