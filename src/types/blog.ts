export type BusinessType = "startup" | "individual" | "small_business";
export type BusinessFocus =
  | "fintech"
  | "healthcare"
  | "real_estate"
  | "e_commerce"
  | "saas"
  | "manufacturing"
  | "nonprofits";
export type ContentType = "news" | "advice";
export type PostStatus = "draft" | "published";

export interface BlogAuthor {
  name: string;
  title?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: BlogAuthor;
  publishedAt: string;
  category: ContentType;
  businessTypes: BusinessType[];
  businessFocus: BusinessFocus[];
  isEditorsPick: boolean;
  isWeeklyIntake: boolean;
  readTimeMinutes: number;
  thumbnailAccent: string;
  thumbnailImage?: string;
  status?: PostStatus;
  updatedAt?: string;
}

export interface BlogFilters {
  businessType: BusinessType | null;
  businessFocus: BusinessFocus | null;
  contentType: ContentType | null;
  sortOrder: "newest" | "oldest";
  editorsPicksOnly: boolean;
}
