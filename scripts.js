document.getElementById('registrationForm').addEventListener('submit', register);
document.getElementById('loginForm').addEventListener('submit', login);

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, phone, email })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message);
        if (data.success) {
            showLogin();
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed. Please check your inputs and try again.');
    }
}

function showRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

async function login(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.querySelector("#greet").innerText=`Welcome!! ${username}`;
            alert(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}

function showLogin() {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

// Scanning and Shopping functionality
let cvRouter;
let scannedProducts = [];

function startScanning() {
    document.getElementById("shopping").style.display = 'none';
    const cameraViewContainer = document.getElementById("camera-view-container");
    cameraViewContainer.style.display = 'block'; // Ensure the camera view container is shown

    Dynamsoft.License.LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzMzU2MDAwLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzMzU2MDAwIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjoyMDg0NjUyOTJ9");
    Dynamsoft.Core.CoreModule.loadWasm(["dbr"]);

    (async () => {
        cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
        let cameraView = await Dynamsoft.DCE.CameraView.createInstance();
        let cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
        cameraViewContainer.append(cameraView.getUIElement());
        cvRouter.setInput(cameraEnhancer);
        cvRouter.addResultReceiver({ 
            onDecodedBarcodesReceived: async (result) => {
                if (result.barcodeResultItems.length > 0) {
                    for (let item of result.barcodeResultItems) {
                        alert("Detected barcode: " + item.text);
                        fetchProductDetails(item.text);
                    }
                }
            }
        });

        let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
        filter.enableResultCrossVerification('barcode', true);
        filter.enableResultDeduplication('barcode', true);
        await cvRouter.addResultFilter(filter);
        
        await cameraEnhancer.open();
        await cvRouter.startCapturing("ReadSingleBarcode");
    })();
}

async function fetchProductDetails(barcode) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${barcode}`);
        const data = await response.json();
        if (data.success) {
            addProductToList(data.product);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

function addProductToList(product) {
    const existingProduct = scannedProducts.find(p => p.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        scannedProducts.push({ ...product, quantity: 1 });
    }
    displayScannedProducts();
}

async function redirect(){
    await cvRouter.stopCapturing();
    await cameraEnhancer.close();
    const cameraViewContainer = document.getElementById("camera-view-container");
    cameraViewContainer.style.display = 'none';
    document.getElementById("shopping").style.display = 'block'; // Ensure the camera view container is shown

}

function displayScannedProducts() {
    const list = document.getElementById('scannedProducts');
    const totalCost = document.getElementById('totalCost');
    list.innerHTML = '';

    let total = 0;

    scannedProducts.forEach(product => {
        const itemTotal = product.price * product.quantity;
        total += itemTotal;

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${product.name} - ₹${product.price} x ${product.quantity} 
            <button onclick="removeProduct('${product.id}')">Remove</button>
            <button onclick="increaseQuantity('${product.id}')">+</button>
        `;
        list.appendChild(listItem);
    });

    totalCost.innerText = total.toFixed(2);
}

function removeProduct(productId) {
    scannedProducts = scannedProducts.filter(product => product.id !== productId);
    displayScannedProducts();
}

function increaseQuantity(productId) {
    const product = scannedProducts.find(product => product.id === productId);
    if (product) {
        product.quantity += 1;
        displayScannedProducts();
    }
}

function proceedToPayment() {
    const total = parseFloat(document.getElementById('totalCost').innerText);
    if (total > 0) {
        document.getElementById('paymentOptions').style.display = 'block';
    } else {
        alert("No items in the cart.");
    }
}

function payWithUPI() {
    const upiId = document.getElementById('upiPhoneNumber').value; 
    const total = parseFloat(document.getElementById('totalCost').innerText);
    const upiUrl = `upi://pay?pa=${upiId}&pn=YourName&mc=YOURMC&tid=TRANSACTION_ID&am=${total}&cu=INR&tn=Total%20Payment`;
    window.location.href = upiUrl;
}

function payWithCard() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    alert('Processing card payment...');
}

function showPaymentOptions() {
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    document.getElementById('upiContainer').style.display = selectedPaymentMethod === 'upi' ? 'block' : 'none';
    document.getElementById('cardContainer').style.display = selectedPaymentMethod === 'card' ? 'block' : 'none';
}

function showShopping() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('shopping').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', showLogin);
