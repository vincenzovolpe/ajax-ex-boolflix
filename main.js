// Memorizzo in una variabile il percorso base  delle API
var api_url_base = 'https://api.themoviedb.org/3/';

$(document).ready(function(){
    // Evento click sul bottone con la lente
    $(document).on('click', '.btn_ricerca', function(){
        cercaFilm();
    });

    // Evento enter nell'input della barra di ricerca
    $(document).on('keypress', '.cerca_film', function(){
    	if(event.which == '13'){
            cercaFilm();
    	}
    });
});

// Funzione per ricercare un film inserito nella barra di ricerca
function cercaFilm() {
    // Pulisco la lista deifilm
    $('.film').remove();
// Recupero l'html del template
  var template_html = $('#template-film').html();
  // Compilo l'html con la funzione di handlebars
  var template_function = Handlebars.compile(template_html);
    // Memorizzo in una variabile il testo inserito nella barra di ricerca
    var testo_ricerca = $('.cerca_film').val();
    // Controllo se è stato inserito il testo nella barra di ricerca
    if (testo_ricerca.length != 0) {
        $.ajax({
            url: api_url_base + 'search/movie',
            'data': {
                'api_key': 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6',
                'query': testo_ricerca,
                'language': 'it-IT'
            },
            method: 'GET',
            success: function(data) {
                var film = data.results;
                for (var i = 0; i < film.length; i++) {
                    // Creo le variabili per popolare il template di handlebars
                    var variabili = {
                        titolo: film[i].title,
                        titolo_originale: film[i].original_title,
                        lingua: film[i].original_language,
                        voto: film[i].vote_average
                    }
                    // Creo il template
                    var html = template_function(variabili);
                    // Lo appendo al contenitore dei film
                    $('.contenitore-film').append(html);
                    // Chiamo la funzione per creare la bandierina in base  alla lingua del film
                    var bandiera = creaBandiera(film[i].original_language);
                    // Appendo la bandierina al film nell'elemnto lingua
                    $('.film>ul').children(':last').prev().append(bandiera);
                    // Chiamo la funzione per creare il punteggio con le stelline
                    var punti = creaPuntiStelle(film[i].vote_average);
                    // Appendo le stelline al film nell'elemnto voto
                    $('.film>ul').children(':last').append(punti);
                }
            },
            error: function() {
                alert('Error')
            }
        });
    }
    // Pulisco la barra di ricerca
    $('.cerca_film').val('');
}

function creaBandiera(flag) {
    switch(true) {
      case (flag == 'it'):
        return '<img src="images/italia.png" alt="Italia">';
      case (flag == 'us') :
        return '<img src="images/usa.png" alt="Usa">';
      case (flag == 'es') :
        return '<img src="images/spagna.png" alt="Spagna">';
      case (flag == 'en') :
        return '<img src="images/regnounito.png" alt="Regno Unito">';
      case (flag == 'fr') :
         return '<img src="images/francia.png" alt="Francia">';
      case (flag == 'de') :
         return '<img src="images/germania.png" alt="Germania">';
      default:
         return flag;
    }
}

function creaPuntiStelle(voto) {
    var num_arrotondato = Math.round(voto);
    console.log('Voto arrotondato: ' + num_arrotondato);
    var num_convertito = convertiPunti(num_arrotondato);
    console.log('Voto convertito: ' + num_convertito);
    var stelle = '';
    if (num_convertito == 0) {
        for (var j = 0; j < 5; j++) {
                stelle = stelle + '<i class="fas fa-star grey"></i>';
        }
    } else {
        for (var j = 0; j < num_convertito; j++) {
                stelle = stelle + '<i class="fas fa-star yellow"></i>';
        }
        if (num_convertito < 5) {
            for (var i = 0; i < (5 - num_convertito); i++) {
                stelle = stelle + '<i class="fas fa-star grey"></i>';
            }
        }
    }
    return stelle;
}

function convertiPunti(num_arrotondato) {
    console.log('Voto passato a convertiPunti(): ' + num_arrotondato);
    switch(true) {
      case (num_arrotondato == 0) :
          return 0;
      case (num_arrotondato == 0) || (num_arrotondato == 2):
        return 1;
      case (num_arrotondato == 3) || (num_arrotondato == 4):
        return 2;
      case (num_arrotondato == 5) || (num_arrotondato == 6):
        return 3;
      case (num_arrotondato == 7) || (num_arrotondato == 8):
         return 4;
      default:
         return 5;
    }
}
