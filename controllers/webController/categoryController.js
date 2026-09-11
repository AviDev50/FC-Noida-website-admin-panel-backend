import db from "../../config/db.js";

// create

export const createCategory = (req, res) => {
  const { category_name } = req.body;
  const sql = "INSERT INTO blog_category (category_name) VALUES (?)";
  db.query(sql, [category_name], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect("/admin/category");
  });
};

// delete

export const deleteCategory = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM blog_category WHERE category_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.redirect("/admin/category");
  });
};

//  get category   by id

export const getCategoryById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM blog_category WHERE category_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send("Database Error: " + err.message);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category fetched successfully",
      result: result[0],
    });
  });
};

// update query

// export const updateCategory = (req, res) => {
//   const { category_name } = req.body;
//   const { id } = req.params;

//   if (!id || !category_name) {
//     return res.status(400).json({
//       message: "Category ID and Category Name are required",
//     });
//   }

//   const sql =
//     "UPDATE blog_category SET category_name = ? WHERE category_id = ?";

//   db.query(sql, [category_name, id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         message: "Category not found",
//       });
//     }

//     // ✅ EJS admin panel ke liye redirect best
//     return res.redirect("/admin/category");
//   });
// };


// if id  give then give particular data otherwise show all record

// export const optionalCategory = (req, res) => {
//   const { id } = req.query;
//   let sql = "SELECT * FROM blog_category";
//   let values = [];

//   if (id) {
//     sql += " WHERE category_id = ?";
//     values.push(id);
//   }

//   db.query(sql, values, (err, result) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Database error",
//         error: err.message,
//       });
//     }

//     res.status(200).json({
//       message: "Category fetched successfully",
//       result,
//     });
//   });
// };

// show categoryForm
export const showAddCategoryForm = (req, res) => {
  res.render("category_add", {
    title: "Add New Category",
  });
};

// show category

export const getCategoryList = (req, res) => {
  const sql = "SELECT * FROM blog_category";

  db.query(sql, (err, category) => {
    if (err) {
      return res.status(500).send("Database Error: " + err.message);
    }

    res.render("category", {
      title: "Category List",
      category,
    });
  });
};
