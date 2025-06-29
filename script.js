document.addEventListener("DOMContentLoaded", () => {
  const ticketForm = document.getElementById("ticketForm");
  const ticketList = document.getElementById("ticketList");

  const myTicketForm = document.getElementById("myTicketForm");
  const myTicketList = document.getElementById("myTicketList");

  // 🔁 Load All Tickets
  async function fetchTickets() {
    try {
      const response = await fetch("http://127.0.0.1:5000/tickets");
      const tickets = await response.json();

      ticketList.innerHTML = "";

      if (tickets.length === 0) {
        ticketList.innerHTML = "<p>No tickets submitted yet.</p>";
        return;
      }

      tickets.forEach((ticket) => {
        const ticketEl = document.createElement("div");
        ticketEl.className = "ticket";
        ticketEl.innerHTML = `
          <p><strong>Name:</strong> ${ticket.name}</p>
          <p><strong>Email:</strong> ${ticket.email}</p>
          <p><strong>Issue:</strong> ${ticket.issue}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <button onclick="toggleStatus('${ticket.id}')">
            Mark as ${ticket.status === "Open" ? "Closed" : "Open"}
          </button>
        `;
        ticketList.appendChild(ticketEl);
      });
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      ticketList.innerHTML = "<p>Error loading tickets.</p>";
    }
  }

  // 📨 Submit New Ticket
  ticketForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const issue = document.getElementById("issue").value.trim();
    const category = document.getElementById("category").value;
    const priority = document.getElementById("priority").value;

    if (!name || !email || !issue || !category || !priority) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/submit-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, issue, category, priority })
      });

      if (!response.ok) throw new Error("Failed to submit ticket");

      alert("Ticket submitted successfully!");
      ticketForm.reset();
      fetchTickets();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Try again.");
    }
  });

  // 🔁 Toggle Ticket Status
  window.toggleStatus = async function (ticketId) {
    try {
      await fetch(`http://127.0.0.1:5000/toggle-status/${ticketId}`, {
        method: "POST"
      });
      fetchTickets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // 🔍 View My Tickets
  myTicketForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("myEmail").value.trim();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/my-tickets?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error("Failed to load your tickets");

      const tickets = await response.json();
      myTicketList.innerHTML = "";

      if (tickets.length === 0) {
        myTicketList.innerHTML = "<p>No tickets found for this email.</p>";
        return;
      }

      tickets.forEach((ticket) => {
        const ticketEl = document.createElement("div");
        ticketEl.className = "ticket";
        ticketEl.innerHTML = `
          <p><strong>Name:</strong> ${ticket.name}</p>
          <p><strong>Email:</strong> ${ticket.email}</p>
          <p><strong>Issue:</strong> ${ticket.issue}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
        `;
        myTicketList.appendChild(ticketEl);
      });
    } catch (err) {
      console.error("Error loading your tickets:", err);
      myTicketList.innerHTML = "<p>Error loading your tickets.</p>";
    }
  });

  fetchTickets(); // Initial fetch
});
