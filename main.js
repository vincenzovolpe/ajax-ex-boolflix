// Memorizzo in una variabile il percorso base  delle API
var api_url_base = 'https://api.themoviedb.org/3/';
var api_key = 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6';

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

// Funzione nuova ricerca

// Funzione per stampare i risultati della ricerca della API

// Funzione per ricercare un film inserito nella barra di ricerca
function cercaFilm() {
// Recupero l'html del template
  var template_html = $('#template-film').html();
  // Compilo l'html con la funzione di handlebars
  var template_function = Handlebars.compile(template_html);
    // Memorizzo in una variabile il testo inserito nella barra di ricerca
    var testo_ricerca = $('.cerca_film').val();
    // Controllo se è stato inserito il testo nella barra di ricerca
    if (testo_ricerca.length != 0) {
        // Pulisco la lista deifilm
        $('.film').remove();
        $.ajax({
            url: api_url_base + 'search/movie',
            'data': {
                'api_key': api_key,
                'query': testo_ricerca,
                'language': 'it-IT'
            },
            method: 'GET',
            success: function(data) {
                if(data.total_results > 0) {
                    var film = data.results;
                    for (var i = 0; i < film.length; i++) {
                        // Chiamo la funzione per creare la bandierina in base  alla lingua del film
                        var bandiera = creaBandiera(film[i].original_language);
                        // Creo le variabili per popolare il template di handlebars
                        var variabili = {
                            titolo: film[i].title,
                            titolo_originale: film[i].original_title,
                            stato: bandiera,
                            voto: creaPuntiStelle(film[i].vote_average)
                        }
                        // Creo il template
                        var html = template_function(variabili);
                        // Lo appendo al contenitore dei film
                        $('.contenitore-film').append(html);
                        // Chiamo la funzione per creare il punteggio con le stelline
                        //var punti = creaPuntiStelle(film[i].vote_average);
                        // Appendo le stelline al film nell'elemnto voto
                        //$('.film>ul').children(':last').append(punti);
                    }
                } /*else {
                    $('.contenitore-film').append('Nessun risultato trovato per la query ' + testo_ricerca);
                }*/
            },
            error: function() {
                alert('Error')
            }
        });
    } else {
        alert('Inserisci la query di ricerca');
    }
    // Pulisco la barra di ricerca
    $('.cerca_film').val('');
}
// Funzione per associare la bandierina alla lingua restituita dall'API
function creaBandiera(flag) {
    switch(true) {
      case (flag == 'it'):
        return 'italia';
      case (flag == 'us') :
        return 'usa';
      case (flag == 'es') :
        return 'spagna';
      case (flag == 'en') :
        return 'regnounito';
      case (flag == 'fr') :
         return 'francia';
      case (flag == 'de') :
         return 'germania';
      default:
         return flag;
    }
}
// Funzione che crea le stelline che indicano la  valutazione da 1  a 5
function creaPuntiStelle(voto) {
    var stelle = '';
    if (voto == 0) {
        for (var j = 0; j < 5; j++) {
                stelle = stelle + '<i class="fas fa-star grey"></i>';
        }
    } else {
        var num_arrotondato = Math.round(voto);
        var num_convertito = convertiPunti(num_arrotondato);
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
// Funzione che converti i punti restiuti dalle APi in punti perle stelline da creare
function convertiPunti(num_arrotondato) {
    switch(true) {
      case (num_arrotondato == 1) || (num_arrotondato == 2):
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
