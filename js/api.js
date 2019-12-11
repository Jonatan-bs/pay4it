import { signalRres } from './joshSignalR.js';

let firstLoad = true;
let nextStep = false;

signalRres(function(data){
  //IF MACHINE IS STARTED ON APP OR OTHER DEVICES
  if (data.DeviceID==561 && data.IsInUse == true) {
    document.querySelectorAll('.kabine').forEach(function(elm){
      if(elm.dataset.id == data.ID ){
        elm.classList.add('closed');
        elm.setAttribute('style', '')
        elm.querySelector('img').setAttribute('src','./img/solarie-closedgrey2.svg')
        let time = data.RunTime
        let span = elm.querySelector('span');
        startTimer(time, span)
        if(elm.parentNode.classList.contains('chosenWrap')){
          closeChosenBooth()
        }
      }
    })
  } else if(data.DeviceID==561 && data.IsInUse == false){
    console.log(data.ID + ": is done");
  } else if(data.DeviceID==561) {
  //  console.log(data);
  }
})



let shoppingbag = {booth:[],products:[]}


let Pay4it = {
    init: function(method = 'GET', url, auth, cache = true, json = true) {
      this.url = url;
      this.method = method;
      this.auth = auth;
      this.cache = cache;
      this.json = json;
      this.bgHex = ['#A5A266', '#68A365', '#65A381', '#65A3A0', '#6587A3', '#6568A3', '#8165A3', '#A065A3', '#A58366']
    },
    getResponse() {
      return new Promise((resolve, reject) => {
        let self = this;
        let xhr = new XMLHttpRequest()

        xhr.open(self.method, self.url);
        if (self.auth) {
          xhr.setRequestHeader("Authorization", self.auth);
        }

        if (self.cache == false) {
          xhr.setRequestHeader("Cache-Control", "no-cache");
        }

        xhr.send()

        xhr.addEventListener("load", function() {
          let response = xhr.responseText;
          if (self.json) {
            response = JSON.parse(response)
          }
          resolve(response)
        })
      })
    },
    startMachine(deviceID, boothID, minutes, seconds, totalAmount, func) {
    // Working example
    // pay4it.startMachine(561, 5283, 2, 0, 7,null)

      let xhr = new XMLHttpRequest()

      xhr.open("POST", "https://consolwebapi.pay4it.dk/api/Payment/Voucher");
      xhr.setRequestHeader("Authorization", "Basic c3VuZXExOEBnbWFpbC5jb206dTRjMm1hblY5");
      xhr.setRequestHeader("Content-Type", "application/json");


      let param = {
        "DeviceID": deviceID,
        "BoothID": boothID,
        "Minutes": minutes,
        "Seconds": seconds,
        "TotalAmount": totalAmount,
        //"Shelves": shelvesArr
      }

        param = JSON.stringify(param)

        xhr.send(param)

        xhr.addEventListener("load", function() {
          let json = xhr.responseText;
          func()
        });

      }

    }

    let pay4it = Object.create(Pay4it)
    pay4it.init('GET', 'https://consolwebapi.pay4it.dk/api/Devices/Detail?deviceID=561', 'Basic c3VuZXExOEBnbWFpbC5jb206dTRjMm1hblY5', false, true)



////////////
// TIMER function
////////
var timer;
    function startTimer(duration, display) {
            let start = Date.now(),
                diff,
                minutes,
                seconds;
            timer = function() {
                // get the number of seconds that have elapsed since
                // startTimer() was called
                diff = duration - (((Date.now() - start) / 1000) | 0);

                // does the same job as parseInt truncates the float
                minutes = (diff / 60) | 0;
                seconds = (diff % 60) | 0;

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = minutes + ":" + seconds;

                //STOP TIMER WHEN IT HITS 0
                if (diff<1) {
                  clearInterval(timerInt)
                  createOrUpdateBooths()
                  return;
                }
            };
            // we don't want to wait a full second before the timer starts
            timer();
            let timerInt = setInterval(timer, 1000);
    }


