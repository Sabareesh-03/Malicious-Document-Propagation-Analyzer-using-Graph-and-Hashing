// --- NAVIGATION ---
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const clickedNav = Array.from(navItems).find(item => item.getAttribute('onclick').includes(sectionId));
    if (clickedNav) {
        clickedNav.classList.add('active');
    }
}

// --- DATA STRUCTURES: HASH TABLE ---
class HashNode {
    constructor(docName, hashValue) {
        this.docName = docName;
        this.hashValue = hashValue;
        this.next = null;
    }
}

class HashTable {
    constructor(size = 50) {
        this.buckets = new Array(size).fill(null);
        this.size = size;
        this.totalDocs = 0;
    }

    // Simple polynomial rolling hash function
    hashFunction(hashString) {
        let hash = 5381;
        for (let i = 0; i < hashString.length; i++) {
            hash = ((hash << 5) + hash) + hashString.charCodeAt(i);
        }
        return Math.abs(hash) % this.size;
    }

    insert(docName, hashValue) {
        const index = this.hashFunction(hashValue);
        const newNode = new HashNode(docName, hashValue);
        
        if (!this.buckets[index]) {
            this.buckets[index] = newNode;
        } else {
            // Collision resolution via separate chaining (Linked List)
            let current = this.buckets[index];
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.totalDocs++;
    }

    search(hashValue) {
        const index = this.hashFunction(hashValue);
        let current = this.buckets[index];
        const results = [];

        while (current) {
            if (current.hashValue === hashValue) {
                results.push(current.docName);
            }
            current = current.next;
        }
        return results;
    }

    getAllDocuments() {
        const allDocs = [];
        for (let i = 0; i < this.size; i++) {
            let current = this.buckets[i];
            while (current) {
                allDocs.push({ name: current.docName, hash: current.hashValue });
                current = current.next;
            }
        }
        return allDocs;
    }
}

// --- DATA STRUCTURES: QUEUE (FOR BFS) ---
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    display() {
        if (this.isEmpty()) return "[Empty]";
        return this.items.map(i => `[${i}]`).join(' ');
    }
}

// --- DATA STRUCTURES: GRAPH ---
class Graph {
    constructor() {
        this.adjacencyList = new Map();
        this.deviceNames = new Map();
        this.totalConnections = 0;
    }

    addDevice(deviceId, deviceName) {
        if (!this.adjacencyList.has(deviceId)) {
            this.adjacencyList.set(deviceId, []);
            this.deviceNames.set(deviceId, deviceName);
            return true;
        }
        return false;
    }

    addConnection(src, dest) {
        if (!this.adjacencyList.has(src) || !this.adjacencyList.has(dest)) {
            return "One or both devices do not exist.";
        }
        if (src === dest) {
            return "A device cannot connect to itself.";
        }
        
        const srcList = this.adjacencyList.get(src);
        const destList = this.adjacencyList.get(dest);

        if (srcList.includes(dest)) {
            return "Connection already exists.";
        }

        // Undirected graph connection
        srcList.push(dest);
        destList.push(src);
        this.totalConnections++;
        return "Success";
    }

    getDevices() {
        const devices = [];
        this.adjacencyList.forEach((connections, deviceId) => {
            devices.push({
                id: deviceId,
                name: this.deviceNames.get(deviceId),
                connections: connections.join(', ')
            });
        });
        return devices;
    }

    // A simple visual display for educational purposes
    displayGraph() {
        let output = "";
        this.adjacencyList.forEach((connections, deviceId) => {
            output += `${deviceId} -> ${connections.join(', ')}\n`;
        });
        return output;
    }
}

// --- DATA STRUCTURES: LINKED LIST (FOR INCIDENTS) ---
class IncidentNode {
    constructor(id, docName, hash, src, dest, status) {
        this.id = id;
        this.docName = docName;
        this.hash = hash;
        this.src = src;
        this.dest = dest;
        this.status = status;
        this.next = null;
    }
}

class IncidentLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    insertIncident(id, docName, hash, src, dest, status) {
        const newNode = new IncidentNode(id, docName, hash, src, dest, status);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }

    deleteIncident(id) {
        if (!this.head) return false;

        if (this.head.id === id) {
            this.head = this.head.next;
            this.size--;
            return true;
        }

        let current = this.head;
        while (current.next && current.next.id !== id) {
            current = current.next;
        }

        if (current.next) {
            current.next = current.next.next;
            this.size--;
            return true;
        }
        return false;
    }

    searchIncident(id) {
        let current = this.head;
        while (current) {
            if (current.id === id) return current;
            current = current.next;
        }
        return null;
    }

    displayIncidents() {
        const incidents = [];
        let current = this.head;
        while (current) {
            incidents.push(current);
            current = current.next;
        }
        return incidents;
    }

    getVisualization() {
        const ids = [];
        let current = this.head;
        while (current) {
            ids.push(current.id);
            current = current.next;
        }
        ids.push("NULL");
        return ids.join(" &rarr; ");
    }
}

// --- APP STATE ---
const docHashTable = new HashTable();
const deviceGraph = new Graph();
const incidentList = new IncidentLinkedList();

