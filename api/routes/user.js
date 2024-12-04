const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "mail exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch();
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        console.log("User not found");
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          console.log("Error comparing passwords");
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          console.log("Auth successful, token generated");
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        console.log("Password mismatch");
        return res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log("Error:", err);
      res.status(500).json({
        error: err,
      });
    });
});


router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .select("email _id")
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json({
          user: user,
          request: {
            type: "GET",
            url: "http://localhost:3000/user"
          }
        });
      } else {
        res.status(404).json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


router.get("/", (req, res, next) => {
  User.find()
    .select("email _id") // Chỉ chọn các trường cần thiết
    .exec()
    .then(users => {
      const response = {
        count: users.length,
        users: users.map(user => {
          return {
            _id: user._id,
            email: user.email,
            request: {
              type: "GET",
              url: "http://localhost:3000/user/" + user._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:email/detail", (req, res, next) => {
  const email = req.params.email;  // Get email from URL parameters
  User.findOne({ email: email })   // Find user by email
    .select("email name phone address _id createdAt") // Choose the fields to return
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json({
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            createdAt: user.createdAt,
          },
          request: {
            type: "GET",
            url: "http://localhost:3000/user"
          }
        });
      } else {
        res.status(404).json({ message: "No valid entry found for provided email" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


router.put("/:email", (req, res, next) => {
  const email = req.params.email; // Get email from the URL parameter
  const updateOps = {};

  // Loop through the incoming data and prepare the update object
  for (const [key, value] of Object.entries(req.body)) {
    updateOps[key] = value; // Map the fields to update
  }

  // Use the email to find and update the user
  User.findOneAndUpdate({ email: email }, { $set: updateOps }, { new: true })
    .exec()
    .then(result => {
      if (result) {
        res.status(200).json({
          message: "User updated successfully",
          user: result, // Return the updated user data
          request: {
            type: "GET",
            url: `http://localhost:3000/user/${email}`
          }
        });
      } else {
        res.status(404).json({
          message: "No user found with the provided email"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});



module.exports = router;
