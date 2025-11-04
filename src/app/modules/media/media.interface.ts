export interface IArtist {
  image: string;
  name: string;
  profession: string;
  facebook: string;
  instagram: string;
  website: string;
  country: string;
  flag: string;
  is_default: boolean;
}

export interface IMedia {
  artists: IArtist[];
  image: string;
  slug: string;
  home_slider: boolean;
  click: string;
  flag: string;
  status: boolean;
}
