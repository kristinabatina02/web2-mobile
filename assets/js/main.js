var meni = [];
var sviProizvodi = [];
var brend = [];
var memorija = [];
var url = window.location.href;

//funkcija za dohvatanje json fajlova
function ajaxCallBack(imeFajla, ispis){
 $.ajax({
     url:"assets/json/" + imeFajla,
     method: "get",
     dataType: "json",
     success: ispis,
     error: function(jqXHR, exception){
      var por = '';
      if (jqXHR.status === 0) {
      por = 'Nije konektovan.\n Proverite konekciju.';
      } else if (jqXHR.status == 404) {
      por = 'Tražena stranica nije dostupna.';
      } else if (jqXHR.status == 500) {
      por = 'Interna greška servera.';
      } else if (exception === 'parsererror') {
      por = 'Zahtevan JSON nije pronađen.';
      } else if (exception === 'timeout') {
      por = 'Greška pri isteku vremena.';
      } else if (exception === 'abort') {
      por = 'Ajax zahtev je prekinut.';
      } else {
      por = 'Neuhvaćena greška.\n' + jqXHR.responseText;
      }
      
    }
 })
}

//dohvatanje proizvoda

function dohvatiSveProizvode(sviProizvodi) {
  sviProizvodi.forEach(el => {
   sviProizvodi.push(el);
 });
 postaviULS("sviProizvodi", sviProizvodi);
}

//funkcije za ls 

function postaviULS(name, sviProizvodi){
 localStorage.setItem(name, JSON.stringify(sviProizvodi));
}

function dohvatiIzLS(name) {
 return JSON.parse(localStorage.getItem(name));
}

function ukloniIzLS(name) {
 return localStorage.removeItem(name);
}
function imaUKorpi() {
  return dohvatiIzLS("products");
}

//prikaz navigacije

function prikaziNavigaciju(sviProizvodi) {
  let html = "";
  sviProizvodi.forEach(el => {
    html += `<li class="nav-item">
      <a class="nav-link" href="${el.href}">${el.naziv}</a>
    </li>`;
    meni.push(el);
  });
  $("#meni").html(html);
 }

