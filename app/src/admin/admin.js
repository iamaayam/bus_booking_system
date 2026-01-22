
    // // --- Dummy data ---
    // const dummy = {
    //   totalBookings: 1234,
    //   revenue: 456700,
    //   activeBuses: 28,
    //   userCount: 542,
    //   recentBookings: [
    //     {id: 'BK-1001', route: 'KTM → PKR', date: '2025-12-20', seats: 2, amount: 2400},
    //     {id: 'BK-1002', route: 'PKR → KTM', date: '2025-12-20', seats: 1, amount: 1200},
    //     {id: 'BK-1003', route: 'BIR → KTM', date: '2025-12-19', seats: 3, amount: 3600},
    //     {id: 'BK-1004', route: 'DHA → LUK', date: '2025-12-18', seats: 1, amount: 1200}
    //   ],
    //   bookingsByRoute: {
    //     labels: ['KTM→PKR','PKR→KTM','BIR→KTM','DHA→LUK'],
    //     data: [320, 210, 150, 90]
    //   },
    //   statusBreakdown: {labels:['Confirmed','Pending','Cancelled'], data:[820,300,114]},
    //   traffic: {
    //     labels: ['Dec 1','Dec 5','Dec 10','Dec 15','Dec 20','Dec 25'],
    //     bookings: [45, 78, 90, 120, 140, 160],
    //     revenue: [5400, 7800, 9000, 12000, 14200, 16000]
    //   },
    //   topRoutes: [
    //     {route:'KTM→PKR', bookings:320, revenue:384000},
    //     {route:'PKR→KTM', bookings:210, revenue:252000},
    //     {route:'BIR→KTM', bookings:150, revenue:180000}
    //   ],
    //   users: [
    //     {id:1, name:'Aayam Shrestha', email:'aayam@example.com', role:'customer', active:true},
    //     {id:2, name:'Sita Rana', email:'sita@example.com', role:'customer', active:true},
    //     {id:3, name:'Ram Thapa', email:'ram@example.com', role:'staff', active:false},
    //     {id:4, name:'Lekha Rai', email:'lekha@example.com', role:'customer', active:true}
    //   ]
    // };

    // // --- Populate simple metrics and tables ---
    // document.getElementById('totalBookings').innerText = dummy.totalBookings.toLocaleString();
    // document.getElementById('revenue').innerText = '₨ ' + dummy.revenue.toLocaleString();
    // document.getElementById('activeBuses').innerText = dummy.activeBuses;
    // document.getElementById('userCount').innerText = dummy.userCount;

    // const rb = document.getElementById('recentBookings');
    // dummy.recentBookings.forEach(r => {
    //   const tr = document.createElement('tr');
    //   tr.innerHTML = `<td>${r.id}</td><td>${r.route}</td><td>${r.date}</td><td>${r.seats}</td><td>₨ ${r.amount.toLocaleString()}</td>`;
    //   rb.appendChild(tr);
    // });

    // const troutes = document.getElementById('topRoutes');
    // dummy.topRoutes.forEach(r => {
    //   const tr = document.createElement('tr');
    //   tr.innerHTML = `<td>${r.route}</td><td>${r.bookings}</td><td>₨ ${r.revenue.toLocaleString()}</td>`;
    //   troutes.appendChild(tr);
    // });

    // // User table
    // function renderUsers(filter=''){
    //   const tbody = document.getElementById('userTable');
    //   tbody.innerHTML = '';
    //   const users = dummy.users.filter(u => (u.name + u.email).toLowerCase().includes(filter.toLowerCase()));
    //   users.forEach((u, i) => {
    //     const tr = document.createElement('tr');
    //     tr.innerHTML = `
    //       <td>${u.id}</td>
    //       <td>${u.name}</td>
    //       <td>${u.email}</td>
    //       <td>${u.role}</td>
    //       <td>${u.active ? '<span class="badge active">Active</span>' : '<span class="badge blocked">Blocked</span>'}</td>
    //       <td>
    //         <button class="btn ghost" onclick="editUser(${u.id})">Edit</button>
    //         <button class="btn" onclick="toggleBlock(${u.id})">${u.active ? 'Block' : 'Unblock'}</button>
    //       </td>
    //     `;
    //     tbody.appendChild(tr);
    //   });
    // }
    // renderUsers();

    // document.getElementById('userSearch').addEventListener('input', (e)=> renderUsers(e.target.value));
    // document.getElementById('globalSearch').addEventListener('input', (e)=> {
    //   const q = e.target.value.trim();
    //   if(!q) return;
    //   showSection('users');
    //   renderUsers(q);
    // });

    // function editUser(id){
    //   const u = dummy.users.find(x=>x.id===id);
    //   if(!u) return alert('User not found');
    //   const name = prompt('Edit name', u.name);
    //   if(name) { u.name = name; renderUsers(); }
    // }
    // function toggleBlock(id){
    //   const u = dummy.users.find(x=>x.id===id);
    //   if(!u) return;
    //   u.active = !u.active; renderUsers();
    // }

    // // --- Charts ---
    // const barCtx = document.getElementById('barChart').getContext('2d');
    // const barChart = new Chart(barCtx, {
    //   type: 'bar',
    //   data: {
    //     labels: dummy.bookingsByRoute.labels,
    //     datasets: [{
    //       label: 'Bookings',
    //       data: dummy.bookingsByRoute.data,
    //       backgroundColor: ['#0ea5a4','#06b6d4','#7c3aed','#f97316']
    //     }]
    //   },
    //   options: {responsive:true,plugins:{legend:{display:false}}}
    // });

    // const pieCtx = document.getElementById('pieChart').getContext('2d');
    // const pieChart = new Chart(pieCtx, {
    //   type: 'pie',
    //   data: {labels: dummy.statusBreakdown.labels, datasets:[{data:dummy.statusBreakdown.data, backgroundColor:['#10b981','#f59e0b','#ef4444']}]},
    //   options:{responsive:true}
    // });

    // const lineCtx = document.getElementById('lineChart').getContext('2d');
    // const lineChart = new Chart(lineCtx, {
    //   type:'line',
    //   data:{labels: dummy.traffic.labels, datasets:[{label:'Bookings', data: dummy.traffic.bookings, tension:0.3, fill:false, borderColor:'#0ea5a4'},{label:'Revenue', data: dummy.traffic.revenue, tension:0.3, fill:false, borderColor:'#7c3aed'}]},
    //   options:{responsive:true}
    // });

    // // Navigation between sections
    // function showSection(id){
    //   document.querySelectorAll('.section').forEach(s=> s.style.display='none');
    //   const el = document.getElementById(id);
    //   if(el) el.style.display = '';
    //   document.getElementById('pageTitle').innerText = id.charAt(0).toUpperCase() + id.slice(1);
    //   document.querySelectorAll('nav.menu a').forEach(a=> a.classList.toggle('active', a.dataset.section===id));
    //   window.location.hash = id;
    // }

    // // link clicks
    // document.querySelectorAll('nav.menu a').forEach(a=>{
    //   a.addEventListener('click', (e)=>{
    //     e.preventDefault();
    //     showSection(a.dataset.section);
    //   });
    // });

    // // show initial section by hash
    // const initial = window.location.hash.replace('#','') || 'dashboard';
    // showSection(initial);
async function loadSeats() {
  const res = await fetch("/api/admin/seats");
  const data = await res.json();

  const table = document.getElementById("seatTable");
  table.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.bus_name}</td>
      <td>${row.seat_number}</td>
      <td>${row.status}</td>
      <td>
        ${
          row.status === "booked"
            ? `<button onclick="makeAvailable(${row.bus_id}, '${row.bus_name}', ${row.seat_number})">
                 Make Available
               </button>`
            : "-"
        }
      </td>
    `;

    table.appendChild(tr);
  });
}

async function makeAvailable(busId, busName, seatNumber) {
  if (!confirm("Make this seat available again?")) return;

  await fetch("/api/admin/make-available", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ busId, busName, seatNumber })
  });

  loadSeats();
  loadDeleted();
}

async function loadDeleted() {
  const res = await fetch("/api/admin/deleted");
  const data = await res.json();

  const table = document.getElementById("deletedTable");
  table.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.bus_name}</td>
      <td>${row.seat_number}</td>
      <td>${new Date(row.deleted_at).toLocaleString()}</td>
    `;
    table.appendChild(tr);
  });
}

window.onload = () => {
  loadSeats();
  loadDeleted();
};
