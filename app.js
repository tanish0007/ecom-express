const express = require("express");
const app = express();
const PORT = 6565;

app.use(express.json());
app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})