// Load Initial Sample Data
function loadSampleData() {
    docHashTable.insert('suspicious.pdf', 'A12B45');
    docHashTable.insert('report.pdf', 'C78D21');
    docHashTable.insert('suspicious_copy.pdf', 'A12B45');
    
    // Step 3 Sample Devices
    deviceGraph.addDevice('D1', 'Student Device 1');
    deviceGraph.addDevice('D2', 'Student Device 2');
    deviceGraph.addDevice('D3', 'Student Device 3');
    deviceGraph.addDevice('D4', 'Student Device 4');

    // Step 3 Sample Connections
    deviceGraph.addConnection('D1', 'D2');
    deviceGraph.addConnection('D2', 'D3');
    deviceGraph.addConnection('D1', 'D4');

    // Step 6 Sample Incidents
    incidentList.insertIncident('INC001', 'suspicious.pdf', 'A12B45', 'D1', 'D2', 'Suspicious');
    incidentList.insertIncident('INC002', 'suspicious.pdf', 'A12B45', 'D2', 'D3', 'Suspicious');
    incidentList.insertIncident('INC003', 'suspicious.pdf', 'A12B45', 'D1', 'D4', 'Needs Investigation');

    updateUI();
}

// --- UI UPDATES ---
function updateUI() {
    updateDashboard();
    updateDocumentTable();
    updateDeviceTable();
    updateGraphVisualization();
    updateIncidentTable();
}

function updateDashboard() {
    const allDocs = docHashTable.getAllDocuments();
    const uniqueHashes = new Set(allDocs.map(d => d.hash)).size;
    
    let suspiciousCount = 0;
    const hashCounts = {};
    allDocs.forEach(d => {
        hashCounts[d.hash] = (hashCounts[d.hash] || 0) + 1;
    });
    
    for (const count of Object.values(hashCounts)) {
        if (count > 1) {
            suspiciousCount += count;
        }
    }

    document.getElementById('stat-total-docs').innerText = docHashTable.totalDocs;
    document.getElementById('stat-unique-hashes').innerText = uniqueHashes;
    document.getElementById('stat-suspicious-docs').innerText = suspiciousCount;
    
    // Step 3 Additions
    document.getElementById('stat-connected-devices').innerText = deviceGraph.adjacencyList.size;
    document.getElementById('stat-prop-connections').innerText = deviceGraph.totalConnections;
    
    document.getElementById('stat-total-incidents').innerText = incidentList.size;
    
    // Update Recent Suspicious Activity (using Incident List)
    const recentActivityArea = document.getElementById('dashboard-recent-activity');
    let activityHtml = '';
    const incidents = incidentList.displayIncidents();
    // Reverse to show newest first, assuming append at tail
    const recentIncidents = incidents.slice().reverse().slice(0, 5); // Show last 5
    if (recentIncidents.length > 0) {
        recentIncidents.forEach(inc => {
            let color = inc.status.includes('Suspicious') ? '#ff4d4d' : '#cccccc';
            activityHtml += `
                <div style="background: #1a1a1a; padding: 12px; border-radius: 4px; border-left: 3px solid ${color}; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong style="color: #ffffff;">${inc.docName}</strong>
                        <span style="font-family: monospace; color: #888; font-size: 12px;">${inc.hash}</span>
                    </div>
                    <div style="color: #aaaaaa; font-size: 13px; margin-bottom: 5px;">${inc.src} &rarr; ${inc.dest}</div>
                    <div style="color: ${color}; font-size: 12px; text-transform: uppercase;">${inc.status}</div>
                </div>
            `;
        });
    } else {
        activityHtml = `<p style="color: #666;">No recent activity.</p>`;
    }
    recentActivityArea.innerHTML = activityHtml;

    // Update Propagation Status
    let repeatedHashesCount = 0;
    for (const count of Object.values(hashCounts)) {
        if (count > 1) repeatedHashesCount++;
    }
    document.getElementById('status-repeated-hashes').innerText = repeatedHashesCount;
    document.getElementById('status-suspicious-docs').innerText = suspiciousCount;
    
    // Count incidents that need investigation
    let investigationReq = incidents.filter(i => i.status.includes('Investigation') || i.status.includes('Suspicious')).length;
    document.getElementById('status-investigation-req').innerText = investigationReq;
}

