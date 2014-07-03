<?php

/**
 * Class LinkFormExtension
 *
 * Modified the HTML Editor Link Form to allow custom link tpes
 */
class LinkFormExtension extends DataExtension {

    public function updateLinkForm(Form $form)
    {
        Requirements::javascript(EDITOR_EXTENSIONS_DIR . "/javascript/linkform.js");

        $fields = $form->Fields();
        $linkType = $fields->dataFieldByName('LinkType');
        $types = $linkType->getSource();

        $types['tel'] = 'A Telephone Number';

        $linkType->setSource($types);

        $fields->insertAfter(
            new TextField('tel',_t('EditorExtensions.TELNUMBER', 'Phone Number')),
            'file'
        );

        return $form;

    }

} 