window.onload = function(){
  ajaxCallBack("navigation.json", prikaziNavigaciju);
  ajaxCallBack("products.json", dohvatiSveProizvode);
 
 
  if (url == "https://kristinabatina02.github.io/web2-mobile/" || url == "https://kristinabatina02.github.io/web2-mobile/index.html") {
  
  //prikaz top proizvoda

    ajaxCallBack("products.json", prikaziTopProizvode);

    function prikaziTopProizvode(sviProizvodi) {
    let html = "";
    let sortirano = [];
    sortirano = sviProizvodi.sort(function(a,b){
      return b.stars - a.stars
    })
    let top = sortirano.slice(0,4)
    for(let el of top){
        html += `<div class="card d-flex align-items-center col-md-3">
          <img class="card-img-top" src="assets/img/${el.image.src}" alt="${el.image.alt}">
          <div class="card-body">
              <h6 class="card-title fw-bold">
                ${el.name}
              </h6>
            <p class="card-text text-center">${ispisiCenu(el.price)}</p>
          </div>
          <a href="shop.html"><button type="button" class="btn btn-primary btn-sm mb-3">Idi na shop</button></a>
        </div>`;
        
      }
    $("#topProizvodi").html(html);
    }
  }


  if (url == "https://kristinabatina02.github.io/web2-mobile/shop.html") {
    let favoriti = []
      if(localStorage.getItem("favoriti")) {
    favoriti = JSON.parse(localStorage.getItem("favoriti"))
    }
    ajaxCallBack("products.json", prikaziProizvode);
    ajaxCallBack("memory.json", prikaziMemorije);
    ajaxCallBack("brend.json", prikaziBrendove);
    
    //omiljeno
    document.querySelectorAll(".favorite").forEach(function(el) {
      el.addEventListener("click", function() {
        if(el.classList.contains("fa-regular")) {
          el.classList.remove("fa-regular")
          el.classList.add("fa-solid")
          favoriti.push(parseInt(el.dataset.id))
        } else {
          el.classList.add("fa-regular")
          el.classList.remove("fa-solid")
          localStorage.removeItem("favoriti");
          let indexZaBrisanje = favoriti.indexOf(parseInt(el.dataset.id))
          favoriti.splice(indexZaBrisanje, 1)
  
        }
        localStorage.setItem("favoriti", JSON.stringify(favoriti));
      })
    })

    $("#sort").change(filterChange);
    $("#search").keyup(filterChange);

    function filterChange() {
      ajaxCallBack("products.json", prikaziProizvode);
    }

    //prikaz brendova
    function prikaziBrendove(sviProizvodi) {
      let html = "";
      sviProizvodi.forEach(el => {
        html += `<li class="list-group-item">
                      <input type="checkbox" value="${el.id}" class="brend" name="brend"/> ${el.name}
                    </li>`;
        brend.push(el);
      });
      $("#brendovi").html(html);
      $('.brend').change(filterChange);
    }

    //prikaz memorija
    function prikaziMemorije(sviProizvodi) {
      let html = "";
      sviProizvodi.forEach(el => {
        html += `<li class="list-group-item">
                      <input type="checkbox" value="${el.id}" class="memorija" name="memorija"/> ${el.name}
                    </li>`;
        memorija.push(el);
      });
      $("#memorije").html(html);
      $('.memorija').change(filterChange);
    }
    
   }


  //ispis proizvoda
  function prikaziProizvode(sviProizvodi) {
    let favoriti = []
    if(localStorage.getItem("favoriti")) {
      favoriti = JSON.parse(localStorage.getItem("favoriti"))
    }
   sviProizvodi = filterByBrend(sviProizvodi);
   sviProizvodi = filterByRamMemory(sviProizvodi);
   sviProizvodi = sortiranje(sviProizvodi);
   sviProizvodi = search(sviProizvodi);
   let html = "";
   if (sviProizvodi.length == 0) {
     html += `<p class="alert alert-danger">Nažalost nema proizvoda</p>`;
   }
   else {
    sviProizvodi.forEach(el => {
       html += `<div class="col-lg-4 col-md-6 mb-5">
           <div class="card shadow-lg">
             <a href="#"><img class="card-img-top" src="assets/img/${el.image.src}" alt="${el.image.alt}"></a>
             <div class="card-body d-flex align-items-center flex-column">
               <h6 class="card-title fw-bold">
               ${el.name}
               </h6>
               <h5 class="card-text">${ispisiCenu(el.price)}</h5>
               <p class="card-text">${ispisiZvezdice(el.stars)}</p>
               <i class="${favoriti.includes(el.id) ? "fa-solid" : "fa-regular"} fa-heart favorite" data-id=${el.id}></i>
               <button type="button" class="btn btn-primary dugmeKorpa" data-id="${el.id}" data-bs-toggle="modal" data-bs-target="#cartModal">Dodaj u korpu</button>
             </div>
           </div>
         </div>`;
     });
   }
   $("#proizvodi").html(html);
   $(".dugmeKorpa").on("click", dodajUKorpu);
 }

 //ispis cene
 function ispisiCenu(obj){
  let html = "";

    if(obj.old != null){
        html += `<del>${obj.old}&euro;</del>`;
    }

    html += `<strong> ${obj.new}&euro;</strong>`;

    return html;
 }

  //ispis zvezdica
  function ispisiZvezdice(sviProizvodi) {
    let html = "";
    for(let i = 1 ; i <= 5; i++){
      if(i <= sviProizvodi){
          html +=`<span class="fa-solid fa-star"></span>`
      }
      else if(i > sviProizvodi && parseInt(sviProizvodi) == i - 1 && sviProizvodi % (i - 1)!=0){
          html+=`<span class="fa-regular fa-star-half-stroke"></span>`
      }
      else{
          html+=`<span class="fa-regular fa-star"></span>`
      }     
    }
    return html;
  }
  //filtriranje po brendovima
  function filterByBrend(sviProizvodi){
    let selektovanBrend = [];
    $('.brend:checked').each(function(el){
      selektovanBrend.push(parseInt($(this).val()));
    });
    if(selektovanBrend.length != 0){
      return sviProizvodi.filter(x => selektovanBrend.includes(x.brend));	
    }
    return sviProizvodi;
  }

  //filtriranje po memoriji
  function filterByRamMemory(sviProizvodi){
    let selektovaneMemorije = [];
      $('.memorija:checked').each(function (el) {
        selektovaneMemorije.push(parseInt($(this).val()));
      });
      if (selektovaneMemorije.length != 0) {
        return sviProizvodi.filter(x => selektovaneMemorije.includes(x.memorija));	
      }
      return sviProizvodi;
  }

  //sortiranje
  function sortiranje(sviProizvodi) {
    let tipSortiranja = $("#sort").val();
    if (tipSortiranja == 'nazivRastuce') {
      return sviProizvodi.sort((a, b) => a.name > b.name ? 1 : -1);
    }
    else if (tipSortiranja == 'nazivOpadajuce') {
      return sviProizvodi.sort((a, b) => a.name < b.name ? 1 : -1);
    }
    else if (tipSortiranja == 'cenaRastuce') {
      return sviProizvodi.sort((a, b) => a.price.new > b.price.new ? 1 : -1);
    }
    else if (tipSortiranja == 'cenaOpadajuce') {
      return sviProizvodi.sort((a, b) => a.price.new < b.price.new ? 1 : -1);
    }
    else if (tipSortiranja == 'zvezdicaRastuce') {
      return sviProizvodi.sort((a, b) => a.stars > b.stars ? 1 : -1);
    }
    else if (tipSortiranja == 'zvezdicaOpadajuce') {
      return sviProizvodi.sort((a, b) => a.stars < b.stars ? 1 : -1);
    }
  }

  //pretraga proizvoda
  function search(sviProizvodi) {
    let searchValue = $("#search").val().toLowerCase();
    if (searchValue) {
      return sviProizvodi.filter(function (el) {
        return el.name.toLowerCase().indexOf(searchValue) !== -1;
      })
    }
    return sviProizvodi;
  }


  //funkcija za dodavanje u korpu
  function dodajUKorpu() {
    var id = $(this).data('id');
    var proizvodiLS = imaUKorpi();
    if (!proizvodiLS) {
      let proizvodiLS = [];
      proizvodiLS[0] = { 
        id: id,
        kolicina: 1
      };
      postaviULS("products", proizvodiLS);
      console.log(proizvodiLS);
    }
    else {
      if (!pronadjiULS(proizvodiLS, id)) {
        dodajULS(id)
      }
      else {
        azurirajKolicinu(id); 
      }
    }
  }

  function pronadjiULS(proiz, id) {
    return proiz.find(p => p.id == id);
  }


  function dodajULS(id) {
    let proizvodiLS = imaUKorpi();
    proizvodiLS.push({
      id: id,
      kolicina: 1
    });
    postaviULS("products", proizvodiLS);
  }


  function azurirajKolicinu(id) {
    let proizvodiLS = imaUKorpi();
    proizvodiLS.forEach(el => {
      if (el.id == id)
        el.kolicina++;
    });
    postaviULS("products", proizvodiLS);
  }

  if (url == "https://kristinabatina02.github.io/mobileshop/korpa.html"){
    function prikaziKorpu() {
      let html = `
        <div id="orderTable">
          <table class="table table-responsive">
          <thead>
          <tr>
            <td>Naziv proizvoda</td>
            <td>Slika</td>
            <td>Cena</td>
            <td>Količina</td>
            <td>Ukupno</td>
          </tr>
        </thead>`;

    let proizvodiLS = dohvatiIzLS("products");
    var proizvodi = dohvatiIzLS("sviProizvodi");
  

  proizvodi = proizvodi.filter(el => {
    for (let p of proizvodiLS) {
      if (el.id == p.id) {
        el.kolicina = p.kolicina;
        return true;
      }
    }
  });
  proizvodi.forEach(el => {
    html += `<tbody>
      <tr>
        <td><p>${el.name}</h5></p>
        <td>
          <img src="assets/img/${el.image.src}" alt="${el.image.alt}" class="img-thumbnail" width="100"/>
        </td>
        <td class="cena">${el.price.new} &euro;</td>
        <td class="kolicina">
          <input class="formcontrol kolicinaInput" type="number" value="${el.kolicina}">
        </td>
        <td class="proizvodUkupno">${parseFloat(el.price.new * el.kolicina)} &euro;</td>
      </tr>
    </tbody>`;
  });

  html += `<table>
          </div>
            <div class="container">
            <div class="row d-flex justify-content-end" id="control">
              <p id="ukupnaSuma" class="m-2">Ukupna suma:${ukupno(proizvodi)}&euro;</p>
              <button id="kupi" class="btn btn-primary m-2">Kupi</button>
              <button id="ukloniSve" class="btn btn-danger m-2">Ukloni</button>
            </div>
       </div>`;

  $("#korpa").html(html);
  $("#kupi").click(validirajKarticu);
  $("#ukloniSve").click(ukloniSve);

}
  function ukupno(proizvodi) {
    let zbir = 0;
    proizvodi.forEach(el => {
      zbir += parseFloat(el.price.new * el.kolicina);
    });
    return zbir;
  }

  cekiraj(dohvatiIzLS("products"));

  function cekiraj(proizvodiUKorpi) {
    if (proizvodiUKorpi) {
      if (proizvodiUKorpi.length) {
        prikaziKorpu();
        $(".kolicinaInput").change(promeniKolicinu);
      }
      else
        prikaziPraznuKorpu();

    }
    else
      prikaziPraznuKorpu();
  }

  function prikaziPraznuKorpu() {
    $("#korpa").html("<p class='text-center p-5 alert alert-danger'>Nema nijedan proizvod u korpi</p>");
  }

  function ukloniSve() {
    ukloniIzLS("products");
    location.reload();
  }

  function azuriraj() {
    var proizvodiSuma = document.querySelectorAll(".proizvodUkupno");
    var cena = document.querySelectorAll(".price");
    var kolicinaSum = document.querySelectorAll(".kolicinaInput");
    var ukupnaSuma = document.querySelector("#ukupnaSuma");
    var ukupnaKolicinaZaJedanProizvod = 0;
    for (let i = 0; i < cena.length; i++) {
      var jednaCena = cena[i].innerHTML.replace('&euro;', '');
      proizvodUkupno[i].innerHTML = (Number(jednaCena) * Number(kolicinaSum[i].value)).toFixed(2) + "&euro;";

      ukupnaKolicinaZaJedanProizvod += Number(jednaCena) * Number(kolicinaSum[i].value);
    }
    ukupnaSuma.innerHTML = "Ukupna suma:" + parseFloat(ukupnaKolicinaZaJedanProizvod).toFixed(2) + "&euro;";
  }

  function promeniKolicinu() {
    if (this.value > 0) {
      azuriraj();
    }
    else {
      this.value = 1;
    }
  }


function kupi(){
    localStorage.removeItem("products");
    prikaziPraznuKorpu();
    $("#korpa").html("<p class='alert alert-success p-5'>Vaša porudžbina je kreirana</p>");
 }
}

 if(url == "https://kristinabatina02.github.io/mobileshop/contact.html"){
  var reEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  var reIme = /^[A-ZŠĐŽČĆ][a-zšđčćž]{2,11}(\s[A-ZŠĐŽČĆ][a-zšđčćž]{2,11})*$/;
  var reNaslov = /(.{3})+/
  var rePoruka = /(.{10})+/

  var objIme = document.querySelector("#ime");
      objIme.addEventListener("blur",function(){
          proveraRegularnihIzraza(reIme,objIme);
      })
  var objEmail = document.querySelector("#imejl");
      objEmail.addEventListener("blur",function(){
          proveraRegularnihIzraza(reEmail,objEmail);
      })    
  var objNaslov = document.querySelector("#naslov");
      objNaslov.addEventListener("blur",function(){
          proveraRegularnihIzraza(reNaslov,objNaslov);
      })

      var objPoruka = document.querySelector("#poruka");
      objPoruka.addEventListener("blur",function(){
          proveraRegularnihIzraza(rePoruka,objPoruka);
      })
  var dugme = document.getElementById("btn");
  dugme.addEventListener("click", kontaktObrada);
  function kontaktObrada(){
      var greske = 0;
      greske += proveraRegularnihIzraza(reIme,objIme);
      greske += proveraRegularnihIzraza(reEmail,objEmail);
      greske += proveraRegularnihIzraza(reNaslov,objNaslov);
      greske += proveraRegularnihIzraza(rePoruka,objPoruka);
      
      if(!greske){
          dugme.nextElementSibling.classList.remove("sakrijUspesno");
          dugme.nextElementSibling.classList.add("uspesno");
      }
      else{
          dugme.nextElementSibling.classList.remove("uspesno");
          dugme.nextElementSibling.classList.add("sakrijUspesno");
      }
  }


  function proveraRegularnihIzraza(re, obj){
      if(re.test(obj.value)){
          obj.nextElementSibling.classList.remove("prikaziGresku");
          obj.nextElementSibling.classList.add("sakrijGresku");
          return 0;
      }
      else{
          obj.nextElementSibling.classList.remove("sakrijGresku");
          obj.nextElementSibling.classList.add("prikaziGresku");
          return 1;
      }
      
    }
  
    }

  }







