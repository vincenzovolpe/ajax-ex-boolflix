$(document).ready(function(){
    // Dichiarazione variabili glibali
    // Percorso base delle API
    var api_url_base = 'https://api.themoviedb.org/3/';
    // Api Key personale per accedere alle API
    var api_key = 'f5a961c5e8b2e2e5f35c17c6f3fd8ef6';
    // Imposto la lingua di default dei risultati di ricerca di film e serie tv
    var linguaggio = 'it';
    var risultati_film;
    var risultati_serie;
    // Variabile che memorizza il numero di pagine restituite nella ricerca di un film
    var pagine_film;
    // Variabile che memorizza il numero di pagine restituite nella ricerca di una serie tv
    var pagine_serie;
    // Variabile che memorizza il singolo numero di pagina di un film
    var pagina_film = 1;
    // Variabile che memorizza il singolo numero di pagina di una serie tv
    var pagina_serie = 1;
    // Parte finale url per la ricerca dei film
    var urlfilm  = 'search/movie';
    // Parte finale url per la ricerca delle serie tv
    var urltv = 'search/tv';
    // Parte finale url per la ricerca del cast dei film (senza id, che sarà aggiunto tra gli slash in cercaCast())
    var urlcastfilm = 'movie//credits';
    // Parte finale url per la ricerca del cast delle serie tv (senza id, che sarà aggiunto tra gli slash in cercaCast())
    var urlcastserie = 'tv//credits';
    // Parte finale url per la ricerca del genere dei film
    var url_linguaggi = 'configuration/languages';
    // Parte finale url per la ricerca del genere dei film
    var urlgenerefilm = 'genre/movie/list';
    // Parte finale url per la ricerca del genere delle serie tv
    var urlgenereserie = 'genre/tv/list';
    // Variabile che contiene la lista dei possibili voti dei film o delle serie TV
    var lista_voti = ["5 stelle","4 stelle","3 stelle","2 stelle","1 stella","Nessun voto"];
    // Variabile che contiene il punteggio da 0 a 5 diun fillm o serie tv
    var punteggio;
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
    // Chiamo la funzione che lancia la chiamata ajax alle API per trovare la lista dei generi delle serie TV
    apiGenere(urlgenereserie);
    // Chiamo la funzione che lancia la chiamata ajax alle API per trovare la lista delle lingue utilizzate in tutto TMDb.
    apiLingua(url_linguaggi);
    // Chiamo la funzione che crea le select dei voti dei film e delle serie TV
    creaListaVoti(lista_voti);

    // Evento focus sul campo di ricerca
    $('.cerca_film').focus(function(){
        // Elimino dalla pagina la lista dei film presenti
        $('.colonna').remove();
        // Nascondo la select dei generi dei film
        $('#genere_film').removeClass('visibile');
        // Nascondo la select dei generi delle Serie TV
        $('#genere_serie').removeClass('visibile');
        // Nascondo la select dei voti dei film
        $('#voto_film').removeClass('visibile');
        // Nascondo la select dei voti delle Serie TV
        $('#voto_serie').removeClass('visibile');
        // Faccio scomparire il filtro di ricerca per i film
        $('#filtro_film').removeClass('visibile');
        // Faccio scomparire il filtro di ricerca per le serie tv
        $('#filtro_serie').removeClass('visibile');
        // Pulisco la barra di ricerca
        $('.cerca_film').val('');
        // Faccio comparire la label del filtro della lingua
        $('#language').addClass('visibile');
        // Faccio comparire il filtro della lingua
        $('#scelta_lingua').addClass('visibile');
    });

    // Evento click sul bottone con la lente
    $(document).on('click', '.btn_ricerca', function(){
        $('.cerca_film').blur();
        checkLingua();
    });

    // Evento enter nell'input della barra di ricerca
    $(document).on('keypress', '.cerca_film', function(){
    	if(event.which == '13'){
            $('.cerca_film').blur();
            checkLingua();
    	}
    });

    // Evento click sul filtro Film
    $(document).on('click', '#filtro_film', function(){
        // Chiamo la funzione che mi filtra i Film
        filtroTipo('Film', 'genere_film', 'genere_serie', 'voto_serie', 'voto_film');
    });

    // Evento click sul filtro Serie TV
    $(document).on('click', '#filtro_serie', function(){
        // Chiamo la funzione che mi filtra le Serie TV
        filtroTipo('Serie TV', 'genere_serie', 'genere_film', 'voto_film', 'voto_serie');
    });

    // Evento scelta opzione tendina genere Film
    $('#genere_film').change(function(){
        // Chiamo la funzione che mi mostra il filtro dei voti dei film
        filtroTipo('Film', 'voto_film', 'voto_serie');
        // Chiamo la funzione che mi filtra i generi dei film in base all'opzione scelta nella select
        filtroGenere('genere_film', 'Film');
    });

    // Evento scelta opzione tendina genere serie TV
    $('#genere_serie').change(function(){
        // Chiamo la funzione che mi mostra il filtro dei voti delle serie TV
        filtroTipo('Serie TV', 'voto_serie', 'voto_film');
        // Chiamo la funzione che mi filtra i generi delle serie TV in base all'opzione scelta nella select
        filtroGenere('genere_serie', 'Serie TV');
    });

    // Evento scelta opzione tendina punteggio Film
    $('#voto_film').change(function(){
        // Chiamo la funzione che mi filtra i generi delle serie TV in base all'opzione scelta nella select
        filtroVoto('voto_film', 'Film', 'genere_film');
    });

    // Evento scelta opzione tendina punteggio serie TV
    $('#voto_serie').change(function(){
        // Chiamo la funzione che mi filtra i generi delle serie TV in base all'opzione scelta nella select
        filtroVoto('voto_serie', 'Serie TV', 'genere_serie');
    });

    // Funzione che popola le select usate nell'applicazione (per filtrare i generi dei film e selle serie tv e  i linguaggi)
    function creaSelect(select, lista, tipo) {
        var valore_select;
        var testo_select;
        // Ciclo la lista e creo un opzione della select assegnando il valore e il testo in base al tipo ricevuto
        for (var i = 0; i < lista.length; i++) {
            switch(tipo) {
              case 'linguaggi':
                  valore_select = lista[i].iso_639_1;
                  testo_select = lista[i].english_name;
                break;
              case 'film':
                  valore_select = lista[i].name.toLowerCase();
                  testo_select = lista[i].name;
                break;
              case 'voti':
                  valore_select = lista.length - (i+1);
                  testo_select = lista[i];
            }
            $('#' + select).append('<option value="' + valore_select + '">' + testo_select + '</option>');
        }
    }

    // Funzione che crea il filtro per visualizzare solo i film o solo le serie TV in base al tipo
    function filtroVoto(voto, tipo, genere) {
        // Recupero il voto selezionato dall'utente
        var voto_selezionato = $('#' + voto).val();
        // Recupero il genere selezionato dall'utente
        var genere_selezionato = $('#' + genere).val();
        if (voto_selezionato == '') {
            filtroTipo(tipo);
            // Resetto la select_uno impostando la selezione sulla prima voce
            $('#' + genere).prop('selectedIndex',0);
        } else if (genere_selezionato == '') {
            filtroTipo(tipo);
            // Verifico se il campo tipo della card contiene la selezione della tendina dei generi dei film. Il metodo toggle () nasconde la card che non contiene come tipo la parola Film.
            $('.film:visible').filter(function(){
                // Memorizzo nella variabile voto_film il voto del film attuale presente nel data attribute relativo
                var voto_film = $(this).children('.flip-box-inner').children('.card-img-overlay').children('.punteggio').children('.voto').attr("data-voto");
                // Mostro il film o la  serie tv se l'array dei generi creato in precedenza contiene il genere selezionato nella tendina
                $(this).toggle(voto_film == voto_selezionato);
            })
        } else {
            filtroTipo(tipo);
            // Verifico se il campo tipo della card contiene la selezione della tendina dei generi dei film. Il metodo toggle () nasconde la card che non contiene come tipo la parola Film.
            $('.film:visible').filter(function(){
                // Memorizzo nella variabile voto_film il voto del film attuale presente nel data attribute relativo
                var voto_film = $(this).children('.flip-box-inner').children('.card-img-overlay').children('.punteggio').children('.voto').attr("data-voto");
                // Memorizzo nella variabile percorso il selettore del tipo in cui cercare
                var percorso = $(this).children('.flip-box-inner').children('.card-img-overlay').children('.genere').children('.genre');
                // Trasformo in array la stringa dei generi relativa a questo film o serie tv
                var percorso_text = percorso.text().toLocaleLowerCase().split(', ');
                // Mostro il film o la  serie tv se l'array dei generi creato in precedenza contiene il genere selezionato nella tendina
                $(this).toggle(percorso_text.includes(genere_selezionato) != false && voto_film == voto_selezionato);
            })
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
                var percorso = $(this).children('.flip-box-inner').children('.card-img-overlay').children('.genere').children('.genre');
                // Trasformo in array la stringa dei generi relativa a questo film o serie tv
                var percorso_text = percorso.text().toLocaleLowerCase().split(', ');
                // Mostro il film o la  serie tv se l'array dei generi creato in precedenza contiene il genere selezionato nella tendina
                $(this).toggle(percorso_text.includes(genere_selezionato) != false);
            })
        }
    }
    // Funzione che crea il filtro per visualizzare solo i film o solo le serie TV in base al tipo
    function filtroTipo(tipo, select_uno, select_due, select_tre, select_quattro) {
        // Verifico se il campo tipo della card contiene la parola Film. Il metodo toggle () nasconde la card che non contiene come tipo la parola Film.
        $('.film').filter(function(){
            // Memorizzo nella variabile percorso il selettore del tipo in cui cercare
            var percorso = $(this).children('.flip-box-inner').children('.card-img-overlay').children('.tipo');
            $(this).toggle(percorso.text().indexOf(tipo) > -1);
        })
        // Nascondo la select dei generi (dei Film o delle serie TV in base ai valori passati)
        $('#' + select_due).removeClass('visibile');
        // Nascondo la select dei voti (dei Film o delle serie TV in base ai valori passati)
        $('#' + select_tre).removeClass('visibile');
        // Resetto la select_uno impostando la selezione sulla prima voce
        $('#' + select_uno).prop('selectedIndex',0);
        // Resetto la select_tre impostando la selezione sulla prima voce
        $('#' + select_quattro).prop('selectedIndex',0);
        // Rendo visibile la select dei generi (dei Film o delle serie TV in base ai valori passati)
        $('#' + select_uno).addClass('visibile');
    }

    // Funzione che controlla se  viene selezionata o meno la lingua proseguendo in caso positivo la ricerca dell'input inserito dall'utenteper la ricerca di un film
    function checkLingua(testo_ricerca) {
        // Controllo se è stata selezionata una lingua
        if ($('#scelta_lingua').val() != '') {
            // Aggiorno la variabile del linguaggio che sarà un parametro nella ricerca Ajax
            linguaggio = $('#scelta_lingua').val();
            // Chiamo la funzione che controlla il teso inserito nella barra di ricerca
            checkTesto($('.cerca_film').val());
        } else {
            alert('Selezionare una lingua, prima di effettuare la ricerca')
        }
        // Resetto la select della linguaimpostando la selezione sulla prima voce
        $('#scelta_lingua').prop('selectedIndex',0);
    }

    // Funzione che  prende il testo in input e lo controlla chiamando le relative funzioni se il testo è correttamente valorizzato
    function checkTesto(testo_ricerca) {
        // Controllo se è stato inserito il testo nella barra di ricerca
        if (testo_ricerca.length != 0) {
            // Chiamo la funzione che mi restituisce il numero di pagine di risultati del film cercato
            var risultato_pagine_film = numPagine(testo_ricerca, urlfilm);
            // Chiamo la funzione che mi restituisce il numero di pagine di risultati del film cercato
            var risultato_pagine_serie = numPagine(testo_ricerca, urltv);
            // Attendo che le due funzioni numPagine finiscono
            $.when(risultato_pagine_film, risultato_pagine_serie).done(function(){
                // Controllo se la ricerca dei film e delle serie non restituisce risultati
                if (risultati_film == false && risultati_serie == false) {
                        alert('Nessun risultato trovato per la ricerca inserita: ' + testo_ricerca);
                }
            });
        } else {
            alert('Inserisci la query di ricerca');
        }
    }

    // Funzione che restituisce il numero totale di pagine di una ricerca di un film e di una serie TV
    function numPagine(testo_ricerca, url_suffisso) {
            return $.ajax({
                url: api_url_base + url_suffisso,
                'data': {
                    'api_key': api_key,
                    'query': testo_ricerca,
                    'language': 'it-IT'
                },
                method: 'GET',
                success: function(data) {
                    if (data.total_pages > 0) {
                        if (url_suffisso == 'search/movie') {
                            risultati_film = true;
                            pagine_film = data.total_pages;
                            // Chiamo la funzione che mi restituisce i film in base all' input nella searchbar
                            cercaFilm(testo_ricerca, url_suffisso, pagine_film, pagina_film);
                        } else {
                            risultati_serie = true;
                            pagine_serie = data.total_pages;
                            // Chiamo la funzione che mi restituisce le serie tv in base all' input nella searchbar
                            cercaFilm(testo_ricerca, url_suffisso, pagine_serie, pagina_serie);
                        }
                    } else {
                        if (url_suffisso == 'search/movie') {
                            risultati_film = false;
                        } else {
                            risultati_serie = false;
                        }
                    }
                },
                error: function() {
                    alert('Qualcosa non ha funzionato');
                }
            });
    }

    // Funzione per ricercare un film o una serie tv (in base alla variabile url) inserito nella barra di ricerca interrogando la relativa API
    function cercaFilm(testo_ricerca, url_suffisso, pagine_totali, pagina) {
        $.ajax({
            url: api_url_base + url_suffisso,
            'data': {
                'api_key': api_key,
                'query': testo_ricerca,
                'page' : pagina,
                'language': linguaggio
            },
            method: 'GET',
            success: function(data) {
                // Controlla se la chiamata restituisce qualche risultato
                if(data.total_results > 0) {
                    // Faccio scomparire la label del filtro della lingua
                    $('#language').removeClass('visibile');
                    // Faccio scomparire il filtro della lingua
                    $('#scelta_lingua').removeClass('visibile');
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
                        //alert('Nessun risultato trovato per i film ' + testo_ricerca);
                    } else { // Serie tv non trovate
                        // Faccio scomparire il filtro di ricerca per le serie tv
                        $('#filtro_serie').removeClass('visibile');
                        //alert('Nessun risultato trovato per le serie tv ' + testo_ricerca);
                    }
                }
            },
            error: function() {
                alert('Error');
            },
            complete: function() {
                if (url_suffisso == 'search/movie') {
                    // Incremento la pagina
                    pagina_film++;
                    if (pagina_film <= pagine_totali) {
                        cercaFilm(testo_ricerca, url_suffisso, pagine_totali, pagina_film);
                    } else {
                        // Inzializzo di nuovo la pagina al valore di default
                        pagina_film = 1;
                    }
                } else {
                    pagina_serie++;
                    if (pagina_serie <= pagine_totali) {
                        cercaFilm(testo_ricerca, url_suffisso, pagine_totali, pagina_serie);
                    } else {
                        // Inzializzo di nuovo la pagina al valore di default
                        pagina_serie = 1;
                    }
                }
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
                    punteggio: punteggio,
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

    // Funzione che lancia la chiamata ajax alle API per trovare la lista delle lingue (ISO 639-1 tags) utilizzate in tutto TMDb.
    function apiLingua(url_linguaggi) {
        $.ajax({
            url: api_url_base + url_linguaggi,
            'data': {
                'api_key': api_key,
            },
            method: 'GET',
            success: function(data_linguaggi){
                    var lingue = data_linguaggi;
                    creaListaLingue(lingue);
            },
            error: function() {
                alert('Nessun cast trovato');
            }
        });
    }

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

    // Funzione che crea la lista dei voti dei film e delle serie tv
    function creaListaVoti(lista_voti) {
            // Chiamo la funzione che mi crea la select per filtrare i voti dei film e delle serie tv
            creaSelect('voto_film', lista_voti, 'voti');
            creaSelect('voto_serie', lista_voti, 'voti');
    }

    // Funzione che crea la lista dei generi dei film e  la lista dei generi della serie tv
    function creaListaLingue(lingue) {
            // Chiamo la funzione che mi crea la select per filtrare le lingue diricerca dei film e serie tv
            creaSelect('scelta_lingua', lingue, 'linguaggi');
    }

    // Funzione che crea la lista dei generi dei film e  la lista dei generi della serie tv
    function creaListaGenere(urlgenere, generi) {
        if (urlgenere == 'genre/movie/list') {
            lista_genere_film = generi;
            // Chiamo la funzione che mi crea la select per filtrare i generi dei Film
            creaSelect('genere_film', lista_genere_film, 'film');
        } else {
            lista_genere_serie = generi;
            // Chiamo la funzione che mi crea la select per filtrare i generi delle Serie TV
            creaSelect('genere_serie', lista_genere_serie, 'film');
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
            punteggio = convertiPunti(voto);
        } else {
            punteggio = 0;
        }
        for (var i = 0; i < 5; i++) {
            if (i < punteggio) {
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
