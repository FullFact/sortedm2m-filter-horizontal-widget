var OrderedSelectBox = {
  cache: new Object(),
  init: function(id) {
  },
  filter: function(id, text) {
    // Redisplay the HTML select box, displaying only the choices containing ALL
    // the words in text. (It's an AND search.)
    var item = django.jQuery('#' + id);
    item.find('option').each(function() {
      if (django.jQuery(this).text().indexOf(text) != -1) {
        django.jQuery(this).show();
      } else {
        django.jQuery(this).hide();
      }
    })
  },
  move: function(from, to) {
    var from_box = django.jQuery('#' + from);
    var to_box = django.jQuery('#' + to);
    var option;
    from_box.find('option:selected').each(function() {
      var that = this;
      sort = django.jQuery(this).attr("data-sort-value");
      // if we have a data-sort-value then scan the until
      // we find the right place
      var inserted;
      if (sort) {
        django.jQuery.each(to_box.children(), function(index, child) {
          if (child.getAttribute("data-sort-value") > sort ) {
            inserted = true;
            django.jQuery(that).insertBefore(to_box.children()[index]);
            return false;
          }
        });
      }
      if (!inserted) {
        if (to_box.children().length){
          django.jQuery(this).insertAfter(to_box.children().last());
        } else {
           to_box.append(django.jQuery(this));
        }
      }
    });
  },
  move_all: function(from, to) {
    var from_box = django.jQuery('#' + from);
    var to_box = django.jQuery('#' + to);
    var option;

    from_box.find('option').each(function(){
      if (to_box.children().length){
        django.jQuery(this).insertBefore(to_box.children().last());
      } else {
         to_box.append(django.jQuery(this));
      }
     });
  },
  orderUp: function(id) {
    django.jQuery('#' + id).find('option:selected').each(function(){
      django.jQuery(this).insertBefore(django.jQuery(this).prev());
    });

  },
  orderDown: function(id) {
    django.jQuery('#' + id).find('option:selected').each(function(){
      django.jQuery(this).insertAfter(django.jQuery(this).next());
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