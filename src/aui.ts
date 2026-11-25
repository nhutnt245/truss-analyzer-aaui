// AtomicAUI class lists, copied whole from the standard recipes (references/standard/recipes.json, release 7.0.9).
// Never edit a list or build one from pieces: a state picks between two whole lists (AUI-04, AUI-09).
const STATEFUL = 'aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame';

export const AUI = {
  // layout
  page: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden',
  panes: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden',
  pane: 'aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill',
  paneSide: 'aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-width-320 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-none',
  paneList: 'aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-width-352 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-none',
  paneResults: 'aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-width-320 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-none',
  paneHeader: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none',
  paneTitle: 'aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3',
  paneScroll: 'aui-view-scroll-area aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill',
  paneViewport: 'aui-view-scroll-area-viewport',
  paneCard: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-display-flex aui-flex-direction-column aui-overflow-hidden',
  paneFill: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden',
  panel: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-flex-none',
  stack: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column aui-flex-none',
  row: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center',
  toolbar: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface-alt aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center aui-flex-none',
  // top bar (edge to edge)
  topBar: 'aui-menubar aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-radius-start-start-none aui-radius-start-end-none aui-radius-end-start-none aui-radius-end-end-none aui-flex-none',
  topNav: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-4 aui-display-flex aui-align-items-center aui-flex-none',
  topSpacer: 'aui-menubar-spacer',
  rowFill: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-stretch aui-flex-fill aui-min-height-0 aui-min-width-0',
  rowBetween: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-align-items-center aui-justify-content-between aui-flex-none',
  stackFill: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-flex-direction-column aui-flex-fill aui-min-height-0 aui-min-width-0 aui-overflow-y-auto',
  stackSide: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-352 aui-display-flex aui-flex-direction-column aui-flex-none aui-min-height-0 aui-overflow-y-auto',
  stackList: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-384 aui-display-flex aui-flex-direction-column aui-flex-none aui-min-height-0 aui-overflow-y-auto',
  stackInput: 'aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-384 aui-display-flex aui-flex-direction-column aui-flex-none aui-min-height-0 aui-overflow-y-auto',
  panelSelected: 'aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-tonal-primary aui-frame--inset aui-elevation-0 aui-flex-none',
  // text
  heading: 'aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-margin-0 aui-typography-typescale-l3',
  text: 'aui-frame aui-scale-no-padding-sm aui-bg-transparent',
  // buttons
  button: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0`,
  buttonMain: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0`,
  buttonQuiet: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface-alt aui-elevation-0`,
  link: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-raised aui-elevation-0 aui-text-decoration-none`,
  linkSelected: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0 aui-text-decoration-none`,
  buttonRaised: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-raised aui-elevation-0`,
  buttonRaisedSelected: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0`,
  iconButton: `${STATEFUL} aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0`,
  iconWrap: 'aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft',
  icon: 'aui-icon aui-icon-size-fallback-14',
  iconButtonSelected: `${STATEFUL} aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0`,
  buttonLink: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0`,
  buttonDisabled: `${STATEFUL} aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0`,
  hidden: 'aui-display-none',
  // fields
  field: 'aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3',
  fieldLabel: 'aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface',
  fieldControl: 'aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0',
  input: 'aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0',
  bannerSuccess: 'aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0 aui-flex-none',
  bannerError: 'aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-error aui-elevation-0 aui-flex-none',
  bannerText: 'aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description',
  // chips and banners
  chipSuccess: 'aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0 aui-gap-4',
  chipInfo: 'aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-info aui-elevation-0 aui-gap-4',
  chipWarning: 'aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-warning aui-elevation-0 aui-gap-4',
  chipError: 'aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-error aui-elevation-0 aui-gap-4',
  chipNeutral: 'aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0 aui-gap-4',
  chipLabel: 'aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label',
} as const;

export const ATTR = { 'data-aui-typeface': 'engineering', 'data-aui-typography': 'body' } as const;

// table (table-display recipe)
export const TBL = {
  table: 'aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0',
  head: 'aui-table-scroll-fixed aui-table-scroll-header',
  headRowGroup: 'aui-table-head',
  row: 'aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0',
  th: 'aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0',
  td: 'aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0',
  scrollArea: 'aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region',
  viewport: 'aui-view-scroll-area-viewport',
  body: 'aui-table-scroll-body',
  bodyGroup: 'aui-table-body',
  rowSelected: 'aui-border-color-secondary aui-border-inline-start-width-4',
  align: { left: 'aui-text-align-left', center: 'aui-text-align-center', right: 'aui-text-align-right' },
} as const;