function updateDocumentTable() {
    const tableBody = document.querySelector('#doc-hash-table tbody');
    tableBody.innerHTML = ''; 
    
    const allDocs = docHashTable.getAllDocuments();
    const uniqueHashes = new Set(allDocs.map(d => d.hash)).size;
    
    // Count occurrences for status logic
    const hashCounts = {};
    allDocs.forEach(d => {
        hashCounts[d.hash] = (hashCounts[d.hash] || 0) + 1;
    });

    let repeatedHashes = 0;
    let docsRequiringInv = 0;
    
    for (const count of Object.values(hashCounts)) {
        if (count > 1) {
            repeatedHashes++;
        }
    }

    allDocs.forEach(doc => {
        const occurrences = hashCounts[doc.hash];
        let status = 'Unique Hash';
        let statusColor = '#cccccc';
        let investigation = 'No Action';
        let invColor = '#cccccc';
        let statusBadgeBg = '#222';
        let invBadgeBg = '#222';
        
        if (occurrences > 1) {
            status = 'Repeated Hash';
            statusColor = '#ffaa00'; // Warning/suspicious styling
            statusBadgeBg = '#332200';
            investigation = 'Needs Investigation';
            invColor = '#ff4d4d'; // Existing red accent
            invBadgeBg = '#331111';
            docsRequiringInv++;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${doc.name}</strong></td>
            <td style="font-family: monospace; color: #888;">${doc.hash}</td>
            <td><span style="background: ${statusBadgeBg}; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid ${statusColor}40;">${status}</span></td>
            <td>${occurrences}</td>
            <td><span style="background: ${invBadgeBg}; color: ${invColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${investigation}</span></td>
        `;
        tableBody.appendChild(tr);
    });

    // Update Document Analysis Overview Stats
    const totalDocsEl = document.getElementById('doc-stat-total');
    if (totalDocsEl) {
        totalDocsEl.innerText = allDocs.length;
        document.getElementById('doc-stat-unique').innerText = uniqueHashes;
        document.getElementById('doc-stat-repeated').innerText = repeatedHashes;
        document.getElementById('doc-stat-investigation').innerText = docsRequiringInv;
    }
}

// --- EVENT HANDLERS ---
function addDocument() {
    const nameInput = document.getElementById('doc-name-input');
    const hashInput = document.getElementById('doc-hash-input');
    
    const name = nameInput.value.trim();
    const hash = hashInput.value.trim();
    
    if (name && hash) {
        docHashTable.insert(name, hash);
        nameInput.value = '';
        hashInput.value = '';
        updateUI();
    }
}

function searchDocumentHash() {
    const searchInput = document.getElementById('search-hash-input');
    const hash = searchInput.value.trim();
    const resultsArea = document.getElementById('search-results-area');
    
    if (!hash) {
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `<div style="color: #ff4d4d; padding: 10px; background: #331111; border-radius: 4px;">Please enter a hash to search.</div>`;
        return;
    }
    
    const results = docHashTable.search(hash);
    
    resultsArea.style.display = 'block';
    if (results.length > 0) {
        let status = 'Unique Hash';
        let recommendation = 'No Action Needed';
        let notice = '';
        if (results.length > 1) {
            status = 'Repeated Hash';
            recommendation = 'Needs Investigation';
            notice = `<div style="margin-top: 15px; padding: 10px; background: #331111; border-left: 3px solid #ff4d4d; color: #ff4d4d; font-size: 13px;">Repeated document fingerprint detected.</div>`;
        }

        let docsList = results.map(d => `<div style="padding: 5px 0; border-bottom: 1px solid #333; color: #ccc;">${d}</div>`).join('');

        resultsArea.innerHTML = `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; border: 1px solid #333;">
                <h4 style="color: #fff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">DOCUMENT INVESTIGATION</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 13px;">
                    <div><strong style="color: #888;">Fingerprint</strong><br><span style="font-family: monospace;">${hash}</span></div>
                    <div><strong style="color: #888;">Matching Documents</strong><br>${results.length}</div>
                    <div><strong style="color: #888;">Status</strong><br><span style="color: ${results.length > 1 ? '#ffaa00' : '#ccc'};">${status}</span></div>
                    <div><strong style="color: #888;">Recommendation</strong><br><span style="color: ${results.length > 1 ? '#ff4d4d' : '#ccc'}; font-weight: bold;">${recommendation}</span></div>
                </div>

                <strong style="color: #888; font-size: 13px;">Documents:</strong>
                <div style="margin-top: 5px;">${docsList}</div>
                
                ${notice}
            </div>
        `;
    } else {
        resultsArea.innerHTML = `
            <div style="padding: 15px; background: #1a1a1a; border-radius: 4px; border: 1px dashed #444; color: #aaa;">
                No matching document fingerprint found.
            </div>
        `;
    }
}

function uiAddDevice() {
    const idInput = document.getElementById('dev-id-input');
    const nameInput = document.getElementById('dev-name-input');
    const msgArea = document.getElementById('dev-msg-area');
    
    const id = idInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();
    
    if (!id || !name) {
        msgArea.innerText = "Please provide both ID and Name.";
        return;
    }

    const added = deviceGraph.addDevice(id, name);
    if (added) {
        msgArea.style.color = '#cccccc';
        msgArea.innerText = `Device ${id} added successfully.`;
        idInput.value = '';
        nameInput.value = '';
        updateUI();
    } else {
        msgArea.style.color = '#ff4d4d';
        msgArea.innerText = `Device ${id} already exists.`;
    }
}

function uiAddConnection() {
    const srcInput = document.getElementById('conn-src-input');
    const destInput = document.getElementById('conn-dest-input');
    const msgArea = document.getElementById('conn-msg-area');
    
    const src = srcInput.value.trim().toUpperCase();
    const dest = destInput.value.trim().toUpperCase();
    
    if (!src || !dest) {
        msgArea.innerText = "Please provide both Source and Destination IDs.";
        return;
    }

    const result = deviceGraph.addConnection(src, dest);
    if (result === "Success") {
        msgArea.style.color = '#cccccc';
        msgArea.innerText = `Connection ${src} <-> ${dest} added successfully.`;
        srcInput.value = '';
        destInput.value = '';
        updateUI();
    } else {
        msgArea.style.color = '#ff4d4d';
        msgArea.innerText = result;
    }
}

function updateDeviceTable() {
    const tableBody = document.querySelector('#device-table tbody');
    if(tableBody) tableBody.innerHTML = '';
    
    const relTableBody = document.querySelector('#relationships-table tbody');
    if (relTableBody) relTableBody.innerHTML = '';
    
    let totalDevices = 0;
    let connectedDevices = 0;
    let isolatedDevices = 0;

    deviceGraph.deviceNames.forEach((name, id) => {
        totalDevices++;
        const connections = deviceGraph.adjacencyList.get(id) || [];
        
        let hasInbound = false;
        deviceGraph.adjacencyList.forEach((conns) => {
            if (conns.includes(id)) hasInbound = true;
        });
        
        let networkStatus = 'Connected';
        let statusColor = '#aaaaaa';
        let statusBadgeBg = '#222';
        
        if (connections.length > 0 || hasInbound) {
            connectedDevices++;
            networkStatus = 'Connected';
            statusColor = '#ff4d4d';
            statusBadgeBg = '#331111';
        } else {
            isolatedDevices++;
            networkStatus = 'Isolated';
            statusColor = '#888888';
            statusBadgeBg = '#111';
        }

        if(tableBody) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${id}</strong></td>
                <td>${name}</td>
                <td>${connections.length}</td>
                <td><span style="background: ${statusBadgeBg}; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid ${statusColor}40;">${networkStatus}</span></td>
            `;
            tableBody.appendChild(tr);
        }
        
        // Populate relationships table
        if (relTableBody && connections.length > 0) {
            connections.forEach(dest => {
                const trRel = document.createElement('tr');
                trRel.innerHTML = `
                    <td><strong>${id}</strong></td>
                    <td><strong>${dest}</strong></td>
                    <td><span style="color: #ff4d4d;">Connected</span></td>
                `;
                relTableBody.appendChild(trRel);
            });
        }
    });
    
    // Update Overview Stats
    const devTotalEl = document.getElementById('dev-stat-total');
    if (devTotalEl) {
        devTotalEl.innerText = totalDevices;
        document.getElementById('dev-stat-connected').innerText = connectedDevices;
        document.getElementById('dev-stat-connections').innerText = deviceGraph.totalConnections;
        document.getElementById('dev-stat-isolated').innerText = isolatedDevices;
    }
}

