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
    var dim_poster = 'w342';

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
            $('.colonna').remove();
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
                        if (url_suffisso == 'search/movie') { // Film non trovati
                            alert('Nessun risultato trovato per i film ' + testo_ricerca);
                        } else { // Serie tv non trovate
                            alert('Nessun risultato trovato per le serie tv ' + testo_ricerca);
                        }
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
                var poster;
                var overview;
                // Controllo se l'API mi restituisce una immagine
                if (film[i].poster_path != null) { // Creo il percorso corretto per l'immagine
                    poster = img_url_base + dim_poster + (film[i].poster_path);
                } else { // Carico un immagine di default
                    poster = 'images/noimage.png';
                }
                // Controllo se l'API mi restituisce una overview
                if (film[i].overview != '') {
                    overview = (film[i].overview); // accorcio la descrizione a max 400 caratteri;
                } else {
                    overview = 'Nessuna descrizione';
                }
                // Setto le variabili in base al tipo restituito dalla ricerca (film o serie tv) controllando il suffisso dell' url
                if (url_suffisso == 'search/movie') { // Controllo se è un film
                    var tipo = 'Film';
                    var titolo = film[i].title;
                    var titolo_originale = film[i].original_title;
                } else { // E' unsa serie tv
                    var tipo = 'Serie TV';
                    var titolo = film[i].name;
                    var titolo_originale = film[i].original_name;
                }
                // Creo le variabili per popolare il template di handlebars con le informazioni relative al film cercato
                var variabili = {
                    tipo: tipo,
                    titolo: titolo,
                    titolo_originale: titolo_originale,
                    stato: bandiera,
                    voto: creaPuntiStelle(film[i].vote_average),
                    img_url: poster,
                    overview: overview
                }
                // Creo il template
                var html = template_function(variabili);
                // Se i risultati ritornati dall' API sono film li faccio comparire sempre prima nella pagina rispetto alle Serie TV
                if (url_suffisso == 'search/movie') {
                    $('.card-columns').prepend(html); // Faccio prepend dei film
                } else {
                    $('.card-columns').append(html); // Faccio append delle serie tv
                }

            }
    }
    // Funzione per associare la bandierina alla lingua restituita dall'API
    function creaBandiera(flag) {
        switch(flag) {
          case ('it'):
            return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          case ('us') :
            return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          case ('es') :
            return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          case ('en') :
            return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          case ('fr') :
             return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          case ('de') :
             return '<img src="images/' + flag + '.png" alt="'+ flag +'">';
          default:
             return flag;
        }
    }
    // Funzione che crea le stelline che indicano la  valutazione da 1  a 5
    function creaPuntiStelle(voto) {
        var stelle = '';
        if (voto != 0) {
            // Chiamo la funzione che converte i punti nell'intervallo da 1 a 5
            var num_convertito = convertiPunti(voto);
        }
        for (var i = 0; i < 5; i++) {
            if (i < num_convertito) {
                stelle = stelle + '<i class="fas fa-star yellow"></i>';
            } else {
                stelle = stelle + '<i class="fas fa-star grey"></i>';
            }
        }
        return stelle;
    }
    // Funzione che converti i punti restiuti dalle APi in punti per le stelline da creare
    function convertiPunti(voto) {
        // il voto decimale ricevuto lo divido per 2 e poi lo arrotondo per eccesso (in questo modo ottengo un numero da 1 a 5)
        return Math.ceil(voto / 2);
    }
});
