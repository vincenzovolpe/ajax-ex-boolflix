$(document).ready(function(){
    // Dichiarazione variabili glibali
    // Percorso base delle API
    var api_url_base = 'https://api.themoviedb.org/3/';
    // Api Key personale per accedere alle API
    var api_key = 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6';
    // Parte finale url per la ricerca dei film
    var urlfilm  = 'search/movie';
    // Parte finale url per la ricerca delle serie tv
    var urltv = 'search/tv';
    // Parte finale url per la ricerca del cast dei film (senza id, che sarà aggiunto tra gli slash in cercaCast())
    var urlcastfilm = 'movie//credits';
    // Parte finale url per la ricerca del cast delle serie tv (senza id, che sarà aggiunto tra gli slash in cercaCast())
    var urlcastserie = 'tv//credits';
    // Parte finale url per la ricerca del genere dei film
    var urlgenerefilm = 'genre/movie/list';
    // Parte finale url per la ricerca del genere delle serie tv
    var urlgenereserie = 'genre/tv/list';
    // Variabile che memorizza la lista dei generi dei film
    var lista_genere_film;
    // Variabile che memorizza la lista dei generi delle serie TV
    var lista_genere_serie;
    // Percorso base delle immagini di TMDB
    var img_url_base = 'https://image.tmdb.org/t/p/';
    // Dimensione del poster del Film
    var dim_poster = 'w342';
    // Recupero l'html del template
    var template_html = $('#template-film').html();
    // Compilo l'html con la funzione di handlebars
    var template_function = Handlebars.compile(template_html);

    // Chiamo la funzione che lancia la chiamata ajax alle API per trovare la lista dei generi dei film
    apiGenere(urlgenerefilm);
    // Chiamo la funzione che lancia la chiamata ajax alle API per trovare la lista dei generi delleserie TV
    apiGenere(urlgenereserie);

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

    // Evento click sul filtro Film
    $(document).on('click', '#filtro_film', function(){
        // Chiamo la funzione che mi filtra i Film
        filtroTipo('Film', 'genere_film', 'genere_serie');
    });

    // Evento click sul filtro Serie TV
    $(document).on('click', '#filtro_serie', function(){
        // Chiamo la funzione che mi filtra le Serie TV
        filtroTipo('Serie TV', 'genere_serie', 'genere_film');
    });

    // Evento scelta opzione tendina genere Film
    $('#genere_film').change(function(){
        // Chiamo la funzione che mi filtra i generi dei film in base all'opzione scelta nella select
        filtroGenere('genere_film', 'Film');
    });

    // Evento scelta opzione tendina genere serie TV
    $('#genere_serie').change(function(){
        // Chiamo la funzione che mi filtra i generi delle serie TV in base all'opzione scelta nella select
        filtroGenere('genere_serie', 'Serie TV');
    });

    // Funzione che popola le select usate per filtrare i generi dei film e selle serie tv
    function creaSelect(select, lista_genere) {
        // Ciclo la lista dei generi dei film o serie tv e creo un opzione della select con il nome del genere e il value con l'id del genere
        for (var i = 0; i < lista_genere.length; i++) {
            $('#' + select).append('<option value="' + lista_genere[i].name.toLowerCase() + '">' + lista_genere[i].name + '</option>');
        }
    }

    // Funzione che crea il filtro per visualizzare solo i film o solo le serie TV in base al tipo
    function filtroGenere(genere, tipo) {
        // Recupero il genere selezionato dall'utente
        var genere_selezionato = $('#' + genere).val();
        if (genere_selezionato == '') {
            filtroTipo(tipo);
        } else {
            filtroTipo(tipo);
            // Verifico se il campo tipo della card contiene la selezione della tendina dei generi dei film. Il metodo toggle () nasconde la card che non contiene come tipo la parola Film.
            $('.film:visible').filter(function(){
                // Memorizzo nella variabile percorso il selettore del tipo in cui cercare
                var percorso = $(this).children('.card-img-overlay').children('.genere').children('.genre');
                // Trasformo in array la stringa dei generi relativa a questo film o serie tv
                var percorso_text = percorso.text().toLocaleLowerCase().split(', ');
                // Mostro il film o la  serie tv se l'array dei generi creato in precedenza contiene il genere selezionato nella tendina
                $(this).toggle(percorso_text.includes(genere_selezionato) != false);
            })
        }
    }
    // Funzione che crea il filtro per visualizzare solo i film o solo le serie TV in base al tipo
    function filtroTipo(tipo, select_uno, select_due) {
        // Verifico se il campo tipo della card contiene la parola Film. Il metodo toggle () nasconde la card che non contiene come tipo la parola Film.
        $('.film').filter(function(){
            // Memorizzo nella variabile percorso il selettore del tipo in cui cercare
            var percorso = $(this).children('.card-img-overlay').children('.tipo');
            $(this).toggle(percorso.text().indexOf(tipo) > -1);
        })
        // Nascondo la select dei generi delle Serie TV
        $('#' + select_due).removeClass('visibile');
        // Resetto la select impostando la selezione sulla prima voce
        $('#' + select_uno).prop('selectedIndex',0);
        // Rendo visibile la select dei generi dei Film
        $('#' + select_uno).addClass('visibile');
    }

    // Funzione che  prende il testo in input e lo controlla chiamando le relative funzioni se il testo è correttamente valorizzato
    function checkTesto(testo_ricerca) {
        // Controllo se è stato inserito il testo nella barra di ricerca
        if (testo_ricerca.length != 0) {
            // Elimino dalla pagina la lista dei film presenti
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
        // Nascondo la select dei generi dei film
        $('#genere_film').removeClass('visibile');
        // Nascondo la select dei generi delle Serie TV
        $('#genere_serie').removeClass('visibile');
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
                        if (url_suffisso == 'search/movie') {
                            // Faccio comparire il filtro di ricerca per i film
                            $('#filtro_film').addClass('visibile');
                        } else {
                            // Faccio comparire il filtro di ricerca per le serie tv
                            $('#filtro_serie').addClass('visibile');
                        }
                        // Chiamo la funzione che mi stampa i film e le serie tv in base all input inserito nella barra di ricerca
                        stampaFilm(data, url_suffisso);
                        // Chiamo la funzione che mi restituisce il cast dei film e delle serie tv passandogli l'url relativo
                        cercaCast(data, url_suffisso);
                        // Chiamo la funzione che mi restituisce il genere dei film e delle serie passandogli l'url relativo
                        cercaGenere(data, url_suffisso);
                    } else { // Faccio un alert se la chiamata ajax non restituisce risultati
                        if (url_suffisso == 'search/movie') { // Film non trovati
                            // Faccio scomparire il filtro di ricerca per i film
                            $('#filtro_film').removeClass('visibile');

                            alert('Nessun risultato trovato per i film ' + testo_ricerca);
                        } else { // Serie tv non trovate
                            // Faccio scomparire il filtro di ricerca per le serie tv
                            $('#filtro_serie').removeClass('visibile');
                            alert('Nessun risultato trovato per le serie tv ' + testo_ricerca);
                        }
                    }
                },
                error: function() {
                    alert('Error');
                }
            });
    }
    // Funzione per ricercare il genere di un film o una serie tv (in base alla variabile url) inserito nella barra di ricerca interrogando la relativa API
    function cercaGenere(data, url_suffisso) {
        var film = data.results;
        for (var i = 0; i < film.length; i++) {
            // Variabile che memorizza l'id del film o della serie tv
            // Uso la dichiarazione con let, in quanto se uso var mi ripete sempre lo stesso id
            var filmid = film[i].id;
            var genere_ids = film[i].genre_ids;
            // Chiamata ajax per recuperare i cast
            if (url_suffisso == 'search/movie') { // Controllo se è un film
                // Imposto la posizione nella stringa dell' url in cui inserire l'id del film di cui cercare il cast
                stampaGenere(filmid, genere_ids, lista_genere_film);
            } else { // E' unsa serie tv
                // Imposto la posizione nella stringa dell' url in cui inserire l'id della serie tv di cui cercare il cast
                stampaGenere(filmid, genere_ids, lista_genere_serie);

            }
        }
    }

    // Funzione per ricercare il cast di un film o una serie tv (in base alla variabile url) inserito nella barra di ricerca interrogando la relativa API
    function cercaCast(data, url_suffisso) {
            var film = data.results;
            var urlcast;
            var posizione;
            for (var i = 0; i < film.length; i++) {
                // Variabile che memorizza l'id del film o della serie tv
                // Uso la dichiarazione con let, in quanto se uso var mi ripete sempre lo stesso id
                let filmid = film[i].id;
                // Chiamata ajax per recuperare i cast
                if (url_suffisso == 'search/movie') { // Controllo se è un film
                    // Imposto la posizione nella stringa dell' url in cui inserire l'id del film di cui cercare il cast
                    posizione = 6;
                    apiCast(filmid, posizione, urlcastfilm);
                } else { // E' unsa serie tv
                    // Imposto la posizione nella stringa dell' url in cui inserire l'id della serie tv di cui cercare il cast
                    posizione = 3;
                    apiCast(filmid, posizione, urlcastserie);
                }
            }
    }

    // Funzione per la stampa dei film restituiti dalla chiamata Ajax alle API
    function stampaFilm(data, url_suffisso) {
            var film = data.results;
            // Variabile con all'interno lalista dei cast per film
            for (var i = 0; i < film.length; i++) {
                // Chiamo la funzione per creare la bandierina in base  alla lingua del film
                var bandiera = creaBandiera(film[i].original_language);
                // Variabile che memorizza l'id del film o della serie tv
                var filmid = film[i].id;
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
                    overview = (film[i].overview);
                } else {
                    overview = 'Non specificato';
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
                    id: filmid,
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
                // Stampo a video il film o la serie tv
                $('.card-columns').append(html);

            }
    }
    // Funzione per ricercare il genere di un film o una serie tv (in base alla variabile url) inserito nella barra di ricerca interrogando la relativa API

    // Funzione che lancia la chiamata ajax alle API per trovare il genere di film o serie tv in base all' urlcast
    function apiGenere(urlgenere) {
        $.ajax({
            url: api_url_base + urlgenere,
            'data': {
                'api_key': api_key,
                'language': 'it-IT'
            },
            method: 'GET',
            success: function(data_genere){
                    var generi = data_genere.genres;
                    creaListaGenere(urlgenere, generi);
            },
            error: function() {
                alert('Nessun cast trovato');
            }
        });
    }

    // Funzione che crea la lista dei generi dei film e  la lista dei generi della serie tv
    function creaListaGenere(urlgenere, generi) {
        if (urlgenere == 'genre/movie/list') {
            lista_genere_film = generi;
            // Chiamo la funzione che mi crea la select per filtrare i generi dei Film
            creaSelect('genere_film', lista_genere_film);
        } else {
            lista_genere_serie = generi;
            // Chiamo la funzione che mi crea la select per filtrare i generi delle Serie TV
            creaSelect('genere_serie', lista_genere_serie);
        }
    }

    // Funzione che lancia la chiamata ajax alle API per trovare il cast di film o serie tv in base all' urlcast
    function apiCast(filmid, posizione, url) {
        urlcast = [url.slice(0, posizione), filmid, url.slice(posizione)].join('');
        $.ajax({
            url: api_url_base + urlcast,
            'data': {
                'api_key': api_key,
                'language': 'it-IT'
            },
            method: 'GET',
            success: function(data_cast){
                var risultato = data_cast.cast;
                stampaCast(risultato, filmid);
            },
            error: function() {
                alert('Nessun cast trovato');
            }
        });
    }

    // Funzione per la creazione della lista dei generi di un film e di una serie tv
    function stampaGenere(filmid, genere_ids, lista_generi) {
        var stringa_genere = '';
        if (genere_ids.length > 0) {
            for (var i = 0; i < genere_ids.length; i++) {
                var nome_genere = lista_generi.find(x => x.id == genere_ids[i]).name;
                stringa_genere = stringa_genere + nome_genere + ', ';
            }
            stringa_genere = stringa_genere.slice(0, -2);
            $('.card-img-overlay[data-id="' + filmid + '"]').find('.genre').append(stringa_genere);
        } else {
            $('.card-img-overlay[data-id="' + filmid + '"]').find('.genre').append('Non specificato');
        }
    }

    // Funzione per la creazione della lista di 5 nomi e cognomi del cast di un film e di una serie tv
    function stampaCast(risultato, filmid) {
        var stringa_cast = '';
        if (risultato.length > 0) {
            if (risultato.length < 5) {
                for (var i = 0; i < risultato.length; i++) {
                    stringa_cast = stringa_cast + risultato[i].name + ', ';
                }
            } else {
                for (var i = 0; i < 5; i++) {
                    stringa_cast = stringa_cast + risultato[i].name + ', ';
                }
            }
            // Elimino l'ultima virgola + lo spazio dalla stringa
            stringa_cast = stringa_cast.slice(0, -2);
            // Seleziono la card con id uaguale a filmid e gli aggiungo il relativo casting
            $('.card-img-overlay[data-id="' + filmid + '"]').find('.casting').append(stringa_cast);
        } else {
            // Nascondo la scritta cast nella card nel caso i cui non esiste il cast
            $('.card-img-overlay[data-id="' + filmid + '"]').find('.casting').append('Non specificato');
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
