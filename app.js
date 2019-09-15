const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));

// be able to get data sent from Html
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://awfurmoli:3nj3gdUYWxrsBrK@cluster0-xqq4s.mongodb.net/todolistD"
);
//mongodb+srv://awfurmoli:<password>@cluster0-xqq4s.mongodb.net/test?retryWrites=true&w=majority

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item!"
});
const item3 = new Item({
  name: "Hit this to delete and item"
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log("There is an error");
        } else {
          console.log("insert succesffulll");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItem: foundItems });
    }
  });
});

app.post("/", (req, res) => {
  var itemName = req.body.newItem;
  var listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "work", newItem: workItems });
});

app.post("/delete", (req, res) => {
  checkedItemId = req.body.checkBox;
  listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, err => {
      if (err) {
        console.log("Item not removed");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { item: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

const listSchema = {
  name: String,
  item: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, result) => {
    if (!err) {
      if (result) {
        res.render("list", { listTitle: result.name, newItem: result.item });
      } else {
        //create new title
        const list = new List({
          name: customListName,
          item: defaultItems
        });
        list.save().then(() => {
          res.redirect("/" + customListName);
        });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("The Surver has succesfully Started");
});

//0c2fd9328ba74735c209f9cc71c64f36-us4
