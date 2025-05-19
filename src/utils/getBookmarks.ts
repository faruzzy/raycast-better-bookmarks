import { homedir } from "os";
import { Bookmark, BookmarkData, BookmarkFile, Browser } from "../types";
import { getPreferenceValues } from "@raycast/api";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

const BROWSER_PATHS: Record<Browser, string> = {
  chrome: "Google/Chrome",
  brave: "BraveSoftware/Brave-Browser",
};

function getBookmarkData(
  currPath: string[],
  bookmark: Bookmark,
): BookmarkData[] {
  const newPath = [...currPath, bookmark.name];

  if (bookmark.type === "url") {
    return [
      {
        id: bookmark.guid,
        name: bookmark.name,
        folderPath: currPath,
        url: bookmark.url,
        fullPath: newPath,
      },
    ];
  }

  return bookmark.children.flatMap((child) => getBookmarkData(newPath, child));
}

/**
 * Gets all the bookmark files.
 * The default location is found within <browser-path>/Default
 * Additional Chrome profiles are stored in: <browser-path>/Profile <number>
 */
function findChromiumDirectories(basePath: string): string[] {
  const entries = readdirSync(basePath);

  return entries
    .map((entry) => ({ entry, fullPath: path.join(basePath, entry) }))
    .filter(
      ({ entry, fullPath }) =>
        statSync(fullPath).isDirectory() &&
        (entry === "Default" || entry.startsWith("Profile ")),
    )
    .map(({ fullPath }) => fullPath);
}

function loadBookmarkFiles(browser: Browser): BookmarkFile[] {
  const basePath = path.join(
    homedir(),
    "Library",
    "Application Support",
    BROWSER_PATHS[browser],
  );

  return findChromiumDirectories(basePath)
    .map((currentDir) => path.join(currentDir, "Bookmarks"))
    .map(
      (filePath) =>
        JSON.parse(readFileSync(filePath, "utf8").toString()) as BookmarkFile,
    );
}

export default function getBookmarks(): BookmarkData[] {
  const { defaultBrowser } = getPreferenceValues<Preferences>();
  const loadResult = loadBookmarkFiles(defaultBrowser);

  return loadResult.flatMap(({ roots }) =>
    Object.values(roots).flatMap(({ children }) =>
      children.flatMap((bookmark) => getBookmarkData([], bookmark)),
    ),
  );
}
