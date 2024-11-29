const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const mongoose = require('mongoose');

const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json()); // Parse JSON data from requests

// PostgreSQL config
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'admin',
    port: 5432,
});

//mongo config

mongoose.connect('mongodb://localhost:27017/employee');
const employeeSchema = new mongoose.Schema({
    name: String,
    position: String,
    salary: Number
});
const Mongoemployee = mongoose.model('Employee', employeeSchema);

// Test route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Get postgre data
app.get('/postgre/fetch', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employee');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});



// postgre get employees
app.put('/postgre/employee', async (req, res) => {
    const { name, position, salary } = req.body;
    console.log(salary)

    try {
        // Check if an employee with the given name exists
        const checkEmployee = await pool.query('SELECT * FROM employee WHERE name = $1', [name]);

        if (checkEmployee.rows.length > 0) {

            const updateEmployee = await pool.query(
                'UPDATE employee SET position = $2, salary = $3 WHERE name = $1 RETURNING *',
                [name, position, salary]
            );
            res.json(updateEmployee.rows[0]);
        } else {
            // else make new employee 
            const newEmployee = await pool.query(
                'INSERT INTO employee (name, position, salary) VALUES ($1, $2, $3) RETURNING *',
                [name, position, salary]
            );
            res.json(newEmployee.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process employee data' });
    }
});
//postgre delete
app.delete('/postgre/employee/:name', async (req, res) => {
    const name = req.params.name;
    console.log(name)
    try {
        await pool.query('DELETE FROM employee WHERE name ILIKE $1', [name]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

//mongo get employees
app.get('/mongo/fetch', async (req, res) => {
    const users = await Mongoemployee.find();
    res.json(users);
});

//mongo update oo if employee does not exist make new (upsert does that)
app.put('/mongo/employee', async (req, res) => {
    const { name, position, salary } = req.body;

    try {
        const employee = await Mongoemployee.findOneAndUpdate(
            { name },
            { name, position, salary },
            { new: true, upsert: true }
        );
        employee.save()

        res.json({ msg: "User updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update or create employee' });
    }
});

// mongo delete
app.delete('/mongo/employee/:name', async (req, res) => {
    const employeeName = req.params.name;
    try {
        const result = await Mongoemployee.deleteOne({ name: employeeName });
        if (result.deletedCount > 0) { // check if user found
            res.json({ message: 'Employee deleted successfully' });
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});
// join printing
app.get('/join/fetch', async (req, res) => {
    try {
        // Fetch data from PostgreSQL
        const pgData = await pool.query('SELECT id, name, position, salary FROM employee');
        const pgEmployees = pgData.rows.map(emp => ({
            source: 'PostgreSQL',
            ...emp
        }));

        // Fetch data from MongoDB
        const mongoData = await Mongoemployee.find({}, { _id: 0, __v: 0 }); // Exclude internal MongoDB fields
        const Mongoemployees = mongoData.map(emp => ({
            source: 'MongoDB',
            ...emp._doc
        }));


        const combinedData = [...pgEmployees, ...Mongoemployees];

        // sort based on salary
        const under4000 = combinedData.filter(emp => emp.salary <= 4000);
        const over4000 = combinedData.filter(emp => emp.salary > 4000);

        //returnable list
        const resultList = [
            { under: 'People making under 4000' },
            ...under4000,
            { over: 'Employees Earning Over 4000' },
            ...over4000
        ];

        res.json(resultList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch and organize data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

