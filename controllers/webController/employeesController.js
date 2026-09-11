import db from "../../config/db.js";

// POST create new employee
export const createProfile = (req, res) => {
  const { name, profile } = req.body;

  if (!name || !profile || !req.file) {
    return res.status(400).json({
      success: false,
      message: "Name, profile and image are required"
    });
  }

  const image = req.file.filename;
	
	  //const imageUrl = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename}`;

  const sql = "INSERT INTO employees (name, image, profile) VALUES (?, ?, ?)";
  db.query(sql, [name, image, profile], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }

    // return res.status(201).json({
    //     message:"data added sucessfully",
    //     success:true
    // })
  
    res.redirect("/admin/employees");
  });
};

// GET all employees
export const getEmployees = (req, res) => {
  const sql = "SELECT * FROM employees ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Pass employees array to EJS
    res.render("employees", { employees: result });
  });
};



//delete 

export const deleteEmployee = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM employees WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Blog not found!",
      });
    }

    // return res.status(200).json({
    //   message: "Emloyees deleted successfully",

    // });

     res.redirect("/admin/employees");
    
  });
};


//show add employee form

export const showAddEmployeeForm = (req, res) => {
res.render("addEmployee"), {
    title: "Add Employee"
  };
};