function updatePropagationInvestigationUI() {
    const devicesCount = deviceGraph.deviceNames.size;
    
    const propDevEl = document.getElementById('prop-stat-devices');
    if (propDevEl) {
        let connectedDevices = 0;
        deviceGraph.deviceNames.forEach((name, id) => {
            const connections = deviceGraph.adjacencyList.get(id) || [];
            let hasInbound = false;
            deviceGraph.adjacencyList.forEach((conns) => {
                if (conns.includes(id)) hasInbound = true;
            });
            if (connections.length > 0 || hasInbound) connectedDevices++;
        });

        propDevEl.innerText = connectedDevices;
        document.getElementById('prop-stat-connections').innerText = deviceGraph.totalConnections;
        
        const incidents = incidentList.displayIncidents();
        const docsUnderInv = new Set(incidents.filter(i => i.status.includes('Investigation') || i.status.includes('Suspicious')).map(i => i.hash)).size;
        document.getElementById('prop-stat-docs').innerText = docsUnderInv;
        
        // Document Propagation Context
        const contextArea = document.getElementById('prop-context-area');
        if (incidents.length > 0) {
            // Find most recent suspicious document
            const latestSuspicious = incidents.slice().reverse().find(i => i.status.includes('Suspicious') || i.status.includes('Investigation'));
            if (latestSuspicious) {
                // Find all existing rels in graph that match this incident's src/dest (mocking context)
                let relHtml = '';
                deviceGraph.adjacencyList.forEach((conns, src) => {
                    conns.forEach(dest => {
                        relHtml += `<div>${src} &rarr; ${dest}</div>`;
                    });
                });
                contextArea.innerHTML = `
                    <div style="margin-bottom: 5px;"><strong style="color:#888;">Document:</strong> ${latestSuspicious.docName}</div>
                    <div style="margin-bottom: 5px;"><strong style="color:#888;">Hash:</strong> <span style="font-family: monospace;">${latestSuspicious.hash}</span></div>
                    <div style="margin-bottom: 10px;"><strong style="color:#888;">Status:</strong> <span style="color:#ff4d4d; font-weight:bold;">Suspicious / Needs Investigation</span></div>
                    <div style="margin-bottom: 5px; color:#888;">Possible propagation relationships:</div>
                    <div style="color:#ccc;">${relHtml || 'None'}</div>
                `;
            } else {
                contextArea.innerHTML = `<div style="color:#888;">No suspicious documents under investigation.</div>`;
            }
        } else {
            contextArea.innerHTML = `<div style="color:#888;">No documents under investigation.</div>`;
        }
        
        // Start Device Dropdown
        const startSelect = document.getElementById('trace-start-device');
        startSelect.innerHTML = '';
        if (devicesCount === 0) {
            startSelect.innerHTML = `<option value="">No devices available</option>`;
        } else {
            deviceGraph.deviceNames.forEach((name, id) => {
                startSelect.innerHTML += `<option value="${id}">${id} - ${name}</option>`;
            });
        }
    }
}

