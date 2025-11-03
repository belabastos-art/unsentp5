// Install and load dependencies
import 'dotenv/config';
import express from 'express';
import { Low } from 'lowdb';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Initialize express app
let app = express();

// Custom Gist Adapter for LowDB (using fetch API)
class GistAdapter {
    constructor(gistId, token, filename) {
        this.gistId = gistId;
        this.token = token;
        this.filename = filename;
    }

    async read() {
        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const gist = await response.json();
            const content = gist.files[this.filename]?.content;
            
            return content ? JSON.parse(content) : null;
        } catch (error) {
            console.error('Error reading from Gist:', error);
            return null;
        }
    }

    async write(data) {
        try {
            await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        [this.filename]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });
        } catch (error) {
            console.error('Error writing to Gist:', error);
        }
    }
}

// Connect to database with custom Gist adapter
let defaultData = { confessionsData: [] };
let adapter = new GistAdapter(
    process.env.GIST_ID,
    process.env.GIST_TOKEN,
    process.env.GIST_FILENAME
);
let db = new Low(adapter, defaultData);

// Initialize/read database
await db.read();
db.data ||= defaultData;
console.log('Database initialized with Gist');
console.log('Current confessions:', db.data.confessionsData.length);

// Serve static files
app.use('/', express.static('public'));

// Parse JSON
app.use(express.json());

// Route for posting new data
app.post('/newData', async (request, response) => {
    console.log('POST /newData:', request.body);
    
    let obj = { msg: request.body.msg };
    db.data.confessionsData.push(obj);
    await db.write();
    
    response.json({ task: "success" });
});

// Route for getting all data
app.get('/getData', async (request, response) => {
    await db.read();
    response.json({ data: db.data.confessionsData });
});

// Initialize HTTP server
let server = createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('Server listening at port:', port);
});

// Initialize socket.io
let io = new Server(server);

io.sockets.on('connection', function (socket) {
    console.log('Client connected:', socket.id);

    socket.on('msg', async function (data) {
        let obj = { msg: data.msg };
        db.data.confessionsData.push(obj);
        await db.write();
        io.sockets.emit('msg', data);
    });

    socket.on('disconnect', function () {
        console.log('Client disconnected:', socket.id);
    });
});