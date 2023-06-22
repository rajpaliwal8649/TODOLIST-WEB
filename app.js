const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _= require("lodash");
const app=express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Raj077:RAJ123@cluster0.et9vd1o.mongodb.net/todolistDB");
const itemsSchema={
  name:String,
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your todolist.",
});

const item2=new Item({
  name:"Hit the + button to add a new item.",
});

const item3=new Item({
     name:"<--Hit this to delete an item.",
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
/*Item.insertMany(defaultItems).then(function(error){
  console.log("successfully saved default items to DB.");
  
});*/

  


//let items=["Buy Food","Cook Food","Eat Food"];
//let workitems=[];

app.set('view engine', 'ejs');
app.get("/",function(req,res){


    Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function(err){
        console.log("successfully saved default items to DB.");
    
        });
      res.redirect("/");
    }
    else{
    res.render("list",{listTitle:"Today",newListitem:foundItems});
    }
  });
});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  /*const list=new List({
    name:customListName,
    items:defaultItems
  });*/

  List.findOne({name:customListName}).then(function(foundList){
   if(!foundList){
      //console.log("Doesnt exist");
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
   }
   else{
    //console.log("Exists");
    res.render("list",{listTitle:foundList.name,newListitem:foundList.items});
   }
  });

  

});



app.post("/",function(req,res){
//letitems=req.body.newitem;
const itemName=req.body.newitem;
const ListName=req.body.list;
const item=new Item({
  name:itemName
});
if(ListName=== "Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: ListName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ ListName);
  });
}


/*if(req.body.list==="Work"){
  workitems.push(items);
  res.redirect("/work");
}else{
items.push(items);
res.redirect("/");
}*/
});
app.post("/delete",function(req,res){
  //console.log(req.body.checkbox);
  const checkeditemId=req.body.checkbox;
  const ListName=req.body.ListName;
  if(ListName==="Today"){
  Item.findByIdAndRemove(checkeditemId).then(function(error){

       console.log("successfully deleted the checked item.");
       res.redirect("/");
     
  });
}
else{
   List.findOneAndUpdate({name:ListName},{$pull: {items:{_id: checkeditemId}}}).then(function(error,foundList){
      res.redirect("/"+ ListName);
   });

}
});

app.get("/work",function(req,res){
  res.render("list",{listTitle: "Work list",newitem:workitems});
});
app.post("/work",function(req,res){
  let items=req.body.newitem;
  workitems.push(items);
  res.redirect("/work");
});

app.listen(3000,function(){
    console.log("Server is running on port 3000");
});
