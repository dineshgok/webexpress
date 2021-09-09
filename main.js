var express = require("express");
var app = express();
const { MongoClient,ObjectId } = require('mongodb');
var url = "mongodb://localhost:27017/";
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
app.use(session({secret: "Shh, its a secret!"}));

app.set('view engine', 'pug');
app.set('views','./views');

app.get("/",function(req,res){
    res.sendFile(__dirname+"/home.html")
})
app.get("/aboutus",function(req,res){
    res.sendFile(__dirname+"/aboutus.html")
})

app.get("/signupform",function(req,res){
    res.sendFile(__dirname+"/userregistrationform.html")
})
app.post("/register",function(req,res){
    console.log("req fields",req.body)
    if(req.body.pwd!==req.body.cpwd){
        res.sendFile(__dirname+"/CofirmpasswordErrorRegistrationform.html")
    }
    else{
        MongoClient.connect(url,function(err,conn){
            var db = conn.db("merit");
            db.collection("users").find({username:req.body.username})
            .toArray(function(err,data){
                if(data.length===0){
                    db.collection('users').insertOne(req.body,function(err,data){
                        res.send(data)
                    })                    
                }
                else{
                    res.sendFile(__dirname+"/usernameexistform.html");                    
                }
            })
        })
    }
})
app.get("/loginform",function(req,res){
    res.sendFile(__dirname+"/login.html")
})
app.post("/login",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db = conn.db("merit");
        db.collection("users").find({username:req.body.username})
        .toArray(function(err,data){
            if(data.length===0){
                res.sendFile(__dirname+"/loginwithusernamenotfoundpage.html")               
            }
            else{
                if(data[0].pwd===req.body.pwd){
                    req.session.username=req.body.username
                    req.session.pwd=req.body.pwd;
                    res.send("login successful")
                }  
                else{
                    res.send("Incorrect password or username")
                }          
            }
        })
    })
})

function authenticate(req,res,next){
    if(req.session.username){
        MongoClient.connect(url,function(err,conn){
            var db=conn.db("merit")
            db.collection("users").find({username:req.session.username})
            .toArray(function(err,data){
                console.log(data)
                if(data.length===0){
                    res.send("please register first");
                }
                else{
                    if(data[0].pwd===req.session.pwd){
                        next();
                     }
                     else{
                         res.redirect("/login.html")
                     }
                }
            })
        })
    }
    else{
        res.redirect("/loginform")
    }
}


app.get("/products",authenticate,function(req,res){
    res.render("products",{
        user:req.session
    })

})
app.get("/services",authenticate,function(req,res){
    res.render("services")
})

app.listen(9090,function(){console.log("App running on 9090")})
















