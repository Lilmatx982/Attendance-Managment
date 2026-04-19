let students = []
let attendanceRecords = {}
let currentPage = 'dashboard'

// Tailwind script is already loaded in HTML

function initializeTailwind() {
    return {
        config(userConfig = {}) {
            return {
                content: [],
                theme: {
                    extend: {}
                },
                plugins: [],
                ...userConfig,
            }
        },
        theme: {
            extend: {}
        }
    }
}

// Real-time clock
function updateClock() {
    const clockEl = document.getElementById('clock')
    const dateEl = document.getElementById('current-date')
    
    function tick() {
        const now = new Date()
        
        // Real-time clock in 24-hour format with seconds
        let hours = now.getHours().toString().padStart(2, '0')
        let minutes = now.getMinutes().toString().padStart(2, '0')
        let seconds = now.getSeconds().toString().padStart(2, '0')
        clockEl.textContent = `${hours}:${minutes}:${seconds}`
        
        // Date
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        dateEl.textContent = now.toLocaleDateString('en-PH', options)
    }
    
    tick()
    setInterval(tick, 1000)
}

// Load or create demo data
function loadData() {
    // Students
    const savedStudents = localStorage.getItem('attendify_students')
    if (savedStudents) {
        students = JSON.parse(savedStudents)
    } else {
        students = [
            { id: 1, roll: "S001", name: "Alice Johnson" },
            { id: 2, roll: "S002", name: "Bob Smith" },
            { id: 3, roll: "S003", name: "Catherine Lee" },
            { id: 4, roll: "S004", name: "Daniel Tan" },
            { id: 5, roll: "S005", name: "Emma Wong" },
            { id: 6, roll: "S006", name: "Farhan Khan" },
            { id: 7, roll: "S007", name: "Grace Lim" },
            { id: 8, roll: "S008", name: "Hassan Ibrahim" },
            { id: 9, roll: "S009", name: "Isabella Ng" },
            { id: 10, roll: "S010", name: "James Chen" }
        ]
        localStorage.setItem('attendify_students', JSON.stringify(students))
    }

    // Attendance records
    const savedRecords = localStorage.getItem('attendify_records')
    if (savedRecords) {
        attendanceRecords = JSON.parse(savedRecords)
    } else {
        // Create realistic demo data for the last 6 days
        attendanceRecords = {}
        const today = new Date()
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            
            const record = {}
            students.forEach(student => {
                // 90% present rate on average
                record[student.id] = Math.random() > 0.1 ? 'P' : 'A'
            })
            attendanceRecords[dateStr] = record
        }
        localStorage.setItem('attendify_records', JSON.stringify(attendanceRecords))
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('attendify_students', JSON.stringify(students))
    localStorage.setItem('attendify_records', JSON.stringify(attendanceRecords))
}

// Switch between pages
function switchPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    
    // Show selected
    const target = document.getElementById(page + '-page')
    if (target) target.classList.remove('hidden')
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'))
    const activeLink = document.getElementById('nav-' + page)
    if (activeLink) activeLink.classList.add('active')
    
    // Update title
    const titleMap = {
        'dashboard': 'Dashboard',
        'mark-attendance': 'Mark Attendance',
        'reports': 'Attendance Reports',
        'students': 'Manage Students'
    }
    document.getElementById('page-title').textContent = titleMap[page]
    
    currentPage = page
    
    // Refresh content
    if (page === 'dashboard') renderDashboard()
    if (page === 'mark-attendance') renderMarkAttendance()
    if (page === 'reports') renderReports()
    if (page === 'students') renderStudents()
}

// Render Dashboard
function renderDashboard() {
    const today = new Date().toISOString().split('T')[0]
    
    // Stats
    const totalStudents = students.length
    const todayRecord = attendanceRecords[today] || {}
    let presentCount = 0
    Object.keys(todayRecord).forEach(id => {
        if (todayRecord[id] === 'P') presentCount++
    })
    const absentCount = totalStudents - presentCount
    const percent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
    
    document.getElementById('stat-total').textContent = totalStudents
    document.getElementById('stat-present').textContent = presentCount
    document.getElementById('stat-absent').textContent = absentCount
    document.getElementById('stat-present-percent').innerHTML = `${percent}% <span class="text-xs">today</span>`
    document.getElementById('stat-average').textContent = '94%'
    
    // Recent attendance grid (last 7 days)
    const container = document.getElementById('dashboard-recent')
    container.innerHTML = ''
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayName = d.toLocaleDateString('en-PH', { weekday: 'short' })
        
        const record = attendanceRecords[dateStr] || {}
        let p = 0
        Object.values(record).forEach(status => { if (status === 'P') p++ })
        const perc = totalStudents > 0 ? Math.round((p / totalStudents) * 100) : 0
        
        const color = perc >= 90 ? 'emerald' : perc >= 70 ? 'amber' : 'red'
        
        const div = document.createElement('div')
        div.className = `flex flex-col items-center`
        div.innerHTML = `
            <div class="text-xs font-medium text-gray-500">${dayName}</div>
            <div class="text-4xl font-bold text-${color}-500 mt-1">${perc}%</div>
            <div class="text-xs mt-1 text-gray-400">${dateStr.slice(5)}</div>
        `
        container.appendChild(div)
    }
}