//// CREATE BOOTH DOM OBJs
function createOrUpdateBooths(){
pay4it.getResponse().then((response) => {

/// CREATE DOM IF FIRST LOAD ELSE UPDATE
if (firstLoad) {



  //EACH BOOTH
  let kabineFlex = document.querySelector('.kabineFlex')
  kabineFlex.innerHTML ='';
  let div = document.createElement('div');
  div.classList.add('chosenWrap')
  kabineFlex.appendChild(div)
  let p = document.createElement('p');
  p.textContent = 'X';
  div.appendChild(p)

let boothAmnt = response.Booths.length*3

  for (let a=0; a<boothAmnt; a++) {

//// ONLY FOR TEST
let i = a%response.Booths.length

//let i = a;

    let booth = response.Booths[i];

let divWrap = document.createElement('div');

divWrap.setAttribute('data-id',booth.ID)
/*
divWrap.setAttribute('data-row',Math.floor(i/3))
divWrap.setAttribute('data-col',i%3)
*/
if(booth.IsInUse){
  divWrap.className = 'kabine closed';
} else {
  divWrap.className = 'kabine';
  //divWrap.style.background = pay4it.bgHex[i];
}
if (boothAmnt<5) {
divWrap.classList.add('smallBooths')
}

let div = document.createElement('div');
div.className = 'info';
let b = document.createElement('b');
b.textContent = 'i';
div.appendChild(b)
divWrap.appendChild(div)
div = document.createElement('div');
div.className = 'kabineImg';
let img = document.createElement('img');
if(booth.IsInUse){
img.src = "./img/solarie-closedgrey2.svg";
} else {
img.src = "./img/whitetan.svg";
}
img.class = "kabineImg";
div.appendChild(img)
divWrap.appendChild(div)
div = document.createElement('div');
let innerDiv = document.createElement('div');
innerDiv.className = 'kabineNavn';
b = document.createElement('b');
b.textContent = booth.Description;
innerDiv.appendChild(b)
div.appendChild(innerDiv)
innerDiv = document.createElement('div');
innerDiv.className = 'pris';
innerDiv.textContent =  booth.Price + ' kr./min.';
div.appendChild(innerDiv)
divWrap.appendChild(div)
div = document.createElement('div');
div.className = 'tid';
b = document.createElement('b')
let span;
if(booth.IsInUse){
  b.textContent = 'Optaget';
  div.appendChild(b)
  let br = document.createElement('br')
  div.appendChild(br)
  span = document.createElement('span')

  let time = booth.RunTime;
//  let minutes = Math.floor(time / 60);
//  let seconds = time - minutes * 60;
  //span.textContent = booth.RunTime + ' minutter tilbage';
  startTimer(time, span)
} else {
  b.textContent = 'Ledig';
  div.appendChild(b)
  let br = document.createElement('br')
  div.appendChild(br)
  span = document.createElement('span')
  span.textContent = '';
}

div.appendChild(span)
divWrap.appendChild(div)


kabineFlex.appendChild(divWrap)

let sliderbox = document.querySelector(".sliderbox");
let checkoutBtns = document.querySelector(".checkoutBtns");
let chosenWrap =document.querySelector('.chosenWrap')

divWrap.addEventListener('click',function(){
  if (!this.classList.contains('closed')) {
  if (!this.classList.contains('active')) {
    let self=this;
    document.querySelector('.kabineFlex').classList.add('small')
    document.querySelectorAll('.kabine').forEach(function(elm){
      elm.classList.add('inactive')
    })
    let clone = self.cloneNode(true)
    clone.classList.remove('inactive')

    if (clone.classList.contains('smallBooths')) {
      clone.classList.remove('smallBooths')
    }


    chosenWrap.appendChild(clone)
    chosenWrap.setAttribute('style','z-index:1; opacity:1;');

    /// UPDATE SLIDER
    sliderbox.classList.add('active')
    checkoutBtns.classList.add('active')
    let slider = document.getElementById("myRange");
    let output = document.getElementById("tid");
    let pris = document.getElementById("pris");
    output.innerHTML = slider.value; // Display the default slider value
    pris.innerHTML = slider.value * booth.Price;

    if (document.querySelector('.kabineFlex').classList.contains('active')) {
    let price = Number(slider.value * booth.Price);
    let time = Number(slider.value);
    let id = Number(document.querySelector(".chosenWrap").querySelector(".kabine").dataset.id)
    let name = document.querySelector(".chosenWrap").querySelector(".kabine").querySelector('.kabineNavn').innerText
    let hours = Math.floor(time)
    let seconds = (time*60)%60
    shoppingbag.booth = [id,price,hours,seconds,time,name]
    }
    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
    output.innerHTML = this.value;
    pris.innerHTML = this.value * booth.Price;
    let price = Number(slider.value * booth.Price);
    let time = Number(slider.value);
    let id = Number(document.querySelector(".chosenWrap").querySelector(".kabine").dataset.id)
    let name = document.querySelector(".chosenWrap").querySelector(".kabine").querySelector('.kabineNavn').innerText
    let hours = Math.floor(time)
    let seconds = (time*60)%60
    shoppingbag.booth = [id,price,hours,seconds,time,name]
    updateBag()
    }
}
}
})





chosenWrap.addEventListener('click',closeChosenBooth)

firstLoad = false;

};
}
///NOT FIRST LOAD SO UPDATE INSTEAD
else {

document.querySelectorAll('.kabine').forEach(function(div){
response.Booths.forEach(function(booth){


  if(div.dataset.id == booth.ID && booth.IsInUse == true){
  div.classList.add('closed');
//  div.setAttribute('style', '')
  div.querySelector('img').setAttribute('src','./img/solarie-closedgrey2.svg')
  let time = booth.RunTime
  let span = div.querySelector('span');
  startTimer(time, span)
  } else if (div.dataset.id == booth.ID && booth.IsInUse == false) {
    div.classList.remove('closed');
  //  div.setAttribute('style', '')
    div.querySelector('img').setAttribute('src','./img/whitetan.svg')
    let span = div.querySelector('span');
    span.textContent = ''
    let b = div.querySelector('.tid').querySelector('b');
    b.textContent = "Ledig"
  }
})
})
}

})




}

