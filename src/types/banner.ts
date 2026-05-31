export interface BannerImage {
  _id: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface BannerMedia {
  _id?: string;
  url:    string;
  format?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  placement: "hero" | "promotional" | "sub_banner";
  mediaType:    "image" | "video";
  desktopImage: BannerImage | null;
  mobileImage:  BannerImage | null;
  desktopVideo: BannerMedia | null;
  mobileVideo:  BannerMedia | null;
  ctaText:          string;
  ctaLink:          string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  textColor:       string;
  overlayOpacity:  number;
  objectPosition?: string;   // e.g. "center", "top", "50% 20%"
  campaign:       string;
  displayOrder:   number;
  startsAt: string | null;
  endsAt:   string | null;
}

export interface BannerState {
  hero:        Banner[];
  promotional: Banner[];
  sub_banner:  Banner[];
  loading:     boolean;
  error:       string | null;
}
