$(document).ready(function(){
    // Percorso base delle API
    var api_url_base = 'https://api.themoviedb.org/3/';
    // Api Key personale per accedere alle API
    var api_key = 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6';
    // Parte finale url per la ricerca dei film
    var urlfilm  = 'search/movie';
    // Parte finale url per la ricerca delle serie tv
    var urltv = 'search/tv';
    // Percorso base delle immagini di TMDB
    var img_url_base = 'https://image.tmdb.org/t/p/';
    // Dimensione del poster del Film
    var dim_poster = 'w342/';

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
    // Funzione che  prende il testo in input e lo controlla chiamando le relative funzioni se il testo è correttamente valorizzato
    function checkTesto(testo_ricerca) {
        // Controllo se è stato inserito il testo nella barra di ricerca
        if (testo_ricerca.length != 0) {
            // Elimino dalla pagina la  lista dei film presenti
            $('.film').remove();
            // Chiamo la funzione che mi restituisce i film in base all' input nella searchbar
            cercaFilm(testo_ricerca, urlfilm);
            // Chiamo la funzione che mi restituisce le serie tv in base all' input nella searchbar
            cercaFilm(testo_ricerca, urltv);
            // Pulisco la barra di ricerca
            $('.cerca_film').val('');
        } else {
            alert('Inserisci la query di ricerca');
        }
    }
    // Funzione per ricercare un film o una serie tv (in base alla variabile url) inserito nella barra di ricerca interrogando la relativa API
    function cercaFilm(testo_ricerca, url_suffisso) {
            $.ajax({
                url: api_url_base + url_suffisso,
                'data': {
                    'api_key': api_key,
                    'query': testo_ricerca,
                    'language': 'it-IT'
                },
                method: 'GET',
                success: function(data) {
                    // Controlla se la chiamata restituisce qualche risultato
                    if(data.total_results > 0) {
                        stampaFilm(data, url_suffisso);
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
    function stampaFilm(data, url_suffisso) {
            var film = data.results;
            for (var i = 0; i < film.length; i++) {
                // Chiamo la funzione per creare la bandierina in base  alla lingua del film
                var bandiera = creaBandiera(film[i].original_language);
                if (url_suffisso == 'search/movie') {
                    // Creo le variabili per popolare il template di handlebars con le informazioni relative al film cercato
                    var variabili = {
                        tipo: 'Film',
                        titolo: film[i].title,
                        titolo_originale: film[i].original_title,
                        stato: bandiera,
                        voto: creaPuntiStelle(film[i].vote_average),
                        img_url: img_url_base + dim_poster + (film[i].poster_path)
                    }
                } else {
                    // Creo le variabili per popolare il template di handlebars con le informazioni relative alla serie tv cercata
                    var variabili = {
                        tipo: 'Serie TV',
                        titolo: film[i].name,
                        titolo_originale: film[i].original_name,
                        stato: bandiera,
                        voto: creaPuntiStelle(film[i].vote_average),
                        img_url: img_url_base + dim_poster + (film[i].poster_path)
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
