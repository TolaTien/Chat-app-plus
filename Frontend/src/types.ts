export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avt?: string;
  createdAt?: string;
  isEmailVerified: boolean;
  oauthProviders?: {
    provider: "google" | "facebook",
    providerId: string
  }[],
  friendList?: string[];
  friendRequests?: string[] | User[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface Message {
  _id: string;
  senderId: string;
  conversationId: string;
  text?: string;
  image?: string;
  video?: string;
  file?: string;
  fileName?: string;
  seenBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  title: string | null;
  isGroup: boolean;
  participants: User[];
  groupAdmin: string | null;
  lastMessage: string;
  avt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  senderId: User;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
}

export interface AuthStoreState {
    authUser: null | User;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];

    friendRequests: FriendRequest[];
    isSearchingUsers: boolean;
    searchResults: User[];

    checkAuth: () => Promise<void>;
    signup: (data: SignupPayload) => Promise<void>;
    login: (data: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: FormData) => Promise<void>;
    searchUsers: (fullName: string) => Promise<void>;
    sendFriendRequest: (friendId: string) => Promise<void>;
    acceptFriendRequest: (friendId: string) => Promise<void>;
    rejectFriendRequest: (friendId: string) => Promise<void>;
    getFriendRequests: () => Promise<void>;
    unfriend: (friendId: string) => Promise<void>;
}