createOrUpdateBooths();


function closeChosenBooth(){
  document.querySelector('.kabineFlex').classList.remove('small')
  let chosenWrap = document.querySelector('.chosenWrap')
  let sliderbox = document.querySelector('.sliderbox')
  let checkoutBtns = document.querySelector('.checkoutBtns')
      chosenWrap.classList.remove('active')
      sliderbox.classList.remove('active')
      checkoutBtns.classList.remove('active')
      document.querySelectorAll('.kabine').forEach(function(elm){
        //elm.classList.remove('active')
        elm.classList.remove('inactive')
      })
      chosenWrap.setAttribute('style','z-index:-1');
      chosenWrap.innerHTML= ''
      let p = document.createElement('p');
      p.textContent = 'X';
      chosenWrap.appendChild(p)
      shoppingbag.booth = []
}




///////////
//// Automat dom
///////////

let products = [
{id:0,img:'./img/solcreme.jpg',price:'10',name:'solcreme'},
{id:1,img:'./img/solcreme2.jpg',price:'35',name:'solcreme2'},
{id:2,img:'./img/chips.png',price:'15',name:'chips'},
{id:3,img:'./img/chips2.png',price:'15',name:'chips2'},
{id:4,img:'./img/chips3.png',price:'15',name:'chips3'},
{id:5,img:'./img/proteinbar.jpg',price:'12',name:'proteinbar'},
{id:6,img:'./img/proteinbar2.png',price:'10',name:'proteinbar2'},
{id:7,img:'./img/marsbar.jpeg', price:'7', name:'marsbar'},
{id:8,img:'./img/chips2.png',price:'15',name:'chips2'},
{id:9,img:'./img/chips3.png',price:'15',name:'chips3'},
{id:10,img:'./img/proteinbar.jpg',price:'12',name:'proteinbar'},
{id:11,img:'./img/proteinbar2.png',price:'10',name:'proteinbar2'},
{id:12,img:'./img/chips3.png',price:'15',name:'chips3'},
{id:13,img:'./img/proteinbar.jpg',price:'12',name:'proteinbar'},
]

