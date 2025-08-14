export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  userId: {
    username: string;
    avatar?: string;
  };
} 