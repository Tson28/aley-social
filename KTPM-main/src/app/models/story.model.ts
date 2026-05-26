export interface Story {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  imageUrl: string;
  statusText?: string;
  createdAt: string;
}
