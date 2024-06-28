interface BookmarkBase {
  date_added: string;
  date_last_used: string;
  date_modified: string;
  guid: string;
  id: string;
  name: string;
}

export interface BookmarkUrl extends BookmarkBase {
  type: "url";
  meta_info: {
    last_visited_desktop: string;
  };
  url: string;
}

export interface BookmarkFolder extends BookmarkBase {
  children: Bookmark[];
  type: "folder";
}

export type Bookmark = BookmarkUrl | BookmarkFolder;

export type BookmarkFile = {
  checksum: string;
  roots: Record<string, BookmarkFolder>;
  sync_metadata: string;
  version: number;
};

export type BookmarkData = {
  id: string;
  name: string;
  folderPath: string[];
  fullPath: string[];
  url: string;
};

export type Browser = ExtensionPreferences["defaultBrowser"];
