export type ExperienceSummary = {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  description: string;
};

export type GuideDashboard = {
  experiences: ExperienceSummary[];
};

export type GuideProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string;
  field?: string;
  city?: string;
  area?: string;
  contact?: string;
  profileImageUrl?: string;
  social?: string;
  experiences: ExperienceSummary[];
};

export type PublicGuideProfile = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string;
  activityField?: string;
  city?: string;
  activityArea?: string;
  profileImage?: string;
  socialMedia?: Record<string, string>;
};

