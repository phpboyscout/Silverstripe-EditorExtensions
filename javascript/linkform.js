(function($) {
    $.entwine('ss', function ($) {

        /**
         * Inserts and edits links in an html editor, including internal/external web links,
         * links to files on the webserver, email addresses, and anchors in the existing html content.
         * Every variation has its own fields (e.g. a "target" attribute doesn't make sense for an email link),
         * which are toggled through a type dropdown. Variations share fields, so there's only one "title" field in the form.
         */
        $('form.htmleditorfield-linkform').entwine({
            // TODO Entwine doesn't respect submits triggered by ENTER key

            /**
             * @return Object Keys: 'href', 'target', 'title'
             */
            getLinkAttributes: function () {
                var href, target = null, anchor = this.find(':input[name=Anchor]').val();

                // Determine target
                if (this.find(':input[name=TargetBlank]').is(':checked')) target = '_blank';

                // All other attributes
                switch (this.find(':input[name=LinkType]:checked').val()) {
                    case 'internal':
                        href = '[sitetree_link,id=' + this.find(':input[name=internal]').val() + ']';
                        if (anchor) href += '#' + anchor;
                        break;

                    case 'anchor':
                        href = '#' + anchor;
                        break;

                    case 'file':
                        href = '[file_link,id=' + this.find(':input[name=file]').val() + ']';
                        target = '_blank';
                        break;

                    case 'email':
                        href = 'mailto:' + this.find(':input[name=email]').val();
                        target = null;
                        break;
                    case 'tel':
                        href = 'tel:' + this.find(':input[name=tel]').val();
                        target = null;
                        break;

                    // case 'external':
                    default:
                        href = this.find(':input[name=external]').val();
                        // Prefix the URL with "http://" if no prefix is found
                        if (href.indexOf('://') == -1) href = 'http://' + href;
                        break;
                }

                return {
                    href: href,
                    target: target,
                    title: this.find(':input[name=Description]').val()
                };
            },

            /**
             * Return information about the currently selected link, suitable for population of the link form.
             *
             * Returns null if no link was currently selected.
             */
            getCurrentLink: function () {
                var selectedEl = this.getSelection(),
                    href = "", target = "", title = "", action = "insert", style_class = "";

                // We use a separate field for linkDataSource from tinyMCE.linkElement.
                // If we have selected beyond the range of an <a> element, then use use that <a> element to get the link data source,
                // but we don't use it as the destination for the link insertion
                var linkDataSource = null;
                if (selectedEl.length) {
                    if (selectedEl.is('a')) {
                        // Element is a link
                        linkDataSource = selectedEl;
                        // TODO Limit to inline elements, otherwise will also apply to e.g. paragraphs which already contain one or more links
                        // } else if((selectedEl.find('a').length)) {
                        // 	// Element contains a link
                        // 	var firstLinkEl = selectedEl.find('a:first');
                        // 	if(firstLinkEl.length) linkDataSource = firstLinkEl;
                    } else {
                        // Element is a child of a link
                        linkDataSource = selectedEl = selectedEl.parents('a:first');
                    }
                }
                if (linkDataSource && linkDataSource.length) this.modifySelection(function (ed) {
                    ed.selectNode(linkDataSource[0]);
                });

                // Is anchor not a link
                if (!linkDataSource.attr('href')) linkDataSource = null;

                if (linkDataSource) {
                    href = linkDataSource.attr('href');
                    target = linkDataSource.attr('target');
                    title = linkDataSource.attr('title');
                    style_class = linkDataSource.attr('class');
                    href = this.getEditor().cleanLink(href, linkDataSource);
                    action = "update";
                }

                if (href.match(/^tel:(.*)$/)) {
                    return {
                        LinkType: 'tel',
                        tel: RegExp.$1,
                        Description: title
                    };
                } else if (href.match(/^mailto:(.*)$/)) {
                    return {
                        LinkType: 'email',
                        email: RegExp.$1,
                        Description: title
                    };
                } else if (href.match(/^(assets\/.*)$/) || href.match(/^\[file_link\s*(?:\s*|%20|,)?id=([0-9]+)\]?(#.*)?$/)) {
                    return {
                        LinkType: 'file',
                        file: RegExp.$1,
                        Description: title,
                        TargetBlank: target ? true : false
                    };
                } else if (href.match(/^#(.*)$/)) {
                    return {
                        LinkType: 'anchor',
                        Anchor: RegExp.$1,
                        Description: title,
                        TargetBlank: target ? true : false
                    };
                } else if (href.match(/^\[sitetree_link(?:\s*|%20|,)?id=([0-9]+)\]?(#.*)?$/i)) {
                    return {
                        LinkType: 'internal',
                        internal: RegExp.$1,
                        Anchor: RegExp.$2 ? RegExp.$2.substr(1) : '',
                        Description: title,
                        TargetBlank: target ? true : false
                    };
                } else if (href) {
                    return {
                        LinkType: 'external',
                        external: href,
                        Description: title,
                        TargetBlank: target ? true : false
                    };
                } else {
                    // No link/invalid link selected.
                    return null;
                }
            }
        });
    });
})(jQuery);