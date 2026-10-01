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

export interface MoleculesSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_molecules_social_links';
  info: {
    displayName: 'SocialLink';
    icon: 'apps';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface PageComponentsEmergencyCard extends Struct.ComponentSchema {
  collectionName: 'components_page_components_emergency_cards';
  info: {
    displayName: 'EmergencyCard';
    icon: 'apps';
  };
  attributes: {
    Button: Schema.Attribute.Component<'atoms.button', false>;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }> &
      Schema.Attribute.DefaultTo<'description'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Heading'>;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface PageComponentsFooterSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_footer_sections';
  info: {
    displayName: 'FooterSection';
    icon: 'apps';
  };
  attributes: {
    brandName: Schema.Attribute.String & Schema.Attribute.Required;
    copyrightText: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    helpLabel: Schema.Attribute.String & Schema.Attribute.Required;
    phoneNumbers: Schema.Attribute.Component<
      'page-components.phone-number',
      true
    >;
    quickLinks: Schema.Attribute.Component<'page-components.quick-links', true>;
    quickLinksLabel: Schema.Attribute.String & Schema.Attribute.Required;
    socialLinks: Schema.Attribute.Component<'molecules.social-link', true>;
  };
}

export interface PageComponentsHeaderSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_header_sections';
  info: {
    displayName: 'HeaderSection';
    icon: 'apps';
  };
  attributes: {
    brandName: Schema.Attribute.String & Schema.Attribute.Required;
    callButton: Schema.Attribute.Component<'atoms.button', false> &
      Schema.Attribute.Required;
    iconLinks: Schema.Attribute.Component<'molecules.social-link', true>;
    navLinks: Schema.Attribute.Component<'page-components.quick-links', true>;
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

export interface PageComponentsPhoneNumber extends Struct.ComponentSchema {
  collectionName: 'components_page_components_phone_numbers';
  info: {
    displayName: 'PhoneNumber';
    icon: 'apps';
  };
  attributes: {
    number: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface PageComponentsQuickLinks extends Struct.ComponentSchema {
  collectionName: 'components_page_components_quick_links';
  info: {
    displayName: 'quickLinks';
    icon: 'apps';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsRegionCard extends Struct.ComponentSchema {
  collectionName: 'components_page_components_region_cards';
  info: {
    displayName: 'RegionCard';
    icon: 'apps';
  };
  attributes: {
    districts: Schema.Attribute.String & Schema.Attribute.Required;
    districtsLabel: Schema.Attribute.String & Schema.Attribute.Required;
    hotline: Schema.Attribute.String & Schema.Attribute.Required;
    hotlineLabel: Schema.Attribute.String & Schema.Attribute.Required;
    latitude: Schema.Attribute.Decimal & Schema.Attribute.Required;
    longitude: Schema.Attribute.Decimal & Schema.Attribute.Required;
    provinceName: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsRegionalCoverageSection
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_regional_coverage_sections';
  info: {
    displayName: 'regionalCoverageSection';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    RegionCard: Schema.Attribute.Component<
      'page-components.region-card',
      true
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    tagLine: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsServiceCard extends Struct.ComponentSchema {
  collectionName: 'components_page_components_service_cards';
  info: {
    displayName: 'ServiceCard';
    icon: 'apps';
  };
  attributes: {
    Button: Schema.Attribute.Component<'atoms.button', true>;
    description: Schema.Attribute.Text;
    features: Schema.Attribute.String;
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    tag: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PageComponentsServicesSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_services_sections';
  info: {
    displayName: 'ServicesSection';
    icon: 'apps';
  };
  attributes: {
    EmergencyCard: Schema.Attribute.Component<
      'page-components.emergency-card',
      false
    >;
    Heading: Schema.Attribute.Text;
    OxygenServiceCard: Schema.Attribute.Component<
      'page-components.emergency-card',
      false
    >;
    ServiceCard: Schema.Attribute.Component<
      'page-components.service-card',
      true
    >;
    SpecializedFleetCard: Schema.Attribute.Component<
      'page-components.specialized-fleet-card',
      false
    > &
      Schema.Attribute.Required;
    Subheading: Schema.Attribute.Text;
  };
}

export interface PageComponentsSpecializedFleetCard
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_specialized_fleet_cards';
  info: {
    displayName: 'SpecializedFleetCard';
    icon: 'apps';
  };
  attributes: {
    image: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
  };
}

export interface PageComponentsStatItem extends Struct.ComponentSchema {
  collectionName: 'components_page_components_stat_items';
  info: {
    displayName: 'StatItem';
    icon: 'apps';
  };
  attributes: {
    stats: Schema.Attribute.Component<'molecules.stats-and-numbers', true>;
  };
}

export interface PageComponentsStatsSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_stats_sections';
  info: {
    displayName: 'StatsSection';
    icon: 'apps';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'atoms.button': AtomsButton;
      'molecules.image': MoleculesImage;
      'molecules.social-link': MoleculesSocialLink;
      'molecules.stats-and-numbers': MoleculesStatsAndNumbers;
      'page-components.emergency-card': PageComponentsEmergencyCard;
      'page-components.footer-section': PageComponentsFooterSection;
      'page-components.header-section': PageComponentsHeaderSection;
      'page-components.hero-area': PageComponentsHeroArea;
      'page-components.phone-number': PageComponentsPhoneNumber;
      'page-components.quick-links': PageComponentsQuickLinks;
      'page-components.region-card': PageComponentsRegionCard;
      'page-components.regional-coverage-section': PageComponentsRegionalCoverageSection;
      'page-components.service-card': PageComponentsServiceCard;
      'page-components.services-section': PageComponentsServicesSection;
      'page-components.specialized-fleet-card': PageComponentsSpecializedFleetCard;
      'page-components.stat-item': PageComponentsStatItem;
      'page-components.stats-section': PageComponentsStatsSection;
    }
  }
}
