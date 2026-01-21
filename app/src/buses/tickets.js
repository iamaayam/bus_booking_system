
const busId = localStorage.getItem("selectedBusId");

if (!busId) {
  alert("No bus selected");
  window.location.href = "/";
}

window.onload = async () => {
  const busId = localStorage.getItem("selectedBusId");

  //  Load bus details 
  const busRes = await fetch(`/api/bus/${busId}`);
  const bus = await busRes.json();

  document.getElementById("busTitle").innerHTML = `
    ${bus.bus_name} <br>
    <small>${bus.bus_type} | ${bus.duration}</small>
  `;


  // Load seats
  const res = await fetch(`/api/seats?bus_id=${busId}`);
  const seats = await res.json();

  seats.forEach(seat => {
    const seatEl = document.getElementById(String(seat.seat_number));
    if (!seatEl) return;

    seatEl.classList.remove("available", "selected", "booked");

    if (seat.status === "booked") {
      seatEl.classList.add("booked");
    } 
    else if (seat.status === "locked") {
      seatEl.classList.add("selected");
    } 
    else {
      seatEl.classList.add("available");
    }
  });
};

let seatSelect = [];

async function seatClick(seat) {
  if (
    seat.classList.contains("booked") ||
    seat.classList.contains("selected")
  ) return;

  const seatId = parseInt(seat.id);

  const res = await fetch('/api/seats/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bus_id: busId,
      seat: seatId
    })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Seat already locked by someone else");
    return;
  }

  seat.classList.remove("available");
  seat.classList.add("selected");
  seatSelect.push(seatId);
}

function seatSubmit() { 
  if (seatSelect.length === 0) {
    alert("Please select at least one seat");
    return;
  }

  seatSelect.forEach(seatID => { 
    const seat = document.getElementById(seatID);
    if (seat) {
      seat.classList.remove("selected");
      document.getElementById("popup").style.display = "flex";
    }
  });
}

async function buy() {
  if (seatSelect.length === 0) {
    alert("Select seats first");
    return;
  }

  const seatNumbers = seatSelect.map(id => parseInt(id));

  const res = await fetch('/api/seats/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bus_id: busId,
      seats: seatNumbers
    })
  });

  const data = await res.json();

  if (data.success) {
    seatSelect.forEach(id => {
      const seat = document.getElementById(id);
      if (!seat) return;
      seat.classList.remove('selected');
      seat.classList.add('booked');
    });

    seatSelect = [];
    alert('Seats booked successfully');
    document.getElementById("popup").style.display = "none";
  } else {
    alert('Booking failed');
  }
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}