export type PageType =
  | 'home'
  | 'getting-started'
  | 'architecture'
  | 'docs'
  | 'changelog'
  | 'devtools'
  | 'examples';

export interface PageContent {
  pageType: PageType;
  title: string;
  description: string;
}