// Render Mark Attendance table
function renderMarkAttendance() {
    const today = new Date().toISOString().split('T')[0]
    document.getElementById('mark-date').innerHTML = `
        ${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
        <span class="text-emerald-500 ml-2">• LIVE</span>
    `
    
    const tbody = document.getElementById('attendance-table-body')
    tbody.innerHTML = ''
    
    const todayRecord = attendanceRecords[today] || {}
    
    students.forEach(student => {
        const isPresent = todayRecord[student.id] === 'P'
        
        const row = document.createElement('tr')
        row.className = 'hover:bg-gray-50 transition-colors'
        row.innerHTML = `
            <td class="px-8 py-5 font-medium">${student.roll}</td>
            <td class="px-8 py-5">${student.name}</td>
            <td class="text-center">
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" ${isPresent ? 'checked' : ''} 
                           class="w-5 h-5 accent-emerald-500">
                    <span class="ml-3 text-sm font-semibold ${isPresent ? 'text-emerald-500' : 'text-gray-400'}">
                        ${isPresent ? 'PRESENT' : 'ABSENT'}
                    </span>
                </label>
            </td>
            <td></td>
        `
        tbody.appendChild(row)
    })
}

// Submit attendance
function submitAttendance() {
    const today = new Date().toISOString().split('T')[0]
    const tbody = document.getElementById('attendance-table-body')
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]')
    
    const newRecord = {}
    
    students.forEach((student, index) => {
        newRecord[student.id] = checkboxes[index].checked ? 'P' : 'A'
    })
    
    attendanceRecords[today] = newRecord
    saveData()
    
    // Show success toast
    showToast('✅ Attendance saved successfully!', 'emerald')
    
    // Refresh dashboard stats
    if (currentPage === 'dashboard') renderDashboard()
    renderMarkAttendance()
}

// Render Reports
function renderReports() {
    const tbody = document.getElementById('reports-table-body')
    tbody.innerHTML = ''
    
    // Get all dates sorted newest first
    const dates = Object.keys(attendanceRecords).sort().reverse()
    
    dates.forEach(dateStr => {
        const record = attendanceRecords[dateStr]
        const presentCount = Object.values(record).filter(s => s === 'P').length
        const total = students.length
        const absentCount = total - presentCount
        const percent = Math.round((presentCount / total) * 100)
        
        const row = document.createElement('tr')
        row.innerHTML = `
            <td class="py-5 px-4 font-medium">${dateStr}</td>
            <td class="py-5 px-4 text-gray-500">${new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'short' })}</td>
            <td class="py-5 px-4 text-center font-semibold text-emerald-500">${presentCount}</td>
            <td class="py-5 px-4 text-center font-semibold text-red-500">${absentCount}</td>
            <td class="py-5 px-4">
                <div class="flex justify-center">
                    <div class="inline-flex items-center px-4 py-1 bg-emerald-100 text-emerald-700 rounded-3xl text-sm font-bold">
                        ${percent}%
                    </div>
                </div>
            </td>
            <td class="py-5 px-4 text-center">
                <button onclick="viewDateDetail('${dateStr}')" 
                        class="text-xs bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-3xl">DETAILS</button>
            </td>
        `
        tbody.appendChild(row)
    })
    
    if (dates.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-400">No attendance records yet</td></tr>`
    }
}

// Simple date detail alert (demo)
function viewDateDetail(dateStr) {
    const record = attendanceRecords[dateStr]
    let text = `Attendance for ${dateStr}\n\n`
    
    students.forEach(s => {
        const status = record[s.id] === 'P' ? '✅ PRESENT' : '❌ ABSENT'
        text += `${s.roll} - ${s.name} → ${status}\n`
    })
    
    alert(text)
}

