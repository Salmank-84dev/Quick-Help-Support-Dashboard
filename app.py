from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔹 Initialize database
def init_db():
    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            issue TEXT NOT NULL,
            category TEXT,
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
    cursor.execute('SELECT id, name, email, issue, category, priority, status FROM tickets')
    rows = cursor.fetchall()
    conn.close()

    tickets = []
    for row in rows:
        if len(row) == 7:
            tickets.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'issue': row[3],
                'category': row[4],
                'priority': row[5],
                'status': row[6]
            })
    return jsonify(tickets)

# 🔸 Submit new ticket
@app.route('/submit-ticket', methods=['POST'])
def submit_ticket():
    data = request.get_json()
    ticket_id = str(uuid.uuid4())
    name = data['name']
    email = data['email']
    issue = data['issue']
    category = data.get('category', '')
    priority = data['priority']
    status = 'Open'

    conn = sqlite3.connect('tickets.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tickets (id, name, email, issue, category, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (ticket_id, name, email, issue, category, priority, status))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Ticket submitted!'}), 201

# 🔸 Toggle status
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

# 🔸 Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

def serve_html():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

# 🔸 Run app
if __name__ == '__main__':
    app.run(debug=True)
