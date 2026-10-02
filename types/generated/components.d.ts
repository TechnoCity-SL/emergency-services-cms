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

export interface MoleculesFeature extends Struct.ComponentSchema {
  collectionName: 'components_molecules_features';
  info: {
    displayName: 'Feature';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MoleculesHotline extends Struct.ComponentSchema {
  collectionName: 'components_molecules_hotlines';
  info: {
    description: 'Phone line shown site-wide. Call links are built from the number.';
    displayName: 'Hotline';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
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

export interface MoleculesLabel extends Struct.ComponentSchema {
  collectionName: 'components_molecules_labels';
  info: {
    displayName: 'Label';
    icon: 'apps';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MoleculesMetric extends Struct.ComponentSchema {
  collectionName: 'components_molecules_metrics';
  info: {
    displayName: 'Metric';
    icon: 'apps';
  };
  attributes: {
    caption: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MoleculesSectionHeading extends Struct.ComponentSchema {
  collectionName: 'components_molecules_section_headings';
  info: {
    displayName: 'SectionHeading';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    tagLine: Schema.Attribute.String;
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

export interface MoleculesStep extends Struct.ComponentSchema {
  collectionName: 'components_molecules_steps';
  info: {
    displayName: 'Step';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsAlertBar extends Struct.ComponentSchema {
  collectionName: 'components_page_components_alert_bars';
  info: {
    displayName: 'AlertBar';
    icon: 'apps';
  };
  attributes: {
    message: Schema.Attribute.String & Schema.Attribute.Required;
    tag: Schema.Attribute.String;
  };
}

export interface PageComponentsContactChannels extends Struct.ComponentSchema {
  collectionName: 'components_page_components_contact_channels';
  info: {
    description: 'Hotline cards come from Global > hotlines.';
    displayName: 'ContactChannels';
    icon: 'apps';
  };
  attributes: {
    callButtonLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Call {number} Now'>;
    policyTag: Schema.Attribute.String;
    policyText: Schema.Attribute.Text;
    whatsappButton: Schema.Attribute.Component<'atoms.button', false>;
    whatsappDescription: Schema.Attribute.Text;
    whatsappTitle: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsCoordinatorsSection
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_coordinators_sections';
  info: {
    description: 'Cards come from the Coordinators collection (Show In Directory).';
    displayName: 'CoordinatorsSection';
    icon: 'apps';
  };
  attributes: {
    dutyBadge: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'24/7 On Duty'>;
    heading: Schema.Attribute.Component<'molecules.section-heading', false> &
      Schema.Attribute.Required;
    statusLabel: Schema.Attribute.String;
    whatsappLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Direct WhatsApp'>;
  };
}

export interface PageComponentsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_page_components_cta_banners';
  info: {
    description: 'Red call-to-action banner. Phone buttons come from Global > hotlines.';
    displayName: 'CtaBanner';
    icon: 'apps';
  };
  attributes: {
    badge: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
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
      }>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface PageComponentsFleetReadinessCard
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_fleet_readiness_cards';
  info: {
    displayName: 'FleetReadinessCard';
    icon: 'apps';
  };
  attributes: {
    badge: Schema.Attribute.String;
    metrics: Schema.Attribute.Component<'molecules.metric', true>;
    note: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsFooterSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_footer_sections';
  info: {
    displayName: 'FooterSection';
    icon: 'apps';
  };
  attributes: {
    availabilityLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Available Islandwide'>;
    brandName: Schema.Attribute.String & Schema.Attribute.Required;
    copyrightText: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    helpLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'24/7 Hotlines'>;
    quickLinks: Schema.Attribute.Component<'page-components.quick-links', true>;
    quickLinksLabel: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Navigation'>;
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
    Description: Schema.Attribute.Text;
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

export interface PageComponentsHubsSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_hubs_sections';
  info: {
    description: 'Cards come from the Regions collection (Show On Coverage Page).';
    displayName: 'HubsSection';
    icon: 'apps';
  };
  attributes: {
    badge: Schema.Attribute.String;
    callButtonLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Call Hub'>;
    coordinatorLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Coordinator:'>;
    heading: Schema.Attribute.Component<'molecules.section-heading', false> &
      Schema.Attribute.Required;
    unitsLabel: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Units'>;
  };
}

export interface PageComponentsPageHero extends Struct.ComponentSchema {
  collectionName: 'components_page_components_page_heros';
  info: {
    description: 'Hotline buttons come from Global > hotlines.';
    displayName: 'PageHero';
    icon: 'apps';
  };
  attributes: {
    badge: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    highlightedText: Schema.Attribute.String;
    secondaryBadge: Schema.Attribute.String;
    showHotlines: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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

export interface PageComponentsReadinessCard extends Struct.ComponentSchema {
  collectionName: 'components_page_components_readiness_cards';
  info: {
    displayName: 'ReadinessCard';
    icon: 'apps';
  };
  attributes: {
    badge: Schema.Attribute.String;
    items: Schema.Attribute.Component<'molecules.feature', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsRegionalCoverageSection
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_regional_coverage_sections';
  info: {
    description: 'Map pins and cards come from the Regions collection.';
    displayName: 'regionalCoverageSection';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    districtsLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Districts'>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    hotlineLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Hotline'>;
    selectHint: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Hover or click a region on the map'>;
    selectTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Select Area'>;
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

export interface PageComponentsServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_page_components_service_items';
  info: {
    description: 'Call button dials the chosen Global hotline.';
    displayName: 'ServiceItem';
    icon: 'apps';
  };
  attributes: {
    buttonStyle: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'neutral']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
    description: Schema.Attribute.Text;
    hotline: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageComponentsServicesListSection
  extends Struct.ComponentSchema {
  collectionName: 'components_page_components_services_list_sections';
  info: {
    displayName: 'ServicesListSection';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.Component<'molecules.section-heading', false> &
      Schema.Attribute.Required;
    services: Schema.Attribute.Component<'page-components.service-item', true>;
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
    badge: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Specialized Fleet'>;
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

export interface PageComponentsStationsSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_stations_sections';
  info: {
    description: 'Cards come from the Regions collection (Show On Contact Page).';
    displayName: 'StationsSection';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.Component<'molecules.section-heading', false> &
      Schema.Attribute.Required;
    statusLabel: Schema.Attribute.String;
    unitsLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Active Units'>;
  };
}

export interface PageComponentsStatusBar extends Struct.ComponentSchema {
  collectionName: 'components_page_components_status_bars';
  info: {
    displayName: 'StatusBar';
    icon: 'apps';
  };
  attributes: {
    highlights: Schema.Attribute.Component<'molecules.label', true>;
    liveStatus: Schema.Attribute.String & Schema.Attribute.Required;
    tagline: Schema.Attribute.String;
  };
}

export interface PageComponentsStepsSection extends Struct.ComponentSchema {
  collectionName: 'components_page_components_steps_sections';
  info: {
    displayName: 'StepsSection';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.Component<'molecules.section-heading', false> &
      Schema.Attribute.Required;
    steps: Schema.Attribute.Component<'molecules.step', true>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'atoms.button': AtomsButton;
      'molecules.feature': MoleculesFeature;
      'molecules.hotline': MoleculesHotline;
      'molecules.image': MoleculesImage;
      'molecules.label': MoleculesLabel;
      'molecules.metric': MoleculesMetric;
      'molecules.section-heading': MoleculesSectionHeading;
      'molecules.social-link': MoleculesSocialLink;
      'molecules.stats-and-numbers': MoleculesStatsAndNumbers;
      'molecules.step': MoleculesStep;
      'page-components.alert-bar': PageComponentsAlertBar;
      'page-components.contact-channels': PageComponentsContactChannels;
      'page-components.coordinators-section': PageComponentsCoordinatorsSection;
      'page-components.cta-banner': PageComponentsCtaBanner;
      'page-components.emergency-card': PageComponentsEmergencyCard;
      'page-components.fleet-readiness-card': PageComponentsFleetReadinessCard;
      'page-components.footer-section': PageComponentsFooterSection;
      'page-components.header-section': PageComponentsHeaderSection;
      'page-components.hero-area': PageComponentsHeroArea;
      'page-components.hubs-section': PageComponentsHubsSection;
      'page-components.page-hero': PageComponentsPageHero;
      'page-components.quick-links': PageComponentsQuickLinks;
      'page-components.readiness-card': PageComponentsReadinessCard;
      'page-components.regional-coverage-section': PageComponentsRegionalCoverageSection;
      'page-components.service-card': PageComponentsServiceCard;
      'page-components.service-item': PageComponentsServiceItem;
      'page-components.services-list-section': PageComponentsServicesListSection;
      'page-components.services-section': PageComponentsServicesSection;
      'page-components.specialized-fleet-card': PageComponentsSpecializedFleetCard;
      'page-components.stat-item': PageComponentsStatItem;
      'page-components.stations-section': PageComponentsStationsSection;
      'page-components.status-bar': PageComponentsStatusBar;
      'page-components.steps-section': PageComponentsStepsSection;
    }
  }
}
