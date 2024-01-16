const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body

//routes//

// Create a homicide entry
app.post("/homicides", async (req, res) => {
    try {
      const { victim_name, newspaper_article, date, location } = req.body;
      const newHomicide = await pool.query(
        "INSERT INTO homicide (victim_name, newspaper_article, date, location) VALUES ($1, $2, $3, $4) RETURNING *",
        [victim_name, newspaper_article, date, location]
      );
  
      res.json(newHomicide.rows[0]);
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // Retrieve all homicide entries
  app.get("/homicides", async (req, res) => {
    try {
      const allHomicides = await pool.query("SELECT * FROM homicide");
      res.json(allHomicides.rows);
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // Update a homicide entry
  app.put("/homicides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { victim_name, newspaper_article, date, location } = req.body;
      const updateHomicide = await pool.query(
        "UPDATE homicide SET victim_name = $1, newspaper_article = $2, date = $3, location = $4 WHERE homicide_id = $5",
        [victim_name, newspaper_article, date, location, id]
      );
      res.json("Homicide entry was updated!");
    } catch (err) {
      console.error(err.message);
    }
  });
  
  // Delete a homicide entry
  app.delete("/homicides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleteHomicide = await pool.query(
        "DELETE FROM homicide WHERE homicide_id = $1",
        [id]
      );
      res.json("Homicide entry was deleted!");
    } catch (err) {
      console.error(err.message);
    }
  });
  

// //create a todo
// app.post("/todos", async(req,res) => {
// try{
//     const {description} = req.body;
//     const newTodo = await pool.query("INSERT INTO todo (description) VALUES ($1) RETURNING *", [description]); //nb  this is how you insert info into the table , column (dscription) and the value ($1) which is the placeholder, specified in second argument description 

//     res.json(newTodo.rows[0]);
// } catch (err) {
//    console.error(err.message); 
// }

// })
// //get all todo
// app.get("/todos", async(req,res) => {
//     try{
//         const allTodos = await pool.query("SELECT * FROM todo");
//    res.json(allTodos.rows);
//     } catch (err) {
//        console.error(err.message); 
//     }
    
//     })

// //get a todo
// app.get("/todos/:id", async(req,res) => { //allows random id for get request eg http://localhost:5000/todos/1
//     try{
//      const {id} = req.params;
//      const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1",[id]);
//      res.json(todo.rows[0]);
//     } catch (err) {
//        console.error(err.message); 
//     }
    
//     })
// //update a todo
// app.put("/todos/:id", async(req,res) => {
//     try {
//         const {id} = req.params;
//         const {description} = req.body;
//         const updateTodo = await pool.query("UPDATE todo SET description = $1 WHERE todo_id = $2",[description,id]);
//         res.json("todo was updated!");
//     } catch (err) {
//         console.error(err.message);
//     }
// })

// //delete a todo
// app.delete("/todos/:id", async(req,res) => {
//     try {
//         const {id} = req.params;
//         const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id =$1",[id]);
//         res.json("Todo was deleted!!");
//     } catch (err) {
//         console.log(err.message);        
//     }
// })

app.listen(5000, () => {
    console.log("server has started on port 5000");
})