# Malicious Document Propagation Analyzer using Graph and Hashing

## 1. Problem Statement
In institutional environments, tracking the propagation of documents across various devices is critical for identifying suspicious patterns. The objective of this project is to develop a defensive cybersecurity analysis system that simulates and tracks how a potentially suspicious document spreads between connected devices. The system utilizes core Data Structures including Hashing for storing and verifying document signatures, Graphs for representing device-to-device network topology, Linked Lists for maintaining incident histories chronologically, and Queue/Recursion for BFS/DFS traversal respectively to trace document propagation pathways.

## 2. Algorithm
1. **Hashing (Document Storage & Search):**
   - Initialize an array `hashTable` of size `HASH_SIZE`.
   - Compute the index using a polynomial rolling hash function on the document's SHA-256 style hash string.
   - Store the document details in a separate chaining structure (Linked List at each table index).
   - For searching, hash the input string and traverse the chain at the computed index to identify identical hashes.

2. **Graph Construction (Device Network):**
   - Read the list of devices and assign each a unique integer index.
   - For every connection `U -> V`, update the adjacency matrix `adjMatrix[U][V] = 1` and `adjMatrix[V][U] = 1`.

3. **Propagation Trace (BFS / Level-by-Level):**
   - Initialize an empty Queue and a `visited` array.
   - Enqueue the starting device node and mark it visited.
   - While the Queue is not empty:
     - Dequeue the front node and add to propagation path.
     - For all unvisited adjacent nodes, mark them visited and enqueue.

4. **Propagation Trace (DFS / Depth-wise):**
   - Initialize a `visited` array.
   - Call a recursive utility function passing the starting node.
   - Mark the current node as visited and append to propagation path.
   - Iterate through adjacent nodes and recursively call the utility for unvisited nodes.

5. **Incident History (Linked List):**
   - Create a Linked List `Incident`.
   - For each new propagation event, allocate a new `Incident` node, insert it at the head (or tail), and maintain chronological records.

## 3. Source Code
The project is built with a backend implemented in C to process the core Data Structures and a Python Flask server serving a modern HTML/CSS/JS interface. 

*(Please refer to the `backend.c` file for the complete core C logic and `app.py` for the API bridge).*

## 4. Output
- **Dashboard:** Displays total documents, unique hashes, suspicious documents, connected devices, and propagation connections.
- **Hash Search Output:**
  - Input: `A12B45`
  - Output: `suspicious.pdf`, `suspicious_copy.pdf` (Same hash detected).
- **BFS Output:** 
  - Starting device: `D1`
  - Output: `D1 D2 D4 D3`
- **DFS Output:**
  - Starting device: `D1`
  - Output: `D1 D2 D3 D4`
- **Incident History:** Displays incidents chronologically (e.g., `INC001: suspicious.pdf, D1 -> D2`).

## 5. Conclusion
This micro project successfully demonstrates the practical application of fundamental Data Structures in a cybersecurity context. By utilizing Hashing, Graph representations, and BFS/DFS traversals, the system efficiently simulates and analyzes the spread of suspicious files across a network, providing a solid foundation for understanding defensive propagation tracking without introducing actual malicious components.