function createAutomat(){

  for (let i=0; i<products.length; i++) {
    let product = products[i]

    let divHylde = document.createElement('div');
    divHylde.className = "hylde";
    //divHylde.setAttribute('data-id',product.id);
    let divImg = document.createElement('div');
    divImg.className = "hyldeImg";
    divImg.setAttribute( 'style', "background-image: url('" + product.img + "')");
    divHylde.appendChild(divImg)
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    div2.className = 'hyldeNavn';
    let b = document.createElement('b');
    b.textContent = product.name;
    div2.appendChild(b)
    div.appendChild(div2)
    div2 = document.createElement('div');
    div2.className = 'pris';
    div2.innerHTML = product.price + "kr.";
    div.appendChild(div2)
    divHylde.appendChild(div)
    document.querySelector('.hyldeFlex').appendChild(divHylde)

    divHylde.addEventListener('click', function(){
        if (!this.classList.contains('active')) {
          this.classList.add('active')

          shoppingbag.products.push(product)
        } else {
          this.classList.remove('active')
          var removeIndex = shoppingbag.products.map(function(item) { return item.id; }).indexOf(product.id);
          // remove object
          shoppingbag.products.splice(removeIndex, 1);
        }

        /// SHOW PAYMENT CHOISES IF ONE OR MORE ARE CHOSEN
        let hylde = document.querySelectorAll('.hylde')
        for (var i = 0; i < hylde.length; i++) {
          if (hylde[i].classList.contains('active')) {
            document.querySelector('.checkoutBtns').classList.add('active')
            return;
          }

        }
        if (nextStep == false) {
          document.querySelector('.checkoutBtns').classList.remove('active')
        }
      /*  document.querySelector('.checkoutBtns').classList.remove('active')
        document.querySelector('.sliderbox').classList.remove('active')*/

    })


  }


}
createAutomat()


///////////// TOGGLE BETWEEN AUTOMAT & KABINER
document.getElementById('automat').addEventListener('click',function(){
  shoppingbag = {booth:[], products:[]}
  nextStep = false;
  document.querySelector('.symbolsText').classList.remove('inactive')

  document.querySelectorAll('.hylde').forEach(function(elm){
    if (elm.classList.contains('active')) {
  elm.classList.remove('active')
    }
  })



  if (document.querySelector('.hyldeFlex').classList.contains('active')) {
    document.querySelector('.hyldeFlex').classList.remove('active')
    document.querySelector('.kabineFlex').classList.add('active')
    this.textContent = 'Automat';
    document.querySelector('.symbolsText').classList.remove('inactive')
    closeChosenBooth()
  } else {
    document.querySelector('.checkoutBtns').classList.remove('active')
    document.querySelector('.sliderbox').classList.remove('active')
    this.textContent = 'Kabine';

    document.querySelector('.hyldeFlex').classList.add('active')
    document.querySelector('.kabineFlex').classList.remove('active')
    document.querySelector('.symbolsText').classList.add('inactive')
  }

})

///MOBILEPAY CLICK
document.querySelector('.paysymbol').addEventListener('click',function(){
document.querySelector('.qrWrap').setAttribute('style','z-index:100; opacity:1;')
})


/// tilføj Kabine eller varer fra automaten
document.querySelector('.addMoreToBag').addEventListener('click',function(){
  nextStep = true;
  //IF BOOTHS OPEN ELSE IF AUTOMAT
  if (document.querySelector('.kabineFlex').classList.contains('active')) {
    document.querySelector('#automat').textContent = 'Kabine';
    let price = Number(document.querySelector("#pris").innerHTML);
    let time = Number(document.querySelector("#tid").innerHTML);
    let id = Number(document.querySelector(".chosenWrap").querySelector(".kabine").dataset.id)
    let name = document.querySelector(".chosenWrap").querySelector(".kabine").querySelector('.kabineNavn').innerText
    let hours = Math.floor(time)
    let seconds = (time*60)%60
    shoppingbag.booth = [id,price,hours,seconds,time,name]
    document.querySelector('.kabineFlex').classList.remove('active')
    document.querySelector('.hyldeFlex').classList.add('active')
    document.querySelector('.sliderbox').classList.remove('active')
    document.querySelector('.symbolsText').classList.add('inactive')
  } else {

  }
})

