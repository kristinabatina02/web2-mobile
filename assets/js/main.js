var meni = [];
var sviProizvodi = [];
var brend = [];
var memorija = [];
var url = window.location.href;

function ajaxCallBack(imeFajla, ispis){
 $.ajax({
     url:"assets/json/" + imeFajla,
     method: "get",
     dataType: "json",
     success: ispis,
     async: false,
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

function postaviULS(name, sviProizvodi) {
 localStorage.setItem(name, JSON.stringify(sviProizvodi));
}

function dohvatiIzLS(name) {
 return JSON.parse(localStorage.getItem(name));
}

function ukloniIzLS(name) {
 return localStorage.removeItem(name);
}
function imaUKorpi() {
  return dohvatiIzLS("proizvodi");
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

  ajaxCallBack("products.json", prikaziTopProizvode)
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
  }

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
               <i class="${favoriti.includes(el.id) ? "fa-solid" : "fa-regular"} fa-heart favorite" data-id=${el.id}></i>
               <p class="card-text">${ispisiZvezdice(el.stars)}</p>
               
               <button type="button" class="btn btn-primary dugmeKorpa" data-id="${el.id}" data-bs-toggle="modal" data-bs-target="#cartModal">Dodaj u korpu</button>
             </div>
           </div>
         </div>`;
     });
   }
   $("#proizvodi").html(html);
   $(".dugmeKorpa").on("click", dodajUKorpu);
 }

 function ispisiCenu(obj){
  let html = "";

    if(obj.old != null){
        html += `<del>${obj.old}&euro;</del>`;
    }

    html += `<strong> ${obj.new}&euro;</strong>`;

    return html;
 }

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
function filterByBrend(sviProizvodi){
  let selektovanBrend = [];
  $('.brend:checked').each(function(el){
    selektovanBrend.push(parseInt($(this).val()));
  });
  if(selektovanBrend.length > 0) {
    localStorage.setItem("filterBrend",JSON.stringify(selektovanBrend));
  }
  if(selektovanBrend.length != 0){
    return sviProizvodi.filter(x => selektovanBrend.includes(x.brend));	
  }
  return sviProizvodi;
}

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

function search(sviProizvodi) {
  let searchValue = $("#search").val().toLowerCase();
  if (searchValue) {
    return sviProizvodi.filter(function (el) {
      return el.name.toLowerCase().indexOf(searchValue) !== -1;
    })
  }
  return sviProizvodi;
}


function dodajUKorpu() {
  var id = $(this).sviProizvodi('id');
  var proizvodiLS = imaUKorpi();
  if (!proizvodiLS) {
    let proizvodiLS = [];
    proizvodiLS[0] = { 
      id: id,
      kolicina: 1
    };
    postaviULS("products", proizvodiLS);
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


// function azurirajKolicinu(id) {
//   let proizvodiLS = imaUKorpi();
//   proizvodiLS.forEach(el => {
//     if (el.id == id)
//       el.kolicina++;
//   });
//   postaviULS("products", proizvodiLS );
// }





