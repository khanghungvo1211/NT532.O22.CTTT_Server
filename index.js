const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { MongoClient } = require('mongodb');

// Connect to MongoDB Atlas cluster
const uri = 'mongodb+srv://khang:khang@project.rp1yjyu.mongodb.net/?retryWrites=true&w=majority&appName=Project';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function saveSensorDataToDB(data) {
    try {
        await client.connect();
        const database = client.db('IOT'); // Replace 'your_database_name' with your database name
        const collection = database.collection('sensor_data');

        // Insert sensor data into MongoDB
        await collection.insertOne(data);
        console.log('Sensor data saved to MongoDB Atlas:', data);
    } catch (error) {
        console.error('Error saving sensor data to MongoDB Atlas:', error);
    } finally {
        await client.close();
    }
}

app.get('/', (req, res) => {
    res.send('Hello World Nodejs....');
});

io.on('connection', client => {
    console.log('New client connected');

    client.on('sensor2Server', async data => {
        console.log('Received sensor data:', data);
        io.emit('server2user', data); // Send data back to clients

        // Save sensor data to MongoDB Atlas
        await saveSensorDataToDB(data);
    });

    client.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = 3484;
server.listen(process.env.PORT || PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
