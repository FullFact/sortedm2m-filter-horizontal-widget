var OrderedSelectBox = {
    cache: new Object(),
    init: function(id) {
    },
    filter: function(id, text) {
        // Redisplay the HTML select box, displaying only the choices containing ALL
        // the words in text. (It's an AND search.)
        var item = $('#' + id);
        item.find('option').each(function() {
        if ($(this).val() == filter) {
            $(this).show();
        } else {
            $(this).hide();
        }
        })
    },
    move: function(from, to) {
        var from_box = $('#' + from);
        var to_box = $('#' + to);
        var option;
        
        from_box.find('option:selected').each(function(){

          if (to_box.children().length){
            $(this).insertBefore(to_box.children().last());
          } else {
             to_box.append($(this))
          }
         });
    },
    move_all: function(from, to) {
        var from_box = $('#' + from);
        var to_box = $('#' + to);
        var option;
        
        from_box.find('option').each(function(){

          if (to_box.children().length){
              console.log("yesss")
            $(this).insertBefore(to_box.children().last());
          } else {
             to_box.append($(this))
          }
         });
    },
    sort: function(id) {
        OrderedSelectBox.cache[id].sort( function(a, b) {
            a = a.text.toLowerCase();
            b = b.text.toLowerCase();
            try {
                if (a > b) return 1;
                if (a < b) return -1;
            }
            catch (e) {
                // silently fail on IE 'unknown' exception
            }
            return 0;
        } );
    },
    orderUp: function(id) {
      $('#' + id).find('option:selected').each(function(){
          $(this).insertBefore($(this).prev());
      });

    },
    orderDown: function(id) {

      $('#' + id).find('option:selected').each(function(){
       $(this).insertAfter($(this).next());
      });

    },
    select_all: function(id) {
        var box = document.getElementById(id);
        for (var i = 0; i < box.options.length; i++) {
            box.options[i].selected = 'selected';
        }
    }
};

// Overwrite dissmissAddAnotherPopup so the added item gets inserted in our OrderedSelectBox
if (window.showAddAnotherPopup) {
    var django_dismissAddAnotherPopup = window.dismissAddRelatedObjectPopup;
    window.dismissAddRelatedObjectPopup = function (win, newId, newRepr) {
        // newId and newRepr are expected to have previously been escaped by
        // django.utils.html.escape.

        var name = windowname_to_id(win.name);
        var elem = document.getElementById(name);
        if (elem) {
            var elemName = elem.nodeName.toUpperCase();
            if (elemName == 'SELECT') {
                var o = new Option(newRepr, newId);
                elem.options[elem.options.length] = o;
                o.selected = true;
            } else if (elemName == 'INPUT') {
                if (elem.className.indexOf('vManyToManyRawIdAdminField') != -1 && elem.value) {
                    elem.value += ',' + newId;
                } else {
                    elem.value = newId;
                }
            }
        } else {
            var toId = name + "_to";
            elem = document.getElementById(toId);
            var o = new Option(newRepr, newId);
            OrderedSelectBox.add_to_cache(toId, o);
            OrderedSelectBox.redisplay(toId);
        }
        win.close();
    };
}