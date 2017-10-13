from . import forms


class SelectMultiple(forms.SortedFilteredSelectMultiple):
    """New SelectMultiple widget which just adds an autocomplete URL to the
    base SelectMultiple widget. This makes sorted-m2m-filter-horizontal-widget
    compatible with django-autocomplete-light.
    """

    def __init__(self, url=None, *args, **kwargs):
        """Instanciate a widget with a URL."""
        self.url = url
        super().__init__(*args, **kwargs)

    def build_attrs(self, base_attrs, extra_attrs=None, name=None):
        """Build HTML attributes for the widget."""
        attrs = super().build_attrs(base_attrs, extra_attrs=None)

        attrs['id'] = 'id_' + name
        attrs['name'] = name

        if self.url is not None:
            attrs['data-autocomplete-light-url'] = '/' + self.url + '/'

        autocomplete_function = getattr(self, 'autocomplete_function', None)
        if autocomplete_function:
            attrs.setdefault('data-autocomplete-light-function',
                             autocomplete_function)
        return attrs
