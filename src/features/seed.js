import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ── Auto-column helper: ensures all columns exist before INSERT ──────────────
async function ensureColumns(conn, table, dataObj) {
    // Get existing columns
    const [cols] = await conn.query(`SHOW COLUMNS FROM ${table}`);
    const existing = new Set(cols.map(c => c.Field));
    
    // For each key in the data, add column if missing
    for (const key of Object.keys(dataObj)) {
        if (!existing.has(key)) {
            // Guess column type from value
            const val = dataObj[key];
            let colType = 'TEXT';
            if (typeof val === 'number' && Number.isInteger(val)) colType = 'INT';
            else if (typeof val === 'number') colType = 'DECIMAL(10,2)';
            else if (typeof val === 'string' && val.length <= 50) colType = 'VARCHAR(255)';
            
            try {
                await conn.query(`ALTER TABLE ${table} ADD COLUMN \`${key}\` ${colType} NULL`);
                console.log(`  ✚ Added column ${table}.${key} (${colType})`);
            } catch(e) {
                // Column might have been added by another concurrent call
                if (!e.message.includes('Duplicate column')) throw e;
            }
        }
    }
}

// Smart upsert: builds INSERT ... ON DUPLICATE KEY UPDATE dynamically
async function smartInsert(conn, table, data) {
    await ensureColumns(conn, table, data);
    
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const updateClause = keys.map(k => `\`${k}\`=VALUES(\`${k}\`)`).join(',');
    const vals = keys.map(k => data[k]);
    
    await conn.query(
        `INSERT INTO \`${table}\` (${keys.map(k=>`\`${k}\``).join(',')}) VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        vals
    );
}

