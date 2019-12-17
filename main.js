$(document).ready(function(){
    // Percorso base  delle API
    var api_url_base = 'https://api.themoviedb.org/3/';
    // Api Key personale per accedere alle API
    var api_key = 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6';
    // Parte final url per la ricerca dei film
    var urlfilm  = 'search/movie';
    // Parte final url per la ricerca delle serie tv
    var urltv = 'search/tv';

    // Recupero l'html del template
    var template_html = $('#template-film').html();
    // Compilo l'html con la funzione di handlebars
    var template_function = Handlebars.compile(template_html);

    // Evento click sul bottone con la lente
    $(document).on('click', '.btn_ricerca', function(){
        checkTesto($('.cerca_film').val());
    });

    // Evento enter nell'input della barra di ricerca
    $(document).on('keypress', '.cerca_film', function(){
    	if(event.which == '13'){
            checkTesto($('.cerca_film').val());
    	}
    });
    // Funzione che  prende il testo in input e lo controlla chiamando le relative operazioni
    function checkTesto(testo_ricerca) {
        // Controllo se è stato inserito il testo nella barra di ricerca
        if (testo_ricerca.length != 0) {
            // Elimino dalla pagina la  lista dei film presenti
            $('.film').remove();
            cercaFilm(testo_ricerca, urlfilm);
            cercaFilm(testo_ricerca, urltv);
            // Pulisco la barra di ricerca
            $('.cerca_film').val('');
        } else {
            alert('Inserisci la query di ricerca');
        }
    }
    // Funzione per ricercare un film inserito nella barra di ricerca interrogando la relativa API
    function cercaFilm(testo_ricerca, url) {
            $.ajax({
                url: api_url_base + url,
                'data': {
                    'api_key': api_key,
                    'query': testo_ricerca,
                    'language': 'it-IT'
                },
                method: 'GET',
                success: function(data) {
                    // Controlla se la chiamata restituisce qualche risultato
                    if(data.total_results > 0) {
                        stampaFilm(data, url);
                    } else { // Faccio un alert se la chiamata ajax non restituisce risultati
                        alert('Nessun risultato trovato per la query ' + testo_ricerca);
                    }
                },
                error: function() {
                    alert('Error')
                }
            });
    }

    // Funzione per la stampa dei film restituiti dalla chiamata Ajax alle API
    function stampaFilm(data, url) {
            console.log(url);
            var film = data.results;
            for (var i = 0; i < film.length; i++) {
                // Chiamo la funzione per creare la bandierina in base  alla lingua del film
                var bandiera = creaBandiera(film[i].original_language);
                if (url == 'search/movie') {
                    // Creo le variabili per popolare il template di handlebars
                    var variabili = {
                        tipo: 'Film',
                        titolo: film[i].title,
                        titolo_originale: film[i].original_title,
                        stato: bandiera,
                        voto: creaPuntiStelle(film[i].vote_average)
                    }
                } else {
                    // Creo le variabili per popolare il template di handlebars
                    var variabili = {
                        tipo: 'Serie TV',
                        titolo: film[i].name,
                        titolo_originale: film[i].original_name,
                        stato: bandiera,
                        voto: creaPuntiStelle(film[i].vote_average)
                    }
                }
                // Creo il template
                var html = template_function(variabili);
                // Lo appendo al contenitore dei film
                $('.contenitore-film').append(html);
            }
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
});
