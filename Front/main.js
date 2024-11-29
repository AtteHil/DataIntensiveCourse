

const mongo = document.getElementById("mongoDB");
const postgre = document.getElementById("postgreDB");
const makeList = (data) => {
    const list = document.getElementById('data-list');
    list.textContent = '';
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = JSON.stringify(item);
        list.appendChild(listItem);
    });
}
const PostgreFetch = () => {
    fetch('http://localhost:3000/postgre/fetch')
        .then(response => response.json())
        .then(data => {
            makeList(data)
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

const mongoFetch = () => {
    fetch('http://localhost:3000/mongo/fetch')
        .then(response => response.json())
        .then(data => {
            makeList(data)

        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
const joinFetch = () => {
    fetch('http://localhost:3000/join/fetch')
        .then(response => response.json())
        .then(data => {
            makeList(data)
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

async function mongoUpdate(data) {

    try {
        const response = await fetch(`http://localhost:3000/mongo/employee`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Employee updated or created:', result);
    } catch (err) {
        console.error('Failed to update or create employee:', err);
    }
}
async function postgreUpdate(data) {

    try {
        const response = await fetch(`http://localhost:3000/postgre/employee`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Employee updated or created:', result);
    } catch (err) {
        console.error('Failed to update or create employee:', err);
    }
}

const printData = () => {
    console.log(mongo.checked, postgre.checked);

    if (mongo.checked && postgre.checked) {
        joinFetch()
    }
    else if (mongo.checked) {
        mongoFetch()
    }
    else if (postgre.checked) {
        PostgreFetch()
    }
    else {
        alert("Choose database")
    }
}
const update = (event) => {
    event.preventDefault()
    const name = document.getElementById("name").value;
    const position = document.getElementById("position").value;
    const salary = document.getElementById("salary").value;
    console.log(salary)
    if (!name || !position || !salary) {
        return alert("Invalid information")
    }
    if (mongo.checked && postgre.checked) {
        alert("You can only update or make new employee do either one of the databases (no duplicates are allowed)")
    }
    else if (mongo.checked) {
        mongoUpdate({ name: name, position: position, salary: salary })
    }
    else if (postgre.checked) {
        postgreUpdate({ name: name, position: position, salary: salary })
    }
    else {
        alert("Choose database")
    }
}

async function deleteMongo(employeeName) {

    try {
        const response = await fetch(`http://localhost:3000/mongo/employee/${employeeName}`, {
            method: 'DELETE',

        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Employee deleted:', result);
    } catch (err) {
        alert("User not found")
        console.error('Failed to delete employee:', err);
    }
}
async function deletePostgre(employeeName) {

    try {
        const response = await fetch(`http://localhost:3000/postgre/employee/${employeeName}`, {
            method: 'DELETE',

        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Employee deleted:', result);
    } catch (err) {
        alert("User not found")
        console.error('Failed to delete employee:', err);
    }
}

const deleteEmployee = () => {
    const employeeName = document.getElementById("delete").value
    if (!employeeName) {
        return alert("you have to input name")
    }
    if (mongo.checked && postgre.checked) {
        alert("You can only delete employee to either one of the databases (no duplicates are allowed)")
    }
    else if (mongo.checked) {
        deleteMongo(employeeName)
    }
    else if (postgre.checked) {
        deletePostgre(employeeName)
    }
    else {
        alert("Choose database")
    }
}


