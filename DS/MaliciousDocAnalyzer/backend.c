#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_NODES 100
#define HASH_SIZE 101

// ------------------- Data Structures -------------------

// 1. Queue for BFS
typedef struct Queue {
    int items[MAX_NODES];
    int front;
    int rear;
} Queue;

Queue* createQueue() {
    Queue* q = malloc(sizeof(Queue));
    q->front = -1;
    q->rear = -1;
    return q;
}
int isEmpty(Queue* q) { return q->rear == -1; }
void enqueue(Queue* q, int value) {
    if (q->rear == MAX_NODES - 1) return;
    if (q->front == -1) q->front = 0;
    q->rear++;
    q->items[q->rear] = value;
}
int dequeue(Queue* q) {
    int item;
    if (isEmpty(q)) return -1;
    item = q->items[q->front];
    q->front++;
    if (q->front > q->rear) { q->front = q->rear = -1; }
    return item;
}

// 2. Linked List for Incidents
typedef struct Incident {
    char id[20];
    char docName[100];
    char hash[100];
    char src[50];
    char dest[50];
    char status[50];
    char date[50];
    struct Incident* next;
} Incident;

Incident* incidentHead = NULL;
void addIncident(char* id, char* docName, char* hash, char* src, char* dest, char* status, char* date) {
    Incident* newIncident = (Incident*)malloc(sizeof(Incident));
    strcpy(newIncident->id, id);
    strcpy(newIncident->docName, docName);
    strcpy(newIncident->hash, hash);
    strcpy(newIncident->src, src);
    strcpy(newIncident->dest, dest);
    strcpy(newIncident->status, status);
    strcpy(newIncident->date, date);
    newIncident->next = incidentHead;
    incidentHead = newIncident;
}

// 3. Hashing for Documents
typedef struct DocNode {
    char name[100];
    char hash[100];
    struct DocNode* next;
} DocNode;
DocNode* hashTable[HASH_SIZE];

unsigned int hashFunction(char* str) {
    unsigned int hash = 5381;
    int c;
    while ((c = *str++))
        hash = ((hash << 5) + hash) + c;
    return hash % HASH_SIZE;
}

void insertHash(char* name, char* hash) {
    unsigned int index = hashFunction(hash);
    DocNode* newNode = (DocNode*)malloc(sizeof(DocNode));
    strcpy(newNode->name, name);
    strcpy(newNode->hash, hash);
    newNode->next = hashTable[index];
    hashTable[index] = newNode;
}

void searchHash(char* hash) {
    unsigned int index = hashFunction(hash);
    DocNode* current = hashTable[index];
    int count = 0;
    printf("SEARCH_RESULT_START\n");
    while (current != NULL) {
        if (strcmp(current->hash, hash) == 0) {
            printf("%s\n", current->name);
            count++;
        }
        current = current->next;
    }
    if (count > 1) {
        printf("Same hash detected.\n");
    } else if (count == 1) {
        printf("Unique hash.\n");
    } else {
        printf("Hash not found.\n");
    }
    printf("SEARCH_RESULT_END\n");
}

// 4. Graph for Devices
char devices[MAX_NODES][50];
int adjMatrix[MAX_NODES][MAX_NODES];
int numDevices = 0;

int getDeviceIndex(char* name) {
    for (int i = 0; i < numDevices; i++) {
        if (strcmp(devices[i], name) == 0) return i;
    }
    strcpy(devices[numDevices], name);
    return numDevices++;
}

void addEdge(char* u, char* v) {
    int i = getDeviceIndex(u);
    int j = getDeviceIndex(v);
    adjMatrix[i][j] = 1;
    adjMatrix[j][i] = 1; // Undirected for analysis
}

// 5. BFS
void BFS(int startVertex) {
    Queue* q = createQueue();
    int visited[MAX_NODES] = {0};
    
    printf("BFS_RESULT_START\n");
    visited[startVertex] = 1;
    enqueue(q, startVertex);
    
    while (!isEmpty(q)) {
        int currentVertex = dequeue(q);
        printf("%s ", devices[currentVertex]);
        
        for (int i = 0; i < numDevices; i++) {
            if (adjMatrix[currentVertex][i] == 1 && !visited[i]) {
                visited[i] = 1;
                enqueue(q, i);
            }
        }
    }
    printf("\nBFS_RESULT_END\n");
}

// 6. DFS
void DFSUtil(int vertex, int visited[]) {
    visited[vertex] = 1;
    printf("%s ", devices[vertex]);
    
    for (int i = 0; i < numDevices; i++) {
        if (adjMatrix[vertex][i] == 1 && !visited[i]) {
            DFSUtil(i, visited);
        }
    }
}
void DFS(int startVertex) {
    int visited[MAX_NODES] = {0};
    printf("DFS_RESULT_START\n");
    DFSUtil(startVertex, visited);
    printf("\nDFS_RESULT_END\n");
}

int main(int argc, char* argv[]) {
    for (int i = 0; i < HASH_SIZE; i++) hashTable[i] = NULL;
    for (int i = 0; i < MAX_NODES; i++) {
        for (int j = 0; j < MAX_NODES; j++) adjMatrix[i][j] = 0;
    }

    int nDocs;
    scanf("%d", &nDocs);
    for (int i = 0; i < nDocs; i++) {
        char name[100], hash[100];
        scanf("%s %s", name, hash);
        insertHash(name, hash);
    }

    int nDevs;
    scanf("%d", &nDevs);
    for (int i = 0; i < nDevs; i++) {
        char dev[50];
        scanf("%s", dev);
        getDeviceIndex(dev);
    }

    int nConns;
    scanf("%d", &nConns);
    for (int i = 0; i < nConns; i++) {
        char u[50], v[50];
        scanf("%s %s", u, v);
        addEdge(u, v);
    }

    int nIncs;
    scanf("%d", &nIncs);
    for (int i = 0; i < nIncs; i++) {
        char id[20], doc[100], hash[100], src[50], dest[50], stat[50], date[50];
        scanf("%s %s %s %s %s %s %s", id, doc, hash, src, dest, stat, date);
        addIncident(id, doc, hash, src, dest, stat, date);
    }

    char cmd[50];
    scanf("%s", cmd);

    if (strcmp(cmd, "SEARCH_HASH") == 0) {
        char hash[100];
        scanf("%s", hash);
        searchHash(hash);
    } else if (strcmp(cmd, "BFS") == 0) {
        char startDev[50];
        scanf("%s", startDev);
        int idx = getDeviceIndex(startDev);
        BFS(idx);
    } else if (strcmp(cmd, "DFS") == 0) {
        char startDev[50];
        scanf("%s", startDev);
        int idx = getDeviceIndex(startDev);
        DFS(idx);
    }

    return 0;
}
