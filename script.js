
// Render danh sách sản phẩm từ data json có sẵn x
// - get data from API gán vào products (viết một hàm getdata)-> render x
// - catch lỗi -> hiển thị không có cái đéo gì trong giỏ. x
// Cập nhật số lượng sản phẩm hiện có trong giỏ hàng x
// Xóa sản phẩm khỏi giỏ hàng x
// Thay đổi số lượng sản phẩm x
// Cập nhật tổng tiền

const API_URL = 'http://localhost:3000';
const productsElm = document.querySelector('.products');
const optionContainerElm = document.querySelector('.option-container');
const countElm = document.querySelector('.count');
const subTotal = document.querySelector('.subtotal span');
const vat = document.querySelector('.vat span');
const discountElm = document.querySelector('.discount');
const discountSpan = document.querySelector('.discount span');
const total = document.querySelector('.total span');
const promotiontBtn = document.querySelector('.promotion button');
let products;

// Get the list products from database;
async function getAsyncProducts(callback) {
   await axios.get(`${API_URL}/products`)
   .then(res => {
    products =  res.data;
    return res.data;
   })
   .then(callback)
   .catch(err => {
       console.error(err);
       productsElm.innerHTML = '<li>Nothing here.</li>';
   })
}

async function deleteProducts(id) {
        await axios.delete(`${API_URL}/products/${id}`);
        getAsyncProducts(app.renderUI);
}

async function changeCountItem (id = '', count = '') {
   await axios.patch(`http://localhost:3000/products/${id}`, {
count:count})
}

const app = {
    promotionCode: {
        ABC: 20,
        CDF: 50
    },
    checkPromotion() {
        let value = document.querySelector('#promo-code').value;
         console.log(value);
        if (this.promotionCode[value]) {
            return this.promotionCode[value];
        }
        return undefined;
    }
    ,
    renderUI(products) {
        // console.log(this.convertMoney(23))
        productsElm.innerHTML = '';

        if (products.length == 0) {
            productsElm.insertAdjacentHTML(
                'afterbegin',
                '<li>Nothing here.</li>'
            );
            
            return;
        }

        optionContainerElm.style.display = 'block';

       let htmls = products.map(product => `
        <li class="row">
        <div class="col left">
            <div class="thumbnail">
                <a href="#">
                    <img src="${product.image}" alt="" />
                </a>
            </div>
            <div class="detail">
                <div class="name"><a href="#">${product.name}</a></div>
                <div class="description">
                ${product.description}
                </div>
                <div class="price">${app.convertMoney(product.price)}</div>
            </div> 
        </div>
    
        <div class="col right">
            <div class="quantity">
                <input type="number" class="quantity" step="1" data-id="${product.id}" value="${product.count}" />
            </div>
    
            <div class="remove">
                <span class="close" data-id="${product.id}"><i class="fa fa-times" aria-hidden="true"></i></span>
            </div>
        </div>
    </li>
        `).join('');
        let countItems = app.updateTotalItem(products);
        countElm.innerText = (countItems > 0) ? `${countItems} items in the cart` : 'Nothing in the cart';
        app.updateTotalMoney(products);

        productsElm.innerHTML = htmls;
    },
    updateTotalItem(array) {
        let total = Array.from(array).reduce((acc, item) => acc+=item.count, 0);
        return total;
    },
    updateTotalMoney(array) {
        let totalMoney = Array.from(array).reduce((acc, item) => acc+=(item.count*item.price), 0);
        let discount = 0;
        let value = this.checkPromotion();
        if (value) {
            discount = (totalMoney * value )/100;
            discountElm.classList.remove('hide');
            discountSpan.innerText = this.convertMoney(discount);
        }

        subTotal.innerText = this.convertMoney(totalMoney);
        vat.innerText = this.convertMoney(totalMoney * 0.05)
        total.innerText = this.convertMoney(totalMoney*1.05 - discount)
    },
    handeEvents() {
        const _this = this;

        productsElm.onclick = (e) => {
            let removeElm = e.target.closest('.remove span');
            if (removeElm) {
                let id = removeElm.dataset.id;
               deleteProducts(id);
            }
        }
        productsElm.onchange = (e) => {
            let inputElm = e.target.closest('.quantity input');
            if (inputElm) {
                id = inputElm.dataset.id;
                console.log(inputElm.value)
               changeCountItem(id,+inputElm.value);
            }
        }

        promotiontBtn.onclick = () => {
            _this.updateTotalMoney(products);
        }
    },
    start() {
        // Create the loading gif before have the value
        let loading = document.createElement('img');
        loading.classList.add('loading');
        loading.src = 'https://media4.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif';
        productsElm.append(loading);

        // Group and handle all events in page
        this.handeEvents();
        // Get and render product from the API
         getAsyncProducts(this.renderUI);

        //  
    },
    convertMoney(number){
        return number.toLocaleString('it-IT', { style: 'currency', currency: 'VND'})
    }
}
app.start()