/// REMOVE QR IF BACKGROUND IS CLICKED
document.querySelector('.qrWrap').addEventListener('click',function(e){
if(e.target == document.querySelector('.qrWrap'))  {
document.querySelector('.qrWrap').setAttribute('style','z-index:-1; opacity:0;')
}
})

//START MACHINE WHEN QR IS CLICKED

document.querySelector('.qrbox').addEventListener('click',function(e){
  let id = shoppingbag.booth[0];
  let price = shoppingbag.booth[1];
  let minutes = shoppingbag.booth[2];
  let seconds = shoppingbag.booth[3];
  //console.log(561 +" "+id+ " " +minutes+ " " +seconds+ " " +price);

  pay4it.startMachine(561, id, minutes,seconds, price,function(){
    location.reload()
  })


})





//////// Update shoppingbag
function updateBag(){
let bagDiv = document.querySelector('.shoppingBag');
bagDiv.innerHTML = "";
let p = document.createElement('p');
p.textContent = 'INDKØBSKURV';
bagDiv.appendChild(p)
let boothWrap = document.createElement('div')
let productsWrap = document.createElement('div')
boothWrap.classList.add('boothWrap')
productsWrap.classList.add('productsWrap')


let spanBname = document.createElement('span')
boothWrap.appendChild(spanBname)
spanBname.classList.add('Bname')
let spanBhours = document.createElement('span')
boothWrap.appendChild(spanBhours)
spanBhours.classList.add('Btime')
let spanBprice = document.createElement('span')
boothWrap.appendChild(spanBprice)
spanBprice.classList.add('Bprice')



if (shoppingbag.booth.length>0) {

bagDiv.appendChild(boothWrap)
  let bName = shoppingbag.booth[5]+ ""
  spanBname.textContent = bName;
  let bHours = shoppingbag.booth[4]
  spanBhours.textContent = bHours + " min. "
  let bPrice = shoppingbag.booth[1]
  spanBprice.textContent = bPrice + "kr."
  //bagDiv.appendChild(br)
}

let spanPname = document.createElement('span')
productsWrap.appendChild(spanPname)
spanPname.classList.add('Pname')
let spanPprice = document.createElement('span')
productsWrap.appendChild(spanPprice)
spanPprice.classList.add('Pprice')

if (shoppingbag.products.length>0) {
  spanPname.textContent = 'Automat';
  bagDiv.appendChild(productsWrap)

  let bPrice = 0;
  shoppingbag.products.forEach(function(elm){
    bPrice = bPrice + Number(elm.price)
  })
  spanPprice.textContent = bPrice + "kr. "
}

if (shoppingbag.booth.length>0 || shoppingbag.products.length>0) {
let div = document.createElement('div')
div.classList.add('sumWrap')
let span = document.createElement('span')
span.classList.add('sum');
span.textContent = 'Sum: ';
div.appendChild(span)

let price = 0;
shoppingbag.products.forEach(function(elm){
  price = price + Number(elm.price)
})
let bbprice = 0;
if (shoppingbag.booth[1]) {
  bbprice = shoppingbag.booth[1]
}
price = price + bbprice + "kr.";

span = document.createElement('span')
span.classList.add('sumPrice');
span.textContent = price;
div.appendChild(span)

bagDiv.appendChild(div)

}
/// IF SHOPPINGBAG IS EMPTY
if (!shoppingbag.booth.length>0 && !shoppingbag.products.length>0){
  p = document.createElement('p');
  p.textContent = 'Din kurv er tom';
  bagDiv.appendChild(p);
}


}



/// DEBOUNCE RELOAD FUNCTION

function debounce(func){
  var timer;
  return function(){
    if(timer) {
      clearTimeout(timer)
    };
    timer = setTimeout(func,120000);
  };
}
let reloadCountdown = debounce(function(){
    location.reload();
  });

document.addEventListener('click',function(){
// RELOAD IF NOT USED IN 5 MINUTES
reloadCountdown()
// EASY WORKAROUND FOR KEEPING SHOPPING BAG UP TO DATE
updateBag()
})
