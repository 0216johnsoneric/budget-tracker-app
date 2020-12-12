let db ;
const request = window.indexedDB.open("budget", 1)

request.onupgradeneeded = event => {
    db = event.target.result
    const pending = db.createObjectStore("pending", {autoIncrement: true});
    pending.createIndex("statusIndex", "status");
} 

request.onsuccess = event => { 
    db = event.target.result;

    if(navigator.onLine) {
        checkData();
    }
}

request.onerror = event => {console.log(event)};

function saveRecord(record) {
    db = request.result;
    const transaction = db.transaction(["pending"], "readwrite");
    const transpending = transaction.objectStore("pending");

    transpending.add(record)
}

function checkData() {
    const checkTransaction = db.transaction(["pending"], "readwrite");
    const checking = checkTransaction.objectStore("pending");
    const getAll = checking.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(()=> {
            const succTransaction = db.transaction(["pending"], "readwrite");
            const success = succTransaction.objectStore("pending");
            success.clear();
        })
        }
    }
}

window.addEventListener("online", checkData)