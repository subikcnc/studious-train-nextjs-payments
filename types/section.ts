export type ImageContent = {
  image: string;
  title: string;
  display_order: number;
};

export type ListItem = {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  link_title: string;
  link: string;
  display_order: number;
  product_contents: unknown | null;
  promotion_contents: unknown | null;
  image_contents: ImageContent[];
};

export type ListLink = {
  title: string;
  value: string;
  display_order: number;
};

export type SliderLink = {
  slider_item_id: number;
  link: string;
  link_name: string;
};

export type SliderItem = {
  id: number;
  display_order: number;
  display_type: string;
  title: string;
  description: string;
  subtitle: string;
  link: SliderLink[];
  is_active: number;
  image: string | null;
  image_title: string | null;
  video_url: string | null;
};

export type SeoData = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  image_alt: string | null;
  image: string | null;
};

export type ListSection = {
  head: ListItem;
  body: ListItem[];
};

export type TypeConfigItem = {
  id: number;
  main: string;
  body: string;
  display_order: number;
  position: string;
  stars: number;
  image: string;
};

export type SectionContent = {
  id: number;
  section_name: string;
  section_index: number;
  title: string;
  subtitle: string;
  is_active: number;
  display_order: number;
  descriptions: { description: string }[];
  product_contents: unknown;
  promotion_contents: unknown;
  image_contents: ImageContent[];
  slider_contents: SliderContent[];
  list_links: ListLink[];
  list_videos: { title: string; value: string }[];
  lists: ListSection[];
  type_config_data: TypeConfigItem[];
};
type SliderContent = {
  id: number;
  name: string;
  items: SliderItem[];
};
export type SectionData = {
  id: number;
  name: string;
  section_contents: SectionContent[];
  seo: SeoData;
};

export type ApiResponse<T = unknown> = {
  status: boolean;
  message: string | null;
  errors: Record<string, string[]> | null;
  data: T | null;
};