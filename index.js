const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");

const app = express();
const PORT = 8000;

//Middleware - Plugin
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    fs.appendFile("log.txt", `${Date.now()}:${req.ip} ${req.method}: ${req.path}\n`, (err,data) => {
        next();
    } );
});

//routes
app.get("/users", (req, res) => {
    const html = `
    <ul> 
        ${users.map((user) => `<li> ${user.first_name}</li>`).join("")} 
    </ul>
    `;
    res.send(html);
})

// REST API
app.get("/api/users", (req,res) => {
    res.setHeader("X-MyName", "Saumya Patel"); // Custom Header
    // Always add X to custom headers
    return res.json(users);
});

app.route('/api/users/:id')
.get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if(!user) return res.status(404).json({error: "User not found"});
    return res.json(user);
})
.patch((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    Object.assign(user, req.body);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.json({ status : "success", user:user});
    });
})
.delete((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id === id);
    users.splice(index, 1);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.json({ status : "success"});
    });
});

app.post("/api/users", (req, res) => {
    const body = req.body;
    if(!body || !body.first_name || !body.last_name || !body.gender || !body.email || !body.job_title) {
        return res.status(400).json({ msg : "All fields are required"});
    }
    users.push({id: users.length + 1, ...body});
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.status(201).json({ status : "success", id: users.length});
    });
});


app.listen(PORT, () => console.log(`Server Started at PORT : ${PORT}`))