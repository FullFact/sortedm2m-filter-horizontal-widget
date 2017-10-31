# django-sortedm2m-filter-horizontal-widget

``sortedm2m-filter-horizontal-widget`` is an admin widget for Gregor Mülleggers excellent django-sortedm2m library.

django-sortedm2m: http://github.com/gregmuellegger/django-sortedm2m

This allows for a familiar filter horizontal widget.

This version also incorporates django-autocomplete-light, so that the widget can be used for fields with many (~1000) options without significantly slowing down the page.

dal: http://django-autocomplete-light.readthedocs.io/en/master/tutorial.html


## How it works

It's an integration of django-sortedm2m-filter-horizontal-widget and django-autocomplete-light.

[dal](http://django-autocomplete-light.readthedocs.io/en/master/tutorial.html) works by making an API available with the options you can choose from for that field. When you type in the search box the options you get back are filtered according to the search.

I have combined that approach with django-sortedm2m-filter-horizontal-widget, so instead of pre-rendering all the available options (which is a _big_ speed issue if there are 4000 options and the widget is used multiple times on the page) it fetches results from the API when you click/type in the search box.


## Installation

This isn't in any way properly released, and currently can't really be used in conjunction with the original sortedm2m-filter-horizontal-widget.

That said, to install it:

`pip install -e git+git://github.com/FullFact/sortedm2m-filter-horizontal-widget.git#egg=django-sortedm2m-filter-horizontal-widget`

It also relies on django-autocomplete-light, so that needs to be installed too:

`pip install django-autocomplete-light`


## Versions

**This version has only been tested with Django 1.11 and Python 3.4**.


## Usage

Add `sortedm2m_filter_horizontal_widget` to your `INSTALLED_APPS` (needed for static files), and add these at the top of your installed apps (above `django.contrib.admin`) 

```python
'dal',
'dal_select2',
# 'grappelli',
'django.contrib.admin',
```

### Setting up the API

First you need to create a view to serve the options, which in this basic example, taken from the dal docs, is backed by a QuerySet

```python
from dal import autocomplete

from your_countries_app.models import Country


class CountryAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated():
            return Country.objects.none()

        qs = Country.objects.all()

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs
```

To find out more about setting up different types of views see [dal's documentation](http://django-autocomplete-light.readthedocs.io/en/master/tutorial.html).

Now create a urlpattern for your view:

```python
from your_countries_app.views import CountryAutocomplete

urlpatterns = [
    url(
        r'^country-autocomplete/$',
        CountryAutocomplete.as_view(),
        name='country-autocomplete',
    ),
]
```

You should now be able to view your results at that url, add a '?q=search-term' on the end to try filtering results with different search terms.


### Using the widget for a field

You can set fields to use this widget by overriding the formfield_for_manytomany method on the relevant admin class:

For one field:

```python
from sortedm2m_filter_horizontal_widget.forms import SortedFilteredSelectMultiple


class WorldAdmin(admin.ModelAdmin):
    # ...

    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        if db_field.name == 'country':
            kwargs['widget'] = SelectMultiple(url='country-autocomplete')
        return super().formfield_for_manytomany(db_field, request, **kwargs)
```

For more than one, fetching results from different views:

```python
from sortedm2m_filter_horizontal_widget.widgets import SelectMultiple


class WorldAdmin(admin.ModelAdmin):
    # ...

    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        sortedm2m_fields = ['country_1', 'country_2', 'ocean']
        if db_field.name in sortedm2m_fields:
            if db_field.name == 'ocean':
                kwargs['widget'] = SelectMultiple(url='ocean-autocomplete')
            else:
                kwargs['widget'] = SelectMultiple(url='country-autocomplete')
        return super().formfield_for_manytomany(db_field, request, **kwargs)
```


### Bit of a hack that can drastically improve performance in certain cases

If you have a singleton model with only one instance, you can do something like this, which explicitly gets the options that are currently selected for the field, and uses them to populate the widget:

```python
def formfield_for_manytomany(self, db_field, request=None, **kwargs):
    if db_field.name == 'country':
        country = models.Country.get()
        selected_choices = getattr(country, db_field.name).all()
        kwargs['widget'] = sortedm2m_filter_horizontal_widget.widgets.SelectMultiple(choices=selected_choices, url='country-autocomplete')
    return super().formfield_for_manytomany(db_field, request, **kwargs)
```

By default the widget queries the db for *all* available options for the field. With this version of the widget you don't actually need all options, you just need *selected* options to start with, the rest come later. If you pass a `choices` argument then it cuts out unnecessary queries and speeds things up.

If you omit the `choices` argument then it defaults to querying for all available options.
