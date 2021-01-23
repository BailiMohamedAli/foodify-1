const users = require("../../models/Users");
const { Router } = require("express");
var bcrypt = require("bcryptjs");

const router = Router();
//////////////////////////////////////////////////////////////
router.post("/login", async (req, res) => {
  const user = req.body;
  console.log(user);
  try {
    users.findOne({ useremail: user.useremail }, (err, doc) => {
      if (!doc) {
        res.json("user_not_found");
      } else {
        bcrypt.compare(user.password, doc.password, function (err, result) {
          if (result !== false) {
            res.status(200).json(doc);
          } else {
            res.status(500).json("wrong infos");
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//////////////////////////////////////////////////////
router.post("/signup", async (req, res) => {
  const user = new users(req.body);
  try {
    const users = await user.save();
    if (!users) throw new Error("Something went wrong saving the users");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//--------------get all users for admin dash--------------------
router.get("/", async (req, res) => {
  try {
    const allusers = await users.find();
    if (!allusers)
      throw new Error("Major Error in the porsecc of all user extration");
    res.status(200).json(allusers);
  } catch {
    res.status(500).json({ message: error.message });
  }
});
//--------------delete user --------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deletedUser = await users.findByIdAndDelete(id);
    if(!deletedUser) throw new Error("user deletion process Err !");
    res.status(200).send(true);
  } catch {
    res.status(500).json({ message: error.message });
  }
})

//--------------exporting router----------------

module.exports = router;
