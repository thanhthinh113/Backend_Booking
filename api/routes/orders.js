const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order"); // Order model with "home" field
const Home = require("../models/home"); // Assuming the Home model exists

// GET all orders
router.get("/", (req, res, next) => {
  Order.find()
    .select("home quantity _id")
    .populate("home") // Populate the "home" field
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            home: doc.home,
            quantity: doc.quantity,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// POST a new order
router.post("/", (req, res, next) => {
  Home.findById(req.body.homeId)
    .then((home) => {
      if (!home) {
        return res.status(404).json({
          message: "Home not found",
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        home: req.body.homeId, // Reference to the "Home" model
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          home: result.home,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.put("/:orderId", (req, res, next) => {
  const orderId = req.params.orderId;
  const { quantity } = req.body; // Assuming you are updating the quantity field

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Update the order's quantity
      order.quantity = quantity;

      return order.save(); // Save the updated order
    })
    .then((updatedOrder) => {
      res.status(200).json({
        message: "Order updated",
        updatedOrder: {
          _id: updatedOrder._id,
          home: updatedOrder.home,
          quantity: updatedOrder.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + updatedOrder._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// GET a specific order by ID
router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("home") // Populate the "home" field
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/",
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// DELETE an order by ID
router.delete("/:orderId", (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders",
          body: { homeId: "ID", quantity: "Number" },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
