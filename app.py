from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid

app = Flask(__name__)
CORS(app)

# 🔹 Create the database and table if not exist
def init_db():
    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            issue TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# 🔸 Get all tickets
@app.route('/tickets', methods=['GET'])
def get_tickets():
    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tickets')
    rows = cursor.fetchall()
    conn.close()
    
    tickets = [
        {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'issue': row[3],
            'priority': row[4],
            'status': row[5]
        }
        for row in rows
    ]
    return jsonify(tickets)

# 🔸 Submit a new ticket
@app.route('/submit-ticket', methods=['POST'])
def submit_ticket():
    data = request.get_json()
    ticket_id = str(uuid.uuid4())
    name = data['name']
    email = data['email']
    issue = data['issue']
    priority = data['priority']
    status = 'Open'

    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tickets (id, name, email, issue, priority, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (ticket_id, name, email, issue, priority, status))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Ticket submitted!'}), 201

# 🔸 Toggle ticket status (Open <-> Closed)
@app.route('/toggle-status/<ticket_id>', methods=['POST'])
def toggle_status(ticket_id):
    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT status FROM tickets WHERE id = ?', (ticket_id,))
    current = cursor.fetchone()
    
    if current:
        new_status = 'Closed' if current[0] == 'Open' else 'Open'
        cursor.execute('UPDATE tickets SET status = ? WHERE id = ?', (new_status, ticket_id))
        conn.commit()
    
    conn.close()
    return jsonify({'message': 'Status updated'}), 200

# 🔸 Main runner
if __name__ == '__main__':
    app.run(debug=True)
