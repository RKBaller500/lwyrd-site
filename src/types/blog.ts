export type BusinessType = "startup" | "individual" | "small_business" | "other";
export type BusinessFocus =
  | "fintech"
  | "healthcare"
  | "real_estate"
  | "e_commerce"
  | "saas"
  | "manufacturing"
  | "nonprofits"
  | "other";
export type ContentType = "news" | "advice" | "general";
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
