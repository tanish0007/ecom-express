const { readJSON, writeJSON } = require("../utils/fileUtils");

async function signup( req, res ) {
    try{
        const { username, email, password , isAdmin } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                "success": false,
                "error": "Required fields are missing"
            });
        }

        const users = await readJSON('users.json');
        const userExists = users.find(user => user.email == email);

        if(userExists){
            return res.status(409).json({
                "success": false,
                "error": "User already exists with this email"
            })
        }

        const newUser = { id: Date.now(), username, email, password, isAdmin };
        users.push(newUser);

        await writeJSON('users.json', users);
        return res.status(201).json({
            "success": true,
            "message": "User registered successfully.\nYou're redirecting to login page..",
            "user": newUser
        })
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({
            "success" : false,
            "error" : "Internal server error" 
        });
    }
}

async function login( req, res ) {
    try{
        const { email, password } = req.body;
        if( !email || !password ){
            return res.status(400).json({
                "success": false,
                "error": "Required fields are missing"
            });
        }

        const users = await readJSON('users.json');
        const userExists = users.find(user => user.email === email && user.password === password);

        if(!userExists){
            return res.status(401).json({
                "success" : false,
                "error" : "Invalid email or password"
            })
        }

        return res.status(200).json({
            "success": true,
            "message": `Logging in ${userExists.username}'s account..`,
            "user": userExists
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            "success" : false,
            "user": "Internal server error"
        })
    }
}

module.exports = { signup, login };