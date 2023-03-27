import { User } from "src/user/models/user.interface";
import { BlogEntryEntity } from "../model/blog-entry.entity";

export interface BlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  author?: User;
  headerImage?: string;
  publishDate?: Date;
  isPublished?: boolean;
  blogEntries?: BlogEntryEntity[];
}
