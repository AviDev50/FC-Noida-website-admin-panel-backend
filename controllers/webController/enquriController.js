import db from "../../config/db.js";

// POST Enquiry
export const createEnquiry = (req, res) => {
  const { name, email,phone, subject, message } = req.body;

  if (!name || !email  ||!phone  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const sql =
    "INSERT INTO enquiries (name, email,phone, subject, message) VALUES (?, ?,?, ?,?)";
  db.query(
    sql,
    [name, email, phone, subject, message],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Database error", error: err });
      }

      return res.status(200).json({
        message: "Enquiry Added Successfully",
        result,
        success: true,
      });
    }
  );
};

// GET Enquiries (Dashboard)
export const getEnquiries = (req, res) => {
  const sql = "SELECT * FROM enquiries ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error: " + err.message);
    }

    res.render("enquiries", {
      title: "Enquiries Dashboard",
      enquiries: result,
    });
  });
};


// delete 

export const deleteEnquiries = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM enquiries WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error: " + err.message);
    }

   
    res.redirect("/admin/enquiries");
  });
};




















