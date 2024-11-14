// 商品の価格を設定
const productPrices = {
    "塩ポップコーン": 400,
    "コンポタポップコーン": 400,
    "カレーポップコーン": 400,
    "キャラメルポップコーン": 400,
    "バター醤油ポップコーン": 400,
    "コーヒー": 200
};

// カートを管理する配列
let cart = [];

// 総売り上げを管理する変数
let totalRevenue = 0;

// カートに商品を追加する関数
function addToCart(name) {
    const price = productPrices[name]; // 商品名に基づいて価格を取得
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

    // 割引ロジック: コーヒーとポップコーンセットで100円引き
    let n = Math.min(popcornCount, coffeeCount)
    total -= 100 * n
    /*if (popcornCount >= 1 && coffeeCount >= 1) {
        total -= 100;
    }*/

    return total;
}

// 決定ボタンが押されたときの処理
function finalizeSale() {
    const totalPrice = document.getElementById('total-price').textContent;

    // 現在のカート情報を売上データに保存
    salesData.push({
        date: new Date().toLocaleString(),
        items: [...cart],
        totalPrice: totalPrice
    });

    // 総売り上げを更新
    totalRevenue += parseInt(totalPrice);

    // カートをクリア
    cart = [];
    updateCart();
}

// 売り上げデータをExcelファイルにエクスポートする
function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(salesData.flatMap(sale =>
        sale.items.map(item => ({
            Date: sale.date,
            Item: item.name,
            Quantity: item.quantity,
            Price: item.price,
            TotalPrice: sale.totalPrice
        }))
    ));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "売り上げデータ");

    // 総売り上げの行を追加
    const totalRow = XLSX.utils.json_to_sheet([{ Date: "総売り上げ", TotalPrice: totalRevenue }], { skipHeader: true });
    XLSX.utils.sheet_add_json(worksheet, [{ Date: "総売り上げ", TotalPrice: totalRevenue }], { origin: -1 });

    XLSX.writeFile(workbook, "sales_data.xlsx");
}

// 売上データを保存する配列
let salesData = [];

// 決定ボタンを押したときに会計処理を行う
document.getElementById("finalize-button").addEventListener("click", finalizeSale);
