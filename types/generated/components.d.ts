import type { Schema, Struct } from '@strapi/strapi';

export interface AtomsButton extends Struct.ComponentSchema {
  collectionName: 'components_atoms_buttons';
  info: {
    displayName: 'Button';
    icon: 'apps';
  };
  attributes: {
    IconLeft: Schema.Attribute.String;
    IconRight: Schema.Attribute.String;
    Text: Schema.Attribute.String;
    Url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MoleculesImage extends Struct.ComponentSchema {
  collectionName: 'components_molecules_images';
  info: {
    displayName: 'Image';
    icon: 'apps';
  };
  attributes: {
    Alt: Schema.Attribute.String;
    DesktopImage: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    MobileImage: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    Url: Schema.Attribute.String;
  };
}

export interface MoleculesStatsAndNumbers extends Struct.ComponentSchema {
  collectionName: 'components_molecules_stats_and_numbers';
  info: {
    displayName: 'StatsAndNumbers';
    icon: 'apps';
  };
  attributes: {
    Stat: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    StatDescription: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsHeroArea extends Struct.ComponentSchema {
  collectionName: 'components_page_components_hero_areas';
  info: {
    displayName: 'Hero Area';
    icon: 'apps';
  };
  attributes: {
    Header: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Compassionate Care in Urgent Moments.'>;
    HeroImage: Schema.Attribute.Component<'molecules.image', false> &
      Schema.Attribute.Required;
    HeroStats: Schema.Attribute.Component<'molecules.stats-and-numbers', true>;
    HighlightedCharactors: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Urgent Moments.'>;
    PrimaryButton: Schema.Attribute.Component<'atoms.button', false>;
    SecondaryButton: Schema.Attribute.Component<'atoms.button', false>;
    TagLine: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }> &
      Schema.Attribute.DefaultTo<'24/7 National Emergency Hotline'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'atoms.button': AtomsButton;
      'molecules.image': MoleculesImage;
      'molecules.stats-and-numbers': MoleculesStatsAndNumbers;
      'page-components.hero-area': PageComponentsHeroArea;
    }
  }
}
