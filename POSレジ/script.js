// カートを管理する配列
let cart = [];

// カートに商品を追加する関数
function addToCart(name, price) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        cart[itemIndex].quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
}

// カートを更新して、割引や合計金額を表示する
function updateCart() {
    const cartTable = document.getElementById('cart-table').getElementsByTagName('tbody')[0];
    cartTable.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        const row = cartTable.insertRow();
        row.insertCell(0).textContent = item.name;
        row.insertCell(1).textContent = item.price;
        row.insertCell(2).textContent = item.quantity;
        row.insertCell(3).textContent = subtotal;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.onclick = () => {
            cart.splice(index, 1);
            updateCart();
        };
        row.insertCell(4).appendChild(deleteBtn);
    });

    total = applyDiscount(cart);
    document.getElementById('total-price').textContent = total;
}

// 割引を適用する関数
function applyDiscount(cart) {
    let popcornCount = 0;
    let coffeeCount = 0;
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        if (item.name.includes('ポップコーン')) {
            popcornCount += item.quantity;
        } else if (item.name === 'コーヒー') {
            coffeeCount += item.quantity;
        }
    });

    // 割引ロジック
    if (popcornCount >= 2 && coffeeCount >= 1) {
        total -= 200; // ポップコーン2個とコーヒーで200円引き
    } else if (popcornCount >= 2) {
        total -= 100; // ポップコーン2個で100円引き
    } else if (coffeeCount >= 1 && popcornCount >= 1) {
        total -= 100; // コーヒーとポップコーンセットで100円引き
    }

    return total;
}

// 売り上げデータをExcelファイルにエクスポートする
function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(cart);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "売り上げデータ");
    XLSX.writeFile(workbook, "sales.xlsx");
}

// Googleスプレッドシートにエクスポートする（APIキー等が必要）
function exportToGoogleSheets() {
    const sheetId = 'your-spreadsheet-id'; // スプレッドシートのID
    const apiKey = 'your-api-key'; // Google APIキー
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

    const salesData = cart.map(item => [item.name, item.price, item.quantity, item.price * item.quantity]);

    const requestBody = {
        values: salesData
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data successfully written to Google Sheets:', data);
    })
    .catch(error => {
        console.error('Error writing data to Google Sheets:', error);
    });
}