// ── Data pools ───────────────────────────────────────────────────────────────
const BOY   = ['Arjun','Rohan','Karan','Rahul','Vivek','Amit','Suresh','Rakesh','Nikhil','Deepak','Sanjay','Vijay','Aarav','Dev','Harsh','Ishaan','Jay','Kabir','Lakshya','Manav','Neeraj','Pranav','Raj','Siddharth','Tarun','Uday','Vikram','Yash','Aditya','Ankit','Bharat','Chirag','Dhruv','Eshan','Gaurav','Hitesh','Jatin','Mayank','Pawan','Rohit'];
const GIRL  = ['Priya','Anjali','Neha','Pooja','Divya','Kavita','Sunita','Geeta','Ananya','Bhavna','Charu','Deepa','Ekta','Garima','Heena','Isha','Jyoti','Komal','Lata','Meera','Nisha','Poonam','Ritu','Sakshi','Tanvi','Usha','Vidya','Zara','Anika','Bhumika','Chandni','Diya','Falak','Geetika','Hardika','Inaya','Juhi','Kirti','Lavanya','Mahi'];
const LAST  = ['Sharma','Gupta','Singh','Verma','Patel','Kumar','Mishra','Joshi','Yadav','Tiwari','Pandey','Dubey','Shukla','Srivastava','Agarwal','Bhat','Chopra','Desai','Mehta','Nair','Rao','Shah','Trivedi','Upadhyay','Chauhan','Malhotra','Saxena','Bose','Iyer','Pillai'];
const ACADEMIC_POSITIONS_VALS = [
    "Nursery Teacher (NTT)", "Primary Teacher (PRT)", "Assistant Teacher", "Trained Graduate Teacher (TGT)", 
    "Post Graduate Teacher (PGT)", "Physical Education Teacher (PET)", "Yoga Teacher", "Music Teacher", 
    "Dance Teacher", "Art & Craft Teacher", "Computer Teacher", "Librarian", "Academic Coordinator", "Headmaster / Headmistress", "Principal", "Other"
];
const NON_ACADEMIC_POSITIONS_VALS = [
    "Clerk", "Accountant", "Cashier", "Administrative Officer", "Receptionist", "Computer Operator", "IT Assistant", "Store Keeper", "Peon", "Mali (Gardener)", "Sweeper", "Security Guard", "Driver", "Counselor", "Nurse", "Hostel Warden", "Other"
];
const DOCUMENT_TYPES_VALS = ["TC", "Marksheet", "Degree", "Aadhar Card", "PAN Card", "Birth Certificate", "Passport Size Photo", "Signature", "Caste Certificate", "Income Certificate", "Other"];
const DAD   = ['Rajesh','Mukesh','Dinesh','Suresh','Ramesh','Mahesh','Ganesh','Naresh','Anil','Sunil','Vinod','Pramod','Ashok','Alok','Deepak','Vivek','Sanjay','Umesh','Hitesh','Ritesh','Santosh','Kamlesh','Yogesh','Devesh','Rakesh','Nilesh','Rupesh','Bhushan','Girish','Harish'];
const MOM   = ['Sudha','Rekha','Usha','Asha','Savita','Kavita','Anita','Sunita','Mamta','Saroj','Kusum','Pushpa','Geeta','Seeta','Radha','Bharti','Malti','Shanti','Meera','Nirmala','Kamla','Vimla','Sheela','Leela','Hemlata','Sarita','Lalita','Shobha','Renu','Urmila'];
const ADDR  = ['12, Gandhi Nagar, Lucknow','45, Tilak Marg, Varanasi','78, Nehru Colony, Kanpur','23, MG Road, Allahabad','56, Civil Lines, Agra','90, Ram Nagar, Mathura','34, Indira Nagar, Noida','67, Rajpur Rd, Dehradun','11, Anna Nagar, Chennai','88, Salt Lake, Kolkata','14, Lajpat Nagar, Delhi','31, Banjara Hills, Hyderabad','55, Koramangala, Bangalore','72, Viman Nagar, Pune','9, Satellite, Ahmedabad','22, Ashok Vihar, Delhi','48, Patel Nagar, Jaipur','63, Sector 15, Chandigarh','7, Hazratganj, Lucknow','36, Chowk Bazaar, Agra'];
const BG    = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const FEEST = ['paid','paid','paid','paid','pending','pending','partial'];
const STAFF = [
    {role:'Teacher',      jobTitle:'PGT Mathematics'},
    {role:'Teacher',      jobTitle:'PGT Science'},
    {role:'Teacher',      jobTitle:'TGT English'},
    {role:'Teacher',      jobTitle:'TGT Hindi'},
    {role:'Teacher',      jobTitle:'TGT Social Studies'},
    {role:'Teacher',      jobTitle:'PRT (Primary Teacher)'},
    {role:'Teacher',      jobTitle:'PGT Physics'},
    {role:'Teacher',      jobTitle:'PGT Chemistry'},
    {role:'Teacher',      jobTitle:'PGT Biology'},
    {role:'Teacher',      jobTitle:'TGT Computer Science'},
    {role:'Teacher',      jobTitle:'PGT Commerce'},
    {role:'Teacher',      jobTitle:'TGT Art & Craft'},
    {role:'Teacher',      jobTitle:'TGT Physical Education'},
    {role:'Librarian',    jobTitle:'School Librarian'},
    {role:'Admin Staff',  jobTitle:'Office Administrator'},
    {role:'Driver',       jobTitle:'School Bus Driver'},
    {role:'Conductor',    jobTitle:'Bus Conductor'},
    {role:'Warden',       jobTitle:'Hostel Warden'},
    {role:'Accountant',   jobTitle:'School Accountant'},
    {role:'Clerk',        jobTitle:'Office Clerk'},
];
const CDEFS = [
    {name:'Nursery',  grade:0,  minAge:3, maxAge:4,  secs:['A','B'],       streams:[null,null]},
    {name:'LKG',      grade:0,  minAge:4, maxAge:5,  secs:['A','B'],       streams:[null,null]},
    {name:'UKG',      grade:0,  minAge:5, maxAge:6,  secs:['A','B'],       streams:[null,null]},
    {name:'Prep',     grade:0,  minAge:5, maxAge:6,  secs:['A','B'],       streams:[null,null]},
    {name:'Class 1',  grade:1,  minAge:6, maxAge:7,  secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 2',  grade:2,  minAge:7, maxAge:8,  secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 3',  grade:3,  minAge:8, maxAge:9,  secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 4',  grade:4,  minAge:9, maxAge:10, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 5',  grade:5,  minAge:10,maxAge:11, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 6',  grade:6,  minAge:11,maxAge:12, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 7',  grade:7,  minAge:12,maxAge:13, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 8',  grade:8,  minAge:13,maxAge:14, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 9',  grade:9,  minAge:14,maxAge:15, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 10', grade:10, minAge:15,maxAge:16, secs:['A','B','C'],   streams:[null,null,null]},
    {name:'Class 11', grade:11, minAge:16,maxAge:17, secs:['S','C','A'],   streams:['Science','Commerce','Arts']},
    {name:'Class 12', grade:12, minAge:17,maxAge:18, secs:['S','C','A'],   streams:['Science','Commerce','Arts']},
];

const GLB_MODS = [
    // Core Modules
    { id: 'student_mgmt', name: 'Student Management', category: 'core', desc: 'Enrollment, profiles, and registry' },
    { id: 'teacher_mgmt', name: 'Teacher Management', category: 'core', desc: 'Faculty profiles and assignments' },
    { id: 'attendance',   name: 'Attendance',         category: 'core', desc: 'Daily tracking for students/staff' },
    { id: 'exams',        name: 'Exams & Results',    category: 'core', desc: 'Examination scheduling and marks' },
    { id: 'fees',         name: 'Fees & Finance',     category: 'core', desc: 'Fee collections and billing' },
    { id: 'timetable',    name: 'Timetable',          category: 'core', desc: 'Class scheduling and schedules' },
    { id: 'homework',     name: 'Homework',           category: 'core', desc: 'Daily assignments and tracking' },
    { id: 'communication',name: 'Communication',      category: 'core', desc: 'Notices, SMS, and messaging' },
    { id: 'library',      name: 'Library',            category: 'core', desc: 'Book catalog and circulation' },
    { id: 'transport',    name: 'Transport',          category: 'core', desc: 'Routes and vehicle tracking' },
    { id: 'hostel',       name: 'Hostel',             category: 'core', desc: 'Room allocation and mess' },
    { id: 'medical',      name: 'Medical',            category: 'core', desc: 'Health records and clinic logs' },
    
    // Advanced Modules
    { id: 'online_class', name: 'Online Classes',     category: 'advanced', desc: 'Virtual classrooms and Zoom' },
    { id: 'mobile_app',   name: 'Mobile App Access', category: 'advanced', desc: 'iOS/Android parent portal' },
    { id: 'sms_whatsapp', name: 'SMS / WhatsApp API',category: 'advanced', desc: 'Unified gateway integration' },
    { id: 'pay_gateway',  name: 'Payment Gateway',    category: 'advanced', desc: 'Paytm/Stripe integration' },
    { id: 'biometric',    name: 'Biometric Integration',category: 'advanced', desc: 'Hardware sync and logs' },
    { id: 'gps_tracking', name: 'GPS Tracking',       category: 'advanced', desc: 'Real-time vehicle location' },
];

const pick  = a => a[Math.floor(Math.random()*a.length)];
const rnd   = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pad   = (n,l=3) => String(n).padStart(l,'0');
const bgc   = () => ['6366f1','10b981','0ea5e9','f59e0b','ec4899','8b5cf6','ef4444','14b8a6'][rnd(0,7)];
const ph    = () => `9${rnd(100000000,999999999)}`;
const ava   = n => `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=${bgc()}&color=fff`;
const fname = g => `${g==='Male'?pick(BOY):pick(GIRL)} ${pick(LAST)}`;

const DEFAULT_SETTINGS = {
    student_settings: {
        categories: ["General", "OBC", "SC", "ST", "Other"],
        bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        religions: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"],
        documentTypes: ["TC", "Marksheet", "Degree", "Aadhar Card", "PAN Card", "Birth Certificate", "Passport Size Photo", "Signature", "Caste Certificate", "Income Certificate", "Other"],
        genders: ["Male", "Female", "Other"]
    },
    employee_settings: {
        academic_positions: ACADEMIC_POSITIONS_VALS,
        non_academic_positions: NON_ACADEMIC_POSITIONS_VALS,
        genders: ["Male", "Female", "Other"]
    }
};

// ── Main seeder endpoint ─────────────────────────────────────────────────────
router.post('/run', async (req, res) => {
    const conn = await pool.getConnection();
    const log = [];
    try {
        log.push('Starting full seeder v3...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');

        // Ensure tables exist
        const initSQL = [
            `CREATE TABLE IF NOT EXISTS modules (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT, applicableRoles JSON, features JSON, status VARCHAR(20), category VARCHAR(20), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS schools (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), address TEXT, contactPhone VARCHAR(20), contactEmail VARCHAR(100), status VARCHAR(20) DEFAULT 'active', subscriptionType VARCHAR(20), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS school_modules (id INT AUTO_INCREMENT PRIMARY KEY, schoolId VARCHAR(50), moduleId VARCHAR(50), status VARCHAR(20), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY school_mod (schoolId, moduleId))`,
            `CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), role VARCHAR(20), tenantId VARCHAR(50), avatar TEXT, status VARCHAR(20), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS classes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50), section VARCHAR(10), grade INT, schoolId VARCHAR(50), teacherId VARCHAR(50), studentCount INT DEFAULT 0, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS students (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), rollNo VARCHAR(20), enrollmentNo VARCHAR(50), classId INT, schoolId VARCHAR(50), stream VARCHAR(50), admissionDate DATE, feeStatus VARCHAR(20), academicStatus VARCHAR(20), status VARCHAR(20), transportId VARCHAR(50), hostelId VARCHAR(50), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS employees (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), phone VARCHAR(20), role VARCHAR(50), jobTitle VARCHAR(100), schoolId VARCHAR(50), salary DECIMAL(10,2), status VARCHAR(20), joiningDate DATE, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS transport_vehicles (id VARCHAR(50) PRIMARY KEY, schoolId VARCHAR(50), busNumber VARCHAR(20), capacity INT, driverId VARCHAR(50), conductorId VARCHAR(50), status VARCHAR(20), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS hostels (id VARCHAR(50) PRIMARY KEY, schoolId VARCHAR(50), name VARCHAR(100), type VARCHAR(10), capacity INT, wardenId VARCHAR(50), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS hostel_rooms (id VARCHAR(50) PRIMARY KEY, hostelId VARCHAR(50), roomNumber VARCHAR(20), type VARCHAR(50), capacity INT, status VARCHAR(20) DEFAULT 'available', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS school_settings (id INT AUTO_INCREMENT PRIMARY KEY, schoolId VARCHAR(50), settingKey VARCHAR(100), settingValue JSON, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY school_set (schoolId, settingKey))`
        ];
        for (const sql of initSQL) await conn.query(sql);
        log.push('Tables initialized');
        for (const t of ['marks','attendance_students','attendance_employees','fee_structures','sections','students','classes','employees','school_modules','modules', 'transport_vehicles', 'hostels']) {
            await conn.query(`DELETE FROM ${t}`);
        }
        await conn.query(`DELETE FROM users WHERE role IN ('student','employee')`);
        log.push('Cleared existing data');

        // Seed Global Modules
        for (const mod of GLB_MODS) {
            await smartInsert(conn, 'modules', {
                id: mod.id, 
                name: mod.name, 
                description: mod.desc,
                applicableRoles: JSON.stringify(['school_admin', 'employee', 'student']),
                features: JSON.stringify([mod.id]),
                status: 'active',
                category: mod.category // smartInsert will add this column
            });
        }
        log.push(`Global registry: ${GLB_MODS.length} modules initialized`);

        for (const schoolId of ['school-1','school-2','school-3']) {
            const sn = schoolId.split('-')[1];
            log.push(`--- Processing ${schoolId} ---`);

            // Randomize Modules for this school
            const corePool = GLB_MODS.filter(m => m.category === 'core');
            const advPool = GLB_MODS.filter(m => m.category === 'advanced');
            
            // At least 8 core, 2 advanced randomly
            const selectedCore = [...corePool].sort(() => 0.5 - Math.random()).slice(0, 10);
            const selectedAdv = [...advPool].sort(() => 0.5 - Math.random()).slice(0, 3);
            
            for (const mod of [...selectedCore, ...selectedAdv]) {
                await smartInsert(conn, 'school_modules', {
                    schoolId,
                    moduleId: mod.id,
                    status: 'active'
                });
            }
            log.push(`School modules: ${selectedCore.length + selectedAdv.length} assigned`);

            // Seed Default Settings
            for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
                await smartInsert(conn, 'school_settings', {
                    schoolId,
                    settingKey: key,
                    settingValue: JSON.stringify(val)
                });
            }
            log.push('Default school settings initialized');

            // Build class list
            const classList = [];
            for (const def of CDEFS) {
                for (let i = 0; i < def.secs.length; i++) {
                    const sec = def.secs[i];
                    const stream = def.streams[i];
                    const clsId = `cls-${sn}-${def.name.replace(/\s+/g,'')}-${sec}`;
                    classList.push({ id: clsId, schoolId, name: def.name, grade: def.grade, section: sec, stream: stream || 'None', minAge: def.minAge, maxAge: def.maxAge, teacherId: null });
                }
            }

            // Create staff (80 per school)
            const staffList = [];
            for (let i = 0; i < 80; i++) {
                const gender = pick(['Male','Female']);
                const empName = fname(gender);
                const empId = `emp-${sn}-${pad(i+1)}`;
                
                let pos;
                if (i < 50) {
                    pos = STAFF[i % 13]; // Teachers (Academic)
                } else if (i < 60) {
                    pos = STAFF[15]; // Drivers (Non-Academic)
                } else if (i < 70) {
                    pos = STAFF[16]; // Conductors (Non-Academic)
                } else if (i < 74) {
                    pos = STAFF[17]; // Wardens (Non-Academic)
                } else {
                    pos = STAFF[pick([13, 14, 18, 19])]; // Others (Librarian, Admin, Accountant, Clerk)
                }
                
                const salary = rnd(35000, 72000);
                const email = `emp${sn}${i+1}@school${sn}.edu`;

                // User record
                await smartInsert(conn, 'users', {
                    id: empId, name: empName, email, password: 'teacher123',
                    role: 'employee', tenantId: schoolId, avatar: ava(empName), status: 'active'
                });

                // Employee record
                await smartInsert(conn, 'employees', {
                    id: empId, name: empName, email, phone: ph(), gender,
                    schoolId, role: pos.role, jobTitle: pos.jobTitle,
                    employeeType: i < 50 ? 'Academic' : 'Non-Academic',
                    salary, status: 'Active', joiningDate: '2022-07-01',
                    assignedClasses: JSON.stringify([])
                });
                staffList.push({ id: empId, name: empName, role: pos.role });
            }
            log.push(`${staffList.length} staff created (50 Academic, 30 Non-Academic)`);

            // Create Transport (10 Buses)
            const drivers = staffList.filter(s => s.role === 'Driver');
            const conductors = staffList.filter(s => s.role === 'Conductor');
            const busList = [];
            for (let i = 0; i < 10; i++) {
                const busId = `bus-${sn}-${pad(i+1)}`;
                const busData = {
                    id: busId, schoolId,
                    busNumber: `UP-32-BN-${pad(rnd(1000, 9999), 4)}`,
                    capacity: 50,
                    driverId: drivers[i]?.id,
                    conductorId: conductors[i]?.id,
                    status: 'active'
                };
                await smartInsert(conn, 'transport_vehicles', busData);
                busList.push(busId);
            }
            log.push('10 School Buses created');

            // Create Hostels (1 Boy, 1 Girl)
            const wardens = staffList.filter(s => s.role === 'Warden');
            const hostelList = [];
            const boyHostelId = `hostel-${sn}-boy`;
            const girlHostelId = `hostel-${sn}-girl`;
            
            await smartInsert(conn, 'hostels', { id: boyHostelId, schoolId, name: 'Blue Ridge Boys Hostel', type: 'Boy', capacity: 200, wardenId: wardens[0]?.id });
            await smartInsert(conn, 'hostels', { id: girlHostelId, schoolId, name: 'Emerald Meadows Girls Hostel', type: 'Girl', capacity: 200, wardenId: wardens[1]?.id });
            hostelList.push(boyHostelId, girlHostelId);
            
            // Seed 20 rooms per hostel
            for (const hId of hostelList) {
                for (let r = 1; r <= 20; r++) {
                    const roomId = `${hId}-rm-${pad(r, 2)}`;
                    await smartInsert(conn, 'hostel_rooms', {
                        id: roomId, hostelId: hId, roomNumber: `${r < 10 ? '1' : '2'}${pad(r, 2)}`,
                        capacity: 4, occupied: 0, status: 'available', type: 'standard'
                    });
                }
            }
            log.push('2 Hostels created with 20 rooms each');

            // Assign class teachers & insert classes
            for (let ci = 0; ci < classList.length; ci++) {
                const cls = classList[ci];
                cls.teacherId = staffList[ci % staffList.length].id;

                await smartInsert(conn, 'classes', {
                    id: cls.id, schoolId, name: cls.name, section: cls.section,
                    grade: cls.grade, teacherId: cls.teacherId, studentCount: 0
                });
                await smartInsert(conn, 'sections', {
                    id: `sec-${cls.id}`, classId: cls.id, name: cls.section,
                    studentCount: 0, status: 'active'
                });
            }
            log.push(`${classList.length} classes & sections created`);

            // Create students (300 per school)
            let serial = 1;
            const studentsPerClass = Math.ceil(300 / classList.length);
            for (const cls of classList) {
                const count = studentsPerClass;
                for (let si = 0; si < count; si++) {
                    if (serial > 300) break;
                    const gender = pick(['Male','Female']);
                    const stdName = fname(gender);
                    const stdId = `std-${sn}-${pad(serial, 4)}`;
                    const lname = pick(LAST);
                    const fatherName = `${pick(DAD)} ${lname}`;
                    const motherName = `${pick(MOM)} ${lname}`;
                    const age = rnd(cls.minAge, cls.maxAge);
                    const dobYear = new Date().getFullYear() - age;
                    const dob = `${dobYear}-${pad(rnd(1,12),2)}-${pad(rnd(1,28),2)}`;
                    const rollNo = `${cls.section.charAt(0)}${pad(si+1)}`;
                    const enrollNo = `ENR-${sn}-${pad(cls.grade||0,2)}${cls.section.charAt(0)}-${pad(serial,4)}`;
                    const email = `std${sn}${pad(serial,4)}@student.edu`;

                    // Assign Transport & Hostel randomly but fulfilling the requirements
                    const transportId = serial <= 120 ? pick(busList) : null; // 120 students use bus
                    let hostelId = null;
                    if (serial <= 80) { // 80 students in hostels (40 per hostel approx)
                         hostelId = gender === 'Male' ? boyHostelId : girlHostelId;
                    }

                    // Student record
                    await smartInsert(conn, 'students', {
                        id: stdId, name: stdName, rollNo, enrollmentNo: enrollNo,
                        classId: cls.id, schoolId, stream: cls.stream,
                        admissionDate: '2024-04-01', age, dob,
                        bloodGroup: pick(BG), gender, address: pick(ADDR),
                        fatherName, motherName, parentContact: ph(),
                        feeStatus: pick(FEEST), academicStatus: 'In-Progress',
                        attendance: rnd(72,99), avatar: ava(stdName), status: 'active',
                        transportId, hostelId
                    });

                    // User record (optional for 300 students to save time, but let's do it for completeness)
                    await smartInsert(conn, 'users', {
                        id: stdId, name: stdName, email, password: 'student123',
                        role: 'student', tenantId: schoolId, avatar: ava(stdName), status: 'active'
                    });

                    await conn.query(`UPDATE classes SET studentCount=studentCount+1 WHERE id=?`, [cls.id]);
                    serial++;
                }
            }
            log.push(`${serial-1} students created per school`);

            // Update school counts
            const [[{sc}]] = await conn.query(`SELECT COUNT(*) sc FROM students WHERE schoolId=?`, [schoolId]);
            const [[{ec}]] = await conn.query(`SELECT COUNT(*) ec FROM employees WHERE schoolId=?`, [schoolId]);
            await conn.query(`UPDATE schools SET studentCount=?,employeeCount=? WHERE id=?`, [sc, ec, schoolId]);
            log.push(`Counts: ${sc} students, ${ec} staff`);
        }

        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        log.push('✅ Seeder complete!');
        res.json({ success: true, log });
    } catch(err) {
        log.push(`❌ ERROR: ${err.message}`);
        console.error(err);
        res.status(500).json({ success: false, error: err.message, log });
    } finally {
        conn.release();
    }
});

export default router;