function updateGraphVisualization() {
    const visArea = document.getElementById('graph-vis-area');
    if (!visArea) return;
    
    if (deviceGraph.deviceNames.size === 0) {
        visArea.innerHTML = `<div style="color:#888;">No devices available for propagation analysis.</div>`;
        return;
    }
    
    if (deviceGraph.totalConnections === 0) {
        visArea.innerHTML = `<div style="color:#888;">Connect devices to perform propagation analysis.</div>`;
        return;
    }

    let output = `<strong style="color: #ff4d4d;">Adjacency List Mapping:</strong>\n\n`;
    
    deviceGraph.adjacencyList.forEach((connections, id) => {
        if (connections.length > 0) {
            output += `${id} &mdash; ${connections.join(', ')}\n`;
        } else {
            output += `${id} (isolated)\n`;
        }
    });

    visArea.innerHTML = output;
    
    updatePropagationInvestigationUI();
}

function runPropagationTrace() {
    const startDev = document.getElementById('trace-start-device').value.trim();
    const method = document.getElementById('trace-method').value;
    const resultArea = document.getElementById('trace-result-area');
    
    if (!startDev || !deviceGraph.adjacencyList.has(startDev)) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = `<div style="color: #ff4d4d; padding: 15px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px;">Please select a valid device.</div>`;
        return;
    }
    
    const connections = deviceGraph.adjacencyList.get(startDev) || [];
    let hasInbound = false;
    deviceGraph.adjacencyList.forEach((conns) => {
        if (conns.includes(startDev)) hasInbound = true;
    });
    
    if (connections.length === 0 && !hasInbound) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = `<div style="color: #ffaa00; padding: 15px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px;">Device is currently isolated. No propagation relationship available.</div>`;
        return;
    }

    resultArea.style.display = 'block';
    
    if (method === 'BFS') {
        const queue = new Queue();
        const visited = new Set();
        const path = [];
        let queueStates = [];

        queue.enqueue(startDev);
        visited.add(startDev);
        queueStates.push("Queue State\n\n" + queue.display());

        while (!queue.isEmpty()) {
            const current = queue.dequeue();
            path.push(current);
            
            const neighbors = deviceGraph.adjacencyList.get(current) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.enqueue(neighbor);
                }
            }
            
            if (!queue.isEmpty()) {
                queueStates.push("then\n\n" + queue.display());
            } else {
                queueStates.push("then\n\n[Empty]");
            }
        }

        let sequenceHtml = `<div style="font-family: monospace; color: #ccc; margin-top: 10px;">START<br>${path.join('<br>&darr;<br>')}</div>`;

        resultArea.innerHTML = `
            <div style="background: #1a1a1a; padding: 20px; border-radius: 4px; border: 1px solid #333;">
                <h3 style="color: #ffffff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">Level-by-Level Propagation Trace</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="color: #ff4d4d; margin-bottom: 10px; font-size: 14px;">Propagation Trace Result</h4>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Start Device:</strong> ${startDev}</div>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Method:</strong> BFS</div>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Devices Traversed:</strong> ${path.length}</div>
                        <div style="font-size: 13px; margin-bottom: 15px;"><strong style="color: #888;">Status:</strong> <span style="color: #cccccc;">Analysis Complete</span></div>
                        
                        <strong style="color: #888; font-size: 13px;">Possible connected-device traversal:</strong>
                        ${sequenceHtml}
                    </div>
                    
                    <div style="background: #121212; padding: 15px; border-radius: 4px; border: 1px dashed #333;">
                        <h4 style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Technical Execution</h4>
                        <div style="font-size: 12px; color: #ccc; margin-bottom: 15px;">
                            <strong>Traversal Method:</strong> BFS<br>
                            <strong>Data Structure:</strong> Queue<br>
                            <strong>Purpose:</strong> Explores connected devices level by level.
                        </div>
                        <pre style="color: #888; font-family: monospace; white-space: pre-wrap; font-size: 12px; margin: 0;">${queueStates.join('\n\n')}</pre>
                    </div>
                </div>
            </div>
        `;
    } else {
        // DFS
        const visited = new Set();
        const path = [];
        const steps = [];
        let stepCounter = 1;

        function dfsUtil(current) {
            visited.add(current);
            path.push(current);
            steps.push(`Step ${stepCounter++} &rarr; ${current}`);

            const neighbors = deviceGraph.adjacencyList.get(current) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfsUtil(neighbor);
                }
            }
        }

        dfsUtil(startDev);
        
        let sequenceHtml = `<div style="font-family: monospace; color: #ccc; margin-top: 10px;">START<br>${path.join('<br>&darr;<br>')}</div>`;

        resultArea.innerHTML = `
            <div style="background: #1a1a1a; padding: 20px; border-radius: 4px; border: 1px solid #333;">
                <h3 style="color: #ffffff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">Depth-Oriented Propagation Trace</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="color: #ff4d4d; margin-bottom: 10px; font-size: 14px;">Propagation Trace Result</h4>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Start Device:</strong> ${startDev}</div>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Method:</strong> DFS</div>
                        <div style="font-size: 13px; margin-bottom: 5px;"><strong style="color: #888;">Devices Traversed:</strong> ${path.length}</div>
                        <div style="font-size: 13px; margin-bottom: 15px;"><strong style="color: #888;">Status:</strong> <span style="color: #cccccc;">Analysis Complete</span></div>
                        
                        <strong style="color: #888; font-size: 13px;">Possible propagation trace:</strong>
                        ${sequenceHtml}
                    </div>
                    
                    <div style="background: #121212; padding: 15px; border-radius: 4px; border: 1px dashed #333;">
                        <h4 style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Technical Execution</h4>
                        <div style="font-size: 12px; color: #ccc; margin-bottom: 15px;">
                            <strong>Traversal Method:</strong> DFS<br>
                            <strong>Implementation:</strong> Recursive Depth-First Traversal<br>
                            <strong>Purpose:</strong> Explores one connected path deeply before backtracking.
                        </div>
                        <pre style="color: #888; font-family: monospace; white-space: pre-wrap; font-size: 12px; margin: 0;">${steps.join('\n')}</pre>
                    </div>
                </div>
            </div>
        `;
    }
}