// Render Students page
function renderStudents() {
    const tbody = document.getElementById('students-table-body')
    tbody.innerHTML = ''
    
    students.forEach(student => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td class="px-8 py-5 font-medium">${student.roll}</td>
            <td class="px-8 py-5">${student.name}</td>
            <td class="px-8 py-5">
                <button onclick="deleteStudent(${student.id}); event.stopImmediatePropagation()" 
                        class="text-red-500 hover:text-red-600 text-sm font-medium">Delete</button>
            </td>
        `
        tbody.appendChild(row)
    })
}

// Add new student
function showAddStudentModal() {
    document.getElementById('add-modal').classList.remove('hidden')
    document.getElementById('modal-roll').focus()
}

function hideAddStudentModal() {
    document.getElementById('add-modal').classList.add('hidden')
}

function addNewStudent() {
    const roll = document.getElementById('modal-roll').value.trim()
    const name = document.getElementById('modal-name').value.trim()
    
    if (!roll || !name) {
        alert("Please fill both fields!")
        return
    }
    
    const maxId = students.length ? Math.max(...students.map(s => s.id)) : 0
    students.push({
        id: maxId + 1,
        roll: roll,
        name: name
    })
    
    saveData()
    hideAddStudentModal()
    renderStudents()
    
    // Clear inputs
    document.getElementById('modal-roll').value = ''
    document.getElementById('modal-name').value = ''
    
    showToast('🎉 Student added!', 'emerald')
}

// Delete student
function deleteStudent(id) {
    if (!confirm('Delete this student permanently?')) return
    
    students = students.filter(s => s.id !== id)
    saveData()
    renderStudents()
    
    // Also clean old attendance records for deleted student
    Object.keys(attendanceRecords).forEach(date => {
        delete attendanceRecords[date][id]
    })
    saveData()
}

// Toast notification
function showToast(message, color) {
    const toast = document.createElement('div')
    toast.className = `toast fixed bottom-6 right-6 bg-${color}-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50`
    toast.innerHTML = `
        ${message}
    `
    document.body.appendChild(toast)
    
    setTimeout(() => {
        toast.style.transition = 'all 0.4s ease'
        toast.style.transform = 'translateY(100px)'
        toast.style.opacity = '0'
        setTimeout(() => toast.remove(), 400)
    }, 2800)
}

// Dark mode toggle - REMOVED per user request
// function toggleDarkMode() { ... }
// function loadDarkMode() { ... }

// Chart.js dashboard trend chart
let trendChart = null;
function renderTrendChart() {
    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;

    const dates = [];
    const data = [];
    const totalStudents = students.length;
    const recentDates = Object.keys(attendanceRecords).sort().slice(-7);

    recentDates.forEach(dateStr => {
        const record = attendanceRecords[dateStr];
        let present = 0;
        Object.values(record).forEach(status => {
            if (status === 'P') present++;
        });
        const percent = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;
        dates.unshift(new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));
        data.unshift(percent);
    });

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Attendance %',
                data: data,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    });
}

// Confetti celebration
function celebrate() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
    });
}

// Loading spinner
function showLoading(btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<div class="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>Saving...';
    btn.disabled = true;
    return original;
}

function hideLoading(btn, original) {
    btn.innerHTML = original;
    btn.disabled = false;
}

// Search/filter function
function filterStudents(query) {
    const rows = document.querySelectorAll('#attendance-table-body tr, #students-table-body tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// Updated submitAttendance with loading and confetti
function submitAttendance(e) {
    e.preventDefault();
    const saveBtn = e.target;
    const original = showLoading(saveBtn);
    
    setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        const tbody = document.getElementById('attendance-table-body');
        const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
        
        const newRecord = {};
        students.forEach((student, index) => {
            newRecord[student.id] = checkboxes[index].checked ? 'P' : 'A';
        });
        
        attendanceRecords[today] = newRecord;
        saveData();
        
        hideLoading(saveBtn, original);
        celebrate();
        showToast('✅ Attendance saved! 🎉', 'emerald');
        
        if (currentPage === 'dashboard') renderDashboard();
        renderMarkAttendance();
    }, 1500);
}

// Updated addNewStudent with confetti
function addNewStudent() {
    const roll = document.getElementById('modal-roll').value.trim();
    const name = document.getElementById('modal-name').value.trim();
    
    if (!roll || !name) {
        showToast('Please fill both fields!', 'red');
        return;
    }
    
    const maxId = students.length ? Math.max(...students.map(s => s.id)) : 0;
    students.push({ id: maxId + 1, roll, name });
    saveData();
    hideAddStudentModal();
    renderStudents();
    
    document.getElementById('modal-roll').value = '';
    document.getElementById('modal-name').value = '';
    
    celebrate();
    showToast('🎉 Student added successfully!', 'emerald');
}

// Fake logout
function logout() {
    window.location.href = 'login.html';
}

// Initialize everything
function init() {
    loadData();
    updateClock();
    
    // Search inputs (if exist)
    const searchInputs = document.querySelectorAll('[data-search]');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => filterStudents(e.target.value));
    });
    
    // Start on dashboard
    switchPage('dashboard');
    
    console.log('%c✨ Attendify modernized! Charts, confetti, search LIVE. Dark mode removed.', 'color:#10b981; font-family:monospace; font-size:14px');
}

// Start the app
window.onload = init
