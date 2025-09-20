// Smart Attendance System JavaScript

class SmartAttendance {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.attendanceData = this.loadAttendanceData();
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.bindEvents();
        this.checkAutoLogin();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    // Load users from localStorage or create default users
    loadUsers() {
        const storedUsers = localStorage.getItem('smartAttendanceUsers');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }

        // Default users for demo
        const defaultUsers = {
            'student': { 
                username: 'student', 
                password: 'student123', 
                type: 'student', 
                name: 'John Doe',
                id: 'STU001'
            },
            'teacher': { 
                username: 'teacher', 
                password: 'teacher123', 
                type: 'teacher', 
                name: 'Prof. Smith',
                id: 'TEA001'
            },
            'admin': { 
                username: 'admin', 
                password: 'admin123', 
                type: 'admin', 
                name: 'Admin User',
                id: 'ADM001'
            }
        };

        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('smartAttendanceUsers', JSON.stringify(users));
    }

    // Load attendance data from localStorage
    loadAttendanceData() {
        const storedData = localStorage.getItem('smartAttendanceData');
        if (storedData) {
            return JSON.parse(storedData);
        }
        return {};
    }

    // Save attendance data to localStorage
    saveAttendanceData() {
        localStorage.setItem('smartAttendanceData', JSON.stringify(this.attendanceData));
    }

    // Bind event listeners
    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Mark attendance button
        document.getElementById('markAttendanceBtn').addEventListener('click', () => {
            this.showAttendanceModal();
        });

        // View history button
        document.getElementById('viewHistoryBtn').addEventListener('click', () => {
            this.toggleHistoryPanel();
        });

        // Confirm attendance
        document.getElementById('confirmAttendance').addEventListener('click', () => {
            this.markAttendance();
        });

        // Cancel attendance
        document.getElementById('cancelAttendance').addEventListener('click', () => {
            this.hideAttendanceModal();
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            this.hideAttendanceModal();
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Close modal when clicking outside
        document.getElementById('attendanceModal').addEventListener('click', (e) => {
            if (e.target.id === 'attendanceModal') {
                this.hideAttendanceModal();
            }
        });
    }

    // Handle login
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        if (!username || !password || !userType) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        const user = this.users[username];
        if (!user || user.password !== password || user.type !== userType) {
            this.showAlert('Invalid credentials', 'error');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showDashboard();
        this.showAlert(`Welcome, ${user.name}!`, 'success');
    }

    // Handle logout
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLogin();
        this.showAlert('Logged out successfully', 'success');
    }

    // Check for auto-login
    checkAutoLogin() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        }
    }

    // Show login section
    showLogin() {
        document.getElementById('loginSection').classList.add('active');
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('loginForm').reset();
    }

    // Show dashboard
    showDashboard() {
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('dashboardSection').classList.add('active');
        
        document.getElementById('userWelcome').textContent = `Welcome, ${this.currentUser.name}`;
        
        if (this.currentUser.type === 'admin') {
            this.showAdminDashboard();
        } else {
            this.showUserDashboard();
        }
        
        this.updateStats();
    }

    // Show user dashboard (student/teacher)
    showUserDashboard() {
        document.getElementById('userDashboard').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    // Show admin dashboard
    showAdminDashboard() {
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadAdminData();
    }

    // Update attendance statistics
    updateStats() {
        if (this.currentUser.type === 'admin') return;

        const userAttendance = this.attendanceData[this.currentUser.username] || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Filter current month's attendance
        const monthlyAttendance = userAttendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        });

        const totalDays = this.getWorkingDaysInMonth();
        const presentDays = monthlyAttendance.filter(record => record.status === 'present').length;
        const absentDays = totalDays - presentDays;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('presentDays').textContent = presentDays;
        document.getElementById('absentDays').textContent = absentDays;
        document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    }

    // Get working days in current month (excluding weekends)
    getWorkingDaysInMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = now.getDate();
        
        let workingDays = 0;
        for (let day = 1; day <= today; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                workingDays++;
            }
        }
        return workingDays;
    }

    // Show attendance modal
    showAttendanceModal() {
        const today = new Date().toDateString();
        const userAttendance = this.attendanceData[this.currentUser.username] || [];
        
        // Check if already marked today
        const todayRecord = userAttendance.find(record => 
            new Date(record.date).toDateString() === today
        );

        if (todayRecord) {
            this.showAlert('Attendance already marked for today', 'warning');
            return;
        }

        document.getElementById('attendanceModal').classList.add('active');
        this.getUserLocation();
    }

    // Hide attendance modal
    hideAttendanceModal() {
        document.getElementById('attendanceModal').classList.remove('active');
    }

    // Get user location
    getUserLocation() {
        const locationSpan = document.getElementById('userLocation');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    locationSpan.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                },
                (error) => {
                    locationSpan.textContent = 'Location unavailable';
                }
            );
        } else {
            locationSpan.textContent = 'Geolocation not supported';
        }
    }

    // Mark attendance
    markAttendance() {
        const now = new Date();
        const attendanceRecord = {
            date: now.toISOString(),
            timestamp: now.getTime(),
            status: 'present',
            location: document.getElementById('userLocation').textContent
        };

        if (!this.attendanceData[this.currentUser.username]) {
            this.attendanceData[this.currentUser.username] = [];
        }

        this.attendanceData[this.currentUser.username].push(attendanceRecord);
        this.saveAttendanceData();
        
        this.hideAttendanceModal();
        this.showAlert('Attendance marked successfully!', 'success');
        this.updateStats();
        this.updateHistoryDisplay();
    }

    // Toggle history panel
    toggleHistoryPanel() {
        const panel = document.getElementById('historyPanel');
        const isVisible = panel.style.display !== 'none';
        
        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            this.updateHistoryDisplay();
        }
    }

    // Update history display
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('attendanceHistory');
        const userAttendance = this.attendanceData[this.currentUser.username] || [];
        
        if (userAttendance.length === 0) {
            historyContainer.innerHTML = '<p>No attendance records found.</p>';
            return;
        }

        // Sort by date (newest first)
        const sortedAttendance = userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        historyContainer.innerHTML = sortedAttendance.map(record => {
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();
            
            return `
                <div class="history-item ${record.status}">
                    <div>
                        <div class="history-date">${formattedDate}</div>
                        <div style="font-size: 0.9rem; color: #666;">${formattedTime}</div>
                    </div>
                    <div class="history-status ${record.status}">${record.status.toUpperCase()}</div>
                </div>
            `;
        }).join('');
    }

    // Load admin data
    loadAdminData() {
        this.loadUsersList();
        this.loadReports();
    }

    // Load users list for admin
    loadUsersList() {
        const container = document.getElementById('usersList');
        const userEntries = Object.values(this.users).filter(user => user.type !== 'admin');
        
        container.innerHTML = userEntries.map(user => {
            const userAttendance = this.attendanceData[user.username] || [];
            const thisMonth = userAttendance.filter(record => {
                const recordDate = new Date(record.date);
                const now = new Date();
                return recordDate.getMonth() === now.getMonth() && 
                       recordDate.getFullYear() === now.getFullYear();
            });
            
            const presentDays = thisMonth.filter(record => record.status === 'present').length;
            const totalDays = this.getWorkingDaysInMonth();
            const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            
            return `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${user.name} (${user.id})</h4>
                        <p>${user.type.charAt(0).toUpperCase() + user.type.slice(1)} - Attendance: ${rate}%</p>
                    </div>
                    <div style="color: ${rate >= 75 ? '#28a745' : rate >= 50 ? '#ffc107' : '#dc3545'}; font-weight: bold;">
                        ${presentDays}/${totalDays} days
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load reports for admin
    loadReports() {
        const container = document.getElementById('reportsContent');
        const allUsers = Object.values(this.users).filter(user => user.type !== 'admin');
        
        let totalStudents = allUsers.filter(user => user.type === 'student').length;
        let totalTeachers = allUsers.filter(user => user.type === 'teacher').length;
        
        let overallStats = {
            excellent: 0, // >= 90%
            good: 0,      // 75-89%
            average: 0,   // 50-74%
            poor: 0       // < 50%
        };

        allUsers.forEach(user => {
            const userAttendance = this.attendanceData[user.username] || [];
            const thisMonth = userAttendance.filter(record => {
                const recordDate = new Date(record.date);
                const now = new Date();
                return recordDate.getMonth() === now.getMonth() && 
                       recordDate.getFullYear() === now.getFullYear();
            });
            
            const presentDays = thisMonth.filter(record => record.status === 'present').length;
            const totalDays = this.getWorkingDaysInMonth();
            const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            
            if (rate >= 90) overallStats.excellent++;
            else if (rate >= 75) overallStats.good++;
            else if (rate >= 50) overallStats.average++;
            else overallStats.poor++;
        });

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-user-graduate"></i>
                    <h3>${totalStudents}</h3>
                    <p>Total Students</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>${totalTeachers}</h3>
                    <p>Total Teachers</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-star"></i>
                    <h3>${overallStats.excellent}</h3>
                    <p>Excellent (≥90%)</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-thumbs-up"></i>
                    <h3>${overallStats.good}</h3>
                    <p>Good (75-89%)</p>
                </div>
            </div>
            <div style="margin-top: 2rem;">
                <h4>Performance Distribution</h4>
                <div style="margin-top: 1rem;">
                    <div style="margin-bottom: 0.5rem;">Excellent (≥90%): ${overallStats.excellent} users</div>
                    <div style="margin-bottom: 0.5rem;">Good (75-89%): ${overallStats.good} users</div>
                    <div style="margin-bottom: 0.5rem;">Average (50-74%): ${overallStats.average} users</div>
                    <div style="margin-bottom: 0.5rem;">Poor (<50%): ${overallStats.poor} users</div>
                </div>
            </div>
        `;
    }

    // Switch admin tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Reload data based on tab
        if (tabName === 'users') {
            this.loadUsersList();
        } else if (tabName === 'reports') {
            this.loadReports();
        }
    }

    // Update date and time
    updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toDateString();
        document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    }

    // Show alert messages
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-weight: 500;
        `;

        // Set colors based on type
        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;
        alert.style.backgroundColor = color.bg;
        alert.style.border = `1px solid ${color.border}`;
        alert.style.color = color.text;
        alert.textContent = message;

        document.body.appendChild(alert);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartAttendance();
});