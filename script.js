const ticketForm = document.getElementById('ticketForm');
const ticketList = document.getElementById('ticketList');
const searchInput = document.getElementById('searchInput');

const API_URL = 'http://127.0.0.1:5000';

async function fetchTickets(filter = '') {
  try {
    const res = await fetch(`${API_URL}/tickets`);
    const tickets = await res.json();

    ticketList.innerHTML = '';

    tickets
      .filter(ticket =>
        ticket.name.toLowerCase().includes(filter.toLowerCase()) ||
        ticket.issue.toLowerCase().includes(filter.toLowerCase())
      )
      .forEach(ticket => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket';
        ticketCard.innerHTML = `
          <h3>${ticket.name} <span class="status ${ticket.status}">${ticket.status}</span></h3>
          <p><strong>Email:</strong> ${ticket.email}</p>
          <p><strong>Issue:</strong> ${ticket.issue}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <button onclick="toggleStatus('${ticket.id}')">Mark as ${ticket.status === 'Open' ? 'Closed' : 'Open'}</button>
        `;
        ticketList.appendChild(ticketCard);
      });
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
  }
}

async function toggleStatus(id) {
  await fetch(`${API_URL}/toggle-status/${id}`, { method: 'POST' });
  fetchTickets(searchInput.value);
}

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTicket = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    issue: document.getElementById('issue').value,
    priority: document.getElementById('priority').value
  };

  await fetch(`${API_URL}/submit-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTicket)
  });

  ticketForm.reset();
  fetchTickets();
});

searchInput.addEventListener('input', () => fetchTickets(searchInput.value));

// 🟢 Initial load
fetchTickets();
