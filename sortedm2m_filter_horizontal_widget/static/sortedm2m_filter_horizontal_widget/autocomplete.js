var fieldName = 'id_debate_1_content'

$('#' + fieldName + '_input').focus(function(e) {
    var searchField = $(e.currentTarget);
    var url = searchField.attr("data-autocomplete-light-url");

    var resultsShowing = $(fieldName + '_results').length > 0;
    if (!resultsShowing) {
        $.getJSON( url, function( data ) {
            var searchResultsBox = $(document.createElement('div'))
                .addClass('search-results')
                .attr('id', fieldName + '_results');

            data.results.forEach(function(content) {
                var result = $(document.createElement('option')).text(content.text);
                result.attr('value', content.id);
                searchResultsBox.append(result);
            });
            console.log(searchResultsBox);
            searchField.after(searchResultsBox);
        });
    }
});
