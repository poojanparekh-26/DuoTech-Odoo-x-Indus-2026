const fs = require('fs');

let logOutput = '';
const log = (msg) => { logOutput += msg + '\n'; console.log(msg); };

const baseURL = 'http://localhost:5000/api';
let token = '';

async function testEndpoint(method, url, data = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);
    
    const res = await fetch(`${baseURL}${url}`, options);
    
    let resData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      resData = await res.json();
    } else {
      resData = await res.text();
    }
    
    if (!res.ok) {
      log(`❌ ${method} ${url} - Status: ${res.status} - Error: ${JSON.stringify(resData)}`);
      return { success: false, error: resData, status: res.status };
    }
    
    log(`✅ ${method} ${url} - Status: ${res.status}`);
    return { success: true, data: resData, status: res.status };
  } catch (error) {
    log(`❌ ${method} ${url} - Status: NETWORK_ERROR - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("---- PHASE 12: AUTO TEST ALL FEATURES ----");
  
  await testEndpoint('GET', '/health');
  
  log("\\n-- Simulator Flow: SIGNUP & LOGIN --");
  const signupRes = await testEndpoint('POST', '/auth/signup', {
    name: 'Auto QA',
    email: 'autoqa@pos.com',
    password: 'securepassword123'
  });
  
  const loginRes = await testEndpoint('POST', '/auth/login', {
    email: 'autoqa@pos.com',
    password: 'securepassword123'
  });
  
  if (loginRes.data && loginRes.data.data && loginRes.data.data.token) {
    token = loginRes.data.data.token;
  }
  
  log("\\n-- Simulator Flow: CATEGORIES & PRODUCTS --");
  const catRes = await testEndpoint('POST', '/categories', {
    name: 'QA Category',
    color: '#123456'
  });
  let catId = (catRes.data && catRes.data.data) ? catRes.data.data.id : null;

  const prodRes = await testEndpoint('POST', '/products', {
    name: 'QA Product',
    price: 15.99,
    category_id: catId
  });
  let prodId = (prodRes.data && prodRes.data.data) ? prodRes.data.data.id : null;

  log("\\n-- Simulator Flow: START POS SESSION --");
  const configsRes = await testEndpoint('GET', '/pos-config');
  let configId = null;
  if(configsRes.data && configsRes.data.data && configsRes.data.data.length > 0) {
      configId = configsRes.data.data[0].id;
  } else {
      log("Mock pos config fallback");
      configId = '60000000-0000-0000-0000-000000000001';
  }

  const sessionRes = await testEndpoint('POST', '/sessions', {
    posId: configId,
    openingCash: 500
  });
  let sessionId = (sessionRes.data && sessionRes.data.data) ? sessionRes.data.data.id : '90000000-0000-0000-0000-000000000001';

  log("\\n-- Simulator Flow: ORDER TO KITCHEN --");
  const orderRes = await testEndpoint('POST', '/orders', {
    sessionId: sessionId,
    tableId: '80000000-0000-0000-0000-000000000001',
    customerCount: 2,
    orderType: 'DINE_IN',
    items: [
      { productId: prodId || '20000000-0000-0000-0000-000000000001', name: 'QA Burger', quantity: 3, price: 15.99 } // total 47.97
    ]
  });
  let orderId = (orderRes.data && orderRes.data.data) ? orderRes.data.data.id : null;

  if (orderId) {
      log("\\n-- Simulator Flow: KITCHEN MANAGE --");
      await testEndpoint('PUT', `/orders/${orderId}`, {
          kitchenStatus: 'PREPARING'
      });
      await testEndpoint('PUT', `/orders/${orderId}`, {
          kitchenStatus: 'COMPLETED'
      });

      log("\\n-- Simulator Flow: PAYMENT --");
      await testEndpoint('POST', '/payments', {
        orderId: orderId,
        amount: 47.97,
        paymentMethodId: '50000000-0000-0000-0000-000000000001'
      });

      await testEndpoint('PUT', `/orders/${orderId}`, {
        status: 'PAID'
      });
  }

  log("\\n-- Simulator Flow: REPORTS --");
  await testEndpoint('GET', '/reports/dashboard');

  fs.writeFileSync('simulator_output.log', logOutput);
  log("Tests completed.");
}

runTests();
