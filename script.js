const ticketForm = document.getElementById('ticketForm');
const ticketList = document.getElementById('ticketList');
const searchInput = document.getElementById('searchInput');

let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

function renderTickets(filter = '') {
  ticketList.innerHTML = '';
  tickets
    .filter(ticket => ticket.name.toLowerCase().includes(filter.toLowerCase()) || ticket.issue.toLowerCase().includes(filter.toLowerCase()))
    .forEach((ticket, index) => {
      const ticketCard = document.createElement('div');
      ticketCard.className = 'ticket';
      ticketCard.innerHTML = `
        <h3>${ticket.name} <span class="status ${ticket.status}">${ticket.status}</span></h3>
        <p><strong>Email:</strong> ${ticket.email}</p>
        <p><strong>Issue:</strong> ${ticket.issue}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <button onclick="toggleStatus(${index})">Mark as ${ticket.status === 'Open' ? 'Closed' : 'Open'}</button>
      `;
      ticketList.appendChild(ticketCard);
    });
}

function toggleStatus(index) {
  tickets[index].status = tickets[index].status === 'Open' ? 'Closed' : 'Open';
  localStorage.setItem('tickets', JSON.stringify(tickets));
  renderTickets(searchInput.value);
}

ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newTicket = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    issue: document.getElementById('issue').value,
    priority: document.getElementById('priority').value,
    status: 'Open'
  };
  tickets.push(newTicket);
  localStorage.setItem('tickets', JSON.stringify(tickets));
  ticketForm.reset();
  renderTickets();
});

searchInput.addEventListener('input', () => renderTickets(searchInput.value));

renderTickets();
