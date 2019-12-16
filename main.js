// Memorizzo in una variabile  il percorso base  delle API
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
                        numero: i + 1,
                        titolo: film[i].title,
                        titolo_originale: film[i].original_title,
                        lingua: film[i].original_language,
                        voto: film[i].vote_average
                    }
                    // Creo il template
                    var html = template_function(variabili);
                    // Lo appendo al contenitore dei dischi
                    $('.contenitore-film').append(html);
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
