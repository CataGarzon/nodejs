//1
const express = require("express");
const app = express();
//2
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//3
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});
//4
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
//5
app.set('view engine','ejs');

//6
const bcryptjs = require('bcryptjs');
//7
const session = require('express-session');
app.use(session({
  secret:'secret',
  resave: true,
  saveUninitialized: true  
}));

//8
const connection = require('./database/db');
 //9
const path = require('path')
app.get('*',(request,response)=>{
    response.render(path.resolve(__dirname,'./views/index.ejs'));
  });
  //10
  app.post("/index", async (req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query(
      "INSERT INTO usuarios SET ?",
      {
        user: user,
        name: name,
        pass: passwordHaash,
      },
      async (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.render("index", {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "Exitoso",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: "/",
          });
        }
      }
    );
  });
  //11
  app.post('/auth', async (req, res)=>
{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if (user && pass)
    {
        connection.query('SELECT * FROM usuarios WHERE user = ?', [user], async(error, results,fiels)=>
        {
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) 
            {
                res.send('login',{
                  alert: true,
                  alertTitle:error,
                  alertMessage:"incorrect username or password",
                  alertIcon: "error",
                  showConfirmButton: true,
                  timer:false,
                  ruta:'/'
                });
            }
            else
            {
                
                req.session.name = results[0].name
                res.render("index",{
                  alert:true,
                  alertTitle:"successful connection",
                  alertMessage: "¡Correct log in!",
                  alertIcon: "success",
                  showConfirmButton: false,
                  timer:1500,
                  ruta:'/'
                  
                });
              
            } 
        })
    } else
    {
      res.send("enter a password or user name");
    }
})



 app.listen(3000,(req, res)=>{
    console.log('server running in http://localhost:3000');
 });