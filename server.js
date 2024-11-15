require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit();
const API_TOKEN = process.env.API_TOKEN;


// Middleware để phân tích dữ liệu JSON
app.use(express.json());

// Xác thực token API
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || token !== `${API_TOKEN}`) {
        return res.sendStatus(403); // Forbidden
    }
    next();
};

// FirstDB
app.get('/', authenticateToken, (req, res) => {
    let data = fs.readFileSync('database.json', 'utf8');
    data = JSON.parse(data)
    return res.json(data);
});
app.get('/FirstDB', authenticateToken, (req, res) => {
    let data = fs.readFileSync('database.json', 'utf8');
    data = JSON.parse(data)
    return res.json(data["FirstDB"]);
});
app.get('/FirstDB/chat', authenticateToken, (req, res) => {
    let data = fs.readFileSync('database.json', 'utf8');
    data = JSON.parse(data)
    return res.json(data["FirstDB"]["Chats"]);
});
app.get('/FirstDB/user', authenticateToken, (req, res) => {
    let data = fs.readFileSync('database.json', 'utf8');
    data = JSON.parse(data)
    return res.json(data["FirstDB"]["Users"]);
});
app.post('/FirstDB/chat', authenticateToken, (req, res) => {
    // Đọc dữ liệu từ file JSON
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi khi đọc dữ liệu' });
        }
        let newData = [];
        if (data) {
            newData = JSON.parse(data);
        }
        const today = new Date();
        const newChat = req.body;
        newChat.id = newData["FirstDB"]["Chats"].length+1;
        newChat.time = today.getDate()+'/'+today.getMonth()+'/'+today.getFullYear();
        newData["FirstDB"]["Chats"].push(newChat);
        fs.writeFile('database.json', JSON.stringify(newData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Lỗi khi ghi dữ liệu' });
            }  
        });
        res.json(newData);
    });
    postGit();
});
app.post('/FirstDB/user', authenticateToken, (req, res) => {
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi khi đọc dữ liệu' });
        }
        let newData = [];
        if (data) {
            newData = JSON.parse(data);
        }
        const today = new Date();
        const newUser = req.body;
        newUser.id = newData["FirstDB"]["Users"].length+1;
        newUser.time = today.getDate()+'/'+today.getMonth()+'/'+today.getFullYear();
        newData["FirstDB"]["Users"].push(newUser);
        fs.writeFile('database.json', JSON.stringify(newData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Lỗi khi ghi dữ liệu' });
            }
        });
        res.json(newUser);
    });
    postGit();
});

async function postGit() {
    try {
        const status = await git.status();
        console.log(status);
        await git.addConfig('user.email', process.env.GIT_AUTHOR_EMAIL);
        await git.addConfig('user.name', process.env.GIT_AUTHOR_NAME);
        await git.add('./database.json');
        await git.commit('Cập nhật dữ liệu JSON');
        await git.push(`https://${process.env.GITHUB_TOKEN}@github.com/nduong11/API_DB.git`, 'master');
        console.log('Đã cập nhật và push dữ liệu lên GitHub!');
    } catch (err) {
        console.error('Lỗi khi push lên GitHub:', err);
    }
}







// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại PORT: ${PORT}`);
});
