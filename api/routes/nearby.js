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

// Nearby schema and model
const Nearby = require("../models/nearby");

router.get("/", (req, res, next) => {
  Nearby.find()
    .select("name title _id nearbyImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        nearby: docs.map((doc) => ({
          name: doc.name,
          title: doc.title,
          nearbyImage: doc.nearbyImage,
          _id: doc._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/nearby/" + doc._id,
          },
        })),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/", upload.single("nearbyImage"), (req, res, next) => {
  const nearby = new Nearby({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    title: req.body.title,
    nearbyImage: req.file.path,
  });
  nearby
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created nearby successfully",
        createdNearby: {
          name: result.name,
          title: result.title,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/nearby/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:nearbyId", (req, res, next) => {
  const id = req.params.nearbyId;
  Nearby.findById(id)
    .select("name title _id nearbyImage")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          nearby: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/nearby",
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

router.patch("/:nearbyId", (req, res, next) => {
  const id = req.params.nearbyId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Nearby.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Nearby updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/nearby/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:nearbyId", (req, res, next) => {
  const id = req.params.nearbyId;
  Nearby.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Nearby deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/nearby",
          body: { name: "String", title: "String" },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