function uiAddIncident() {
    const id = document.getElementById('inc-id-input').value.trim();
    const doc = document.getElementById('inc-doc-input').value.trim();
    const hash = document.getElementById('inc-hash-input').value.trim();
    const src = document.getElementById('inc-src-input').value.trim();
    const dest = document.getElementById('inc-dest-input').value.trim();
    const status = document.getElementById('inc-status-input').value.trim();
    const msgArea = document.getElementById('inc-msg-area');
    
    if (!id || !doc || !hash || !src || !dest || !status) {
        msgArea.innerText = "Please fill out all fields.";
        return;
    }
    
    if (incidentList.searchIncident(id)) {
        msgArea.innerText = "Incident ID already exists.";
        return;
    }

    incidentList.insertIncident(id, doc, hash, src, dest, status);
    
    // Clear inputs
    document.getElementById('inc-id-input').value = '';
    document.getElementById('inc-doc-input').value = '';
    document.getElementById('inc-hash-input').value = '';
    document.getElementById('inc-src-input').value = '';
    document.getElementById('inc-dest-input').value = '';
    document.getElementById('inc-status-input').value = '';
    
    msgArea.style.color = '#cccccc';
    msgArea.innerText = `Incident ${id} added successfully.`;
    
    updateUI();
}

function uiSearchIncident() {
    const searchInput = document.getElementById('search-inc-input').value.trim();
    const resultArea = document.getElementById('search-inc-result');
    
    if (!searchInput) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = `<div style="color: #ff4d4d; padding: 10px; background: #331111; border-radius: 4px;">Please enter an Incident ID to search.</div>`;
        return;
    }
    
    const incident = incidentList.searchIncident(searchInput);
    
    resultArea.style.display = 'block';
    if (incident) {
        const isSuspicious = incident.status.includes('Suspicious');
        const badgeColor = isSuspicious ? '#ffaa00' : '#ff4d4d';
        const badgeBg = isSuspicious ? '#332200' : '#331111';

        resultArea.innerHTML = `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; border: 1px solid #333;">
                <h4 style="color: #ff4d4d; margin-bottom: 10px; font-size: 14px;">Investigation Record Found</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                    <div><strong style="color: #888;">Incident ID:</strong> ${incident.id}</div>
                    <div><strong style="color: #888;">Status:</strong> <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 3px 6px; border-radius: 3px; font-size: 11px; border: 1px solid ${badgeColor}40;">${incident.status}</span></div>
                    <div><strong style="color: #888;">Document:</strong> ${incident.docName}</div>
                    <div><strong style="color: #888;">Hash:</strong> <span style="font-family: monospace;">${incident.hash}</span></div>
                    <div style="grid-column: 1 / -1;"><strong style="color: #888;">Propagation Relationship:</strong> ${incident.src} &rarr; ${incident.dest}</div>
                </div>
            </div>
        `;
    } else {
        resultArea.innerHTML = `
            <div style="padding: 15px; background: #1a1a1a; border-radius: 4px; border: 1px dashed #444; color: #aaa;">
                No investigation record found for this Incident ID.
            </div>
        `;
    }
}

function uiDeleteIncident(id) {
    if (incidentList.deleteIncident(id)) {
        updateUI();
    }
}

