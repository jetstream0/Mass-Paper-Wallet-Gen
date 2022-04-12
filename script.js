window.bananocoinBananojs.setBananodeApiUrl("https://kaliumapi.appditto.com/api");

//bytes to hex
function uint8_to_hex(uint8) {
  var hex = "";
  let hex_num;
  for (let i = 0; i < uint8.length; i++) {
    hex_num = uint8[i].toString(16).toUpperCase();
    if (hex_num.length == 1)
      hex_num = '0' + hex_num;
    hex += hex_num;
  }
  return (hex);
}

function generateSeed() {
  //generate 32 random bytes, then turn into hex. One byte has 4 bits, so 2^4=16 combinations. There we turn into hexadecimal (two chars). Output should be 64 characters. -prussia
  return uint8_to_hex(nacl.randomBytes(32));
}

//wait
function wait(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => { resolve('') }, milliseconds);
  })
}

//get banano address from seed
async function addressFromSeed(seed, index=0) {
  return await window.bananocoinBananojs.getBananoAccountFromSeed(seed, index)
}

async function sendBanano(seed, toAccount, amount, index=0) {
  return await window.bananocoinBananojs.sendBananoWithdrawalFromSeed(seed, index, toAccount, amount);
}

async function getBal(address) {
  let raw_bal = await window.bananocoinBananojs.getAccountBalanceRaw(address);
  let bal_parts = await window.bananocoinBananojs.getBananoPartsFromRaw(raw_bal);
  return bal_parts.banano+(bal_parts.banoshi/100)
}

async function main() {
  //
  document.getElementById('go').value = "In progress. Please be patient.";
  document.getElementById('go').removeEventListener('click', main);
  //generate seed, send fund from given seed, get all seeds, export as csv
  let send_seed = document.getElementById('seed').value;
  let wallet_amount = Number(document.getElementById('wallet-amount').value);
  let amount_per = Number(document.getElementById('amount-per').value);
  let seeds = [];
  //check balance to make sure it is enough
  let bal = await getBal(await addressFromSeed(send_seed));
  if (bal < wallet_amount*amount_per) {
    document.getElementById('error').style.display = "block";
    return;
  }
  //start process. might take a while?
  for (let i=0; i < wallet_amount; i++) {
    await wait(500);
    if (i%20 == 0) {
      await wait(500);
    }
    let current_seed = generateSeed();
    let current_address = await addressFromSeed(current_seed);
    let send_result = await sendBanano(send_seed, current_address, amount_per);
    console.log(send_result);
    seeds.push(current_seed);
    document.getElementById('list').innerText = seeds.join(',');
  }
  //turn into csv and download
  let file_content = seeds.join(',');
  let a = document.createElement('a');
  a.href = "data:text/plain;charset=utf-8,"+encodeURIComponent(file_content);
  a.download = 'paperwallets.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
}

document.getElementById('go').onclick = main;