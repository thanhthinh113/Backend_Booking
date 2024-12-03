const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

const Home = require("../models/home");

// Get all homes
router.get("/", (req, res, next) => {
  Home.find()
    .select("name price title address author homeImage _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        homes: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            title: doc.title,
            address: doc.address,
            author: doc.author,
            homeImage: doc.homeImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/home/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Create a new home
router.post("/", upload.single("homeImage"), (req, res, next) => {
  const home = new Home({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    title: req.body.title,
    address: req.body.address,
    author: req.body.author,
    homeImage: req.file.path,
  });

  home
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Created home successfully",
        createdHome: {
          name: result.name,
          price: result.price,
          title: result.title,
          address: result.address,
          author: result.author,
          homeImage: result.homeImage,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/home/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Get a single home by ID
router.get("/:homeId", (req, res, next) => {
  const id = req.params.homeId;
  Home.findById(id)
    .select("name price title address author homeImage _id")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          home: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/home",
          },
        });
      } else {
        res.status(404).json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Update a home by ID
router.patch("/:homeId", (req, res, next) => {
  const id = req.params.homeId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Home.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Home updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/home/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Delete a home by ID
router.delete("/:homeId", (req, res, next) => {
  const id = req.params.homeId;
  Home.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Home deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/home",
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