function updateIncidentTable() {
    const timelineArea = document.getElementById('incident-timeline-area');
    if(timelineArea) timelineArea.innerHTML = '';
    
    const incidents = incidentList.displayIncidents();
    
    let totalIncidents = incidents.length;
    let suspiciousIncidents = 0;
    let invReq = 0;
    let docsInvolved = new Set();
    
    if(incidents.length === 0) {
        if(timelineArea) {
            timelineArea.innerHTML = `
                <div style="padding: 20px; background: #151515; border-radius: 4px; border: 1px dashed #333; text-align: center;">
                    <div style="color: #aaa; margin-bottom: 5px;">No investigation records available.</div>
                    <div style="color: #777; font-size: 12px;">Recorded incidents will appear here after document propagation analysis.</div>
                </div>
            `;
        }
    } else {
        incidents.forEach((inc, index) => {
            docsInvolved.add(inc.hash);
            if (inc.status.includes('Suspicious')) suspiciousIncidents++;
            if (inc.status.includes('Investigation')) invReq++;
            
            if(timelineArea) {
                const isSuspicious = inc.status.includes('Suspicious');
                const badgeColor = isSuspicious ? '#ffaa00' : '#ff4d4d';
                const badgeBg = isSuspicious ? '#332200' : '#331111';
                
                const card = document.createElement('div');
                card.style.background = '#1a1a1a';
                card.style.border = '1px solid #333';
                card.style.borderRadius = '4px';
                card.style.padding = '15px';
                card.style.marginBottom = index === incidents.length - 1 ? '0' : '15px';
                card.style.position = 'relative';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #fff; font-size: 16px;">${inc.id}</div>
                        <div>
                            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; border: 1px solid ${badgeColor}40;">${inc.status}</span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; color: #ccc; margin-bottom: 15px;">
                        <div><strong style="color: #888;">Document:</strong><br>${inc.docName}</div>
                        <div><strong style="color: #888;">Hash:</strong><br><span style="font-family: monospace;">${inc.hash}</span></div>
                        <div style="grid-column: 1 / -1;"><strong style="color: #888;">Propagation Relationship:</strong><br>${inc.src} &rarr; ${inc.dest}</div>
                    </div>
                    
                    <div style="text-align: right;">
                        <button class="placeholder-btn" style="padding: 4px 10px; font-size: 11px; background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d;" onclick="if(confirm('This will permanently remove the incident from the investigation history. Proceed?')) uiDeleteIncident('${inc.id}')">Remove Record</button>
                    </div>
                `;
                timelineArea.appendChild(card);
                
                if (index < incidents.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.innerHTML = `&darr;`;
                    arrow.style.textAlign = 'center';
                    arrow.style.color = '#555';
                    arrow.style.marginBottom = '15px';
                    arrow.style.fontSize = '18px';
                    timelineArea.appendChild(arrow);
                }
            }
        });
    }
    
    const vizArea = document.getElementById('ll-visualization');
    if (vizArea) vizArea.innerHTML = incidentList.getVisualization();
    
    // Update Overview Stats
    const incTotalEl = document.getElementById('inc-stat-total');
    if (incTotalEl) {
        incTotalEl.innerText = totalIncidents;
        document.getElementById('inc-stat-suspicious').innerText = suspiciousIncidents;
        document.getElementById('inc-stat-req').innerText = invReq;
        document.getElementById('inc-stat-docs').innerText = docsInvolved.size;
    }
}

function globalSearch() {
    const searchType = document.getElementById('global-search-type').value;
    const searchInput = document.getElementById('global-search-input').value.trim();
    const resultArea = document.getElementById('global-search-result');

    if (!searchInput) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = `<div style="color: #ff4d4d; padding: 15px; background: #331111; border-radius: 4px; border: 1px solid #ff4d4d40;">Please enter a search value.</div>`;
        return;
    }

    resultArea.style.display = 'block';
    let html = '';
    
    const noResultHtml = `
        <div style="padding: 20px; background: #1a1a1a; border-radius: 4px; border: 1px dashed #444; text-align: center;">
            <div style="color: #ff4d4d; margin-bottom: 10px; font-weight: bold;">No matching investigation record found.</div>
            <div style="color: #aaa; font-size: 13px;">Try another document hash, document name, device ID, or incident ID.</div>
        </div>
    `;

    if (searchType === 'hash') {
        const results = docHashTable.search(searchInput);
        if (results.length > 0) {
            let status = 'Unique Hash';
            let recommendation = 'No Action Needed';
            if (results.length > 1) {
                status = 'Repeated Hash &mdash; Needs Investigation';
                recommendation = 'Review matching documents and their related propagation records.';
            }

            let docsList = results.map(d => `<div style="padding: 5px 0; border-bottom: 1px solid #333; color: #ccc;">&bull; ${d}</div>`).join('');

            html = `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 4px; border: 1px solid #333;">
                    <h4 style="color: #ffffff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">Search Result <span style="color: #888; font-size: 12px; font-weight: normal; float: right;">Source: Document Analysis</span></h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 13px;">
                        <div><strong style="color: #888;">Fingerprint:</strong><br><span style="font-family: monospace;">${searchInput}</span></div>
                        <div><strong style="color: #888;">Matching Documents:</strong><br>${results.length}</div>
                        <div style="grid-column: 1 / -1;"><strong style="color: #888;">Status:</strong><br><span style="color: ${results.length > 1 ? '#ffaa00' : '#ccc'};">${status}</span></div>
                        <div style="grid-column: 1 / -1;"><strong style="color: #888;">Recommendation:</strong><br><span style="color: ${results.length > 1 ? '#ff4d4d' : '#ccc'};">${recommendation}</span></div>
                    </div>

                    <strong style="color: #888; font-size: 13px;">Documents:</strong>
                    <div style="margin-top: 5px; background: #121212; padding: 10px; border-radius: 4px; border: 1px solid #222;">${docsList}</div>
                </div>
            `;
        } else {
            html = noResultHtml;
        }
    } else if (searchType === 'name') {
        const allDocs = docHashTable.getAllDocuments();
        const results = allDocs.filter(d => d.name.toLowerCase() === searchInput.toLowerCase());
        
        if (results.length > 0) {
            html += `<h4 style="color: #ffffff; margin-bottom: 15px;">${results.length} matching document(s) found</h4>`;
            
            results.forEach(d => {
                const incidents = incidentList.displayIncidents();
                const relatedIncidents = incidents.filter(i => i.docName === d.name);
                
                let relatedHtml = relatedIncidents.length > 0 
                    ? relatedIncidents.map(i => `<div style="color: #ccc;">&bull; ${i.id} (${i.status})</div>`).join('')
                    : '<div style="color: #777;">No related investigation records</div>';
                
                let docStatus = 'Analyzed';
                if (relatedIncidents.some(i => i.status.includes('Suspicious'))) docStatus = 'Suspicious';
                else if (relatedIncidents.some(i => i.status.includes('Investigation'))) docStatus = 'Needs Investigation';

                html += `
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; border: 1px solid #333; margin-bottom: 15px;">
                        <h4 style="color: #ff4d4d; margin-bottom: 10px; font-size: 14px;">Document Record <span style="color: #888; font-size: 11px; font-weight: normal; float: right;">Source: Document Analysis</span></h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 15px;">
                            <div><strong style="color: #888;">Document:</strong><br>${d.name}</div>
                            <div><strong style="color: #888;">Hash:</strong><br><span style="font-family: monospace;">${d.hash}</span></div>
                            <div style="grid-column: 1 / -1;"><strong style="color: #888;">Status:</strong><br><span style="color: ${docStatus === 'Analyzed' ? '#ccc' : '#ffaa00'};">${docStatus}</span></div>
                        </div>
                        <strong style="color: #888; font-size: 13px;">Related Investigation Records:</strong>
                        <div style="margin-top: 5px; background: #121212; padding: 10px; border-radius: 4px; border: 1px solid #222;">${relatedHtml}</div>
                    </div>
                `;
            });
        } else {
            html = noResultHtml;
        }
    } else if (searchType === 'device') {
        const upperDev = searchInput.toUpperCase();
        if (deviceGraph.adjacencyList.has(upperDev)) {
            const devName = deviceGraph.deviceNames.get(upperDev) || 'Unknown Device';
            const connections = deviceGraph.adjacencyList.get(upperDev) || [];
            
            let hasInbound = false;
            deviceGraph.adjacencyList.forEach((conns) => {
                if (conns.includes(upperDev)) hasInbound = true;
            });
            
            const isConnected = connections.length > 0 || hasInbound;
            const netStatus = isConnected ? 'Connected' : 'Isolated';
            const netColor = isConnected ? '#ff4d4d' : '#888';
            
            let connHtml = connections.length > 0 
                ? connections.map(dest => `<div style="color: #ccc;">&bull; ${dest}</div>`).join('')
                : '<div style="color: #777;">No outbound connections</div>';

            html = `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 4px; border: 1px solid #333;">
                    <h4 style="color: #ffffff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">Device Record <span style="color: #888; font-size: 12px; font-weight: normal; float: right;">Source: Device Network</span></h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 13px;">
                        <div><strong style="color: #888;">Device ID:</strong><br>${upperDev}</div>
                        <div><strong style="color: #888;">Device Name:</strong><br>${devName}</div>
                        <div style="grid-column: 1 / -1;"><strong style="color: #888;">Network Status:</strong><br><span style="color: ${netColor};">${netStatus}</span></div>
                    </div>

                    <strong style="color: #888; font-size: 13px;">Propagation Connections:</strong>
                    <div style="margin-top: 5px; background: #121212; padding: 10px; border-radius: 4px; border: 1px solid #222;">${connHtml}</div>
                </div>
            `;
        } else {
            html = noResultHtml;
        }
    } else if (searchType === 'incident') {
        const upperInc = searchInput.toUpperCase();
        const incident = incidentList.searchIncident(upperInc);
        if (incident) {
            const isSuspicious = incident.status.includes('Suspicious');
            const statusColor = isSuspicious ? '#ffaa00' : '#ff4d4d';

            html = `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 4px; border: 1px solid #333;">
                    <h4 style="color: #ffffff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">Investigation Record <span style="color: #888; font-size: 12px; font-weight: normal; float: right;">Source: Investigation Timeline</span></h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
                        <div><strong style="color: #888;">Incident ID:</strong><br>${incident.id}</div>
                        <div><strong style="color: #888;">Status:</strong><br><span style="color: ${statusColor};">${incident.status}</span></div>
                        <div><strong style="color: #888;">Document:</strong><br>${incident.docName}</div>
                        <div><strong style="color: #888;">Hash:</strong><br><span style="font-family: monospace;">${incident.hash}</span></div>
                        <div style="grid-column: 1 / -1;"><strong style="color: #888;">Relationship:</strong><br>${incident.src} &rarr; ${incident.dest}</div>
                    </div>
                </div>
            `;
        } else {
            html = noResultHtml;
        }
    }

    resultArea.innerHTML = html;
}

// Init
window.onload = () => {
    loadSampleData